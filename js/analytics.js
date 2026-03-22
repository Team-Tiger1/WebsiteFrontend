import {apiGet} from "./connection.js";
import {isAuthenticated} from "./auth.js";

let pieChart = null;
let lineChart = null;
let barChart = null;

/*prevents XSS*/
import {sanitise} from "./sanitise.js"


//creates the configuration for the pie chart and line graph
//This includes the labels, colours, and data (which is updated later)
const pieConfig = {
    labels: [
        "Collected",
        "No Shows",
        "Expired",
    ],
    datasets: [{
        label: "Bundles",
        data: [0, 0, 0],
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
    }]
};

const lineConfig = {
    datasets: [
        {
            label: "Collected",
            data: [],
            backgroundColor:  'rgb(255, 99, 132)',
            borderColor:  'rgb(255, 99, 132)',
            tension: 0.3,
        },

        {
            label: "No Shows",
            data: [],
            backgroundColor: 'rgb(54, 162, 235)',
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.3,
        },

        {
            label: "Expired",
            data: [],
            backgroundColor: 'rgb(255, 205, 86)',
            borderColor: 'rgb(255, 205, 86)',
            tension: 0.3,
        }
    ]
}

// Configuration for the new bar chart
const barConfig = {
    labels: ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"],
    datasets: [{
        label: "Proportion Collected",
        data: [], // Will be populated dynamically waiting for dan to create checkpoint
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
    }]
};

document.addEventListener("DOMContentLoaded", async () => {

    await isAuthenticated("VENDOR");

    const dataResponse = await apiGet("/bundles/analytics?period=day");
    const jsonData = await dataResponse.json();

    if(dataResponse.ok) {
        await Promise.all([
            renderOutline(jsonData),
            renderTables("day", jsonData)
        ])
    }

    await renderBarChart();

    //This adds an event listener to the period drop down, so that when the user changes the period, the tables and graphs are updated to reflect the new period
    const periodDropdown = document.getElementById("period-dropdown");
    periodDropdown.addEventListener("change", async () => {
       const period = periodDropdown.value;

        const dataResponse = await apiGet("/bundles/analytics?period=" + period);
        const dataJson = await dataResponse.json();
        if(dataResponse.ok) {
            await Promise.all([
                renderTables(period, dataJson),
                renderOutline(dataJson)
            ])
        }
    });
});

/*Replace this later with a call to: await apiGet("/analytics/discounts")*/
async function getDiscountData() {
    return [
        { band: "0-20%", collected: 20, notCollected: 80 },
        { band: "20-40%", collected: 50, notCollected: 50 },
        { band: "40-60%", collected: 75, notCollected: 25 },
        { band: "60-80%", collected: 90, notCollected: 10 },
        { band: "80-100%", collected: 99, notCollected: 1 }
    ];
}

/* Renders the new Bar Chart showing the proportion of collected bundles per discount band.*/
async function renderBarChart() {
    const data = await getDiscountData();

    const proportions = data.map(item => {
        const total = item.collected + item.notCollected;
        return total === 0 ? 0 : (item.collected / total);
    });

    barConfig.datasets[0].data = proportions;

    if (barChart) {
        barChart.update();
        return;
    }

    const barChartPlaceholder = document.getElementById("bar-chart");

    barChart = new Chart(barChartPlaceholder, {
        type: 'bar',
        data: barConfig,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Proportion Collected'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Discount Bands'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Collected: ' + (context.raw * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * This function renders the outline section of the analytics page, which includes the headline statistics and the pie chart
 * It makes a call to the api call to get the number of bundles collected, no shows, and expired for the selected period, and then updates the HTML elements with the new data
 * It also calls the renderPieChart function to update the pie chart with the new data
 * @param {*} data
 */
async function renderOutline(data) {
    const collected = document.getElementById("bundlesCollected");
    const noShows = document.getElementById("bundleNoShow");
    const expired = document.getElementById("bundlesExpired");
    const wasteSaved = document.getElementById("wasteSaved");

    const occurrenceMap = {
        "COLLECTED": 0,
        "NO_SHOW": 0,
        "EXPIRED": 0,
    }

    // Calculating the total weight saved by the vendor
    let totalWeightSaved = 0;

    for (let i = 0; i < data.length; i++) {
        const currentStatus = data[i].status;
        occurrenceMap[currentStatus]++;

        // Only collected bundles count as waste saved
        if (currentStatus === "COLLECTED") {
            totalWeightSaved += Number(data[i].weight) || 0;
        }
    }

    collected.textContent = occurrenceMap["COLLECTED"];
    noShows.textContent = occurrenceMap["NO_SHOW"];
    expired.textContent = occurrenceMap["EXPIRED"];
    wasteSaved.textContent = formatWeight(totalWeightSaved);

    await renderPieChart([occurrenceMap["COLLECTED"], occurrenceMap["NO_SHOW"], occurrenceMap["EXPIRED"]]);
}

/**
 * This function changes weight saved from grams to kgs
 */
function formatWeight(weightInGrams) {
    return `${(weightInGrams / 1000).toFixed(2)} kg`;
}

/**
 * This function renders the tables section of the analytics page
 * @param period
 * @param {*} data
 */
async function renderTables(period, data) {

    const collectedTable = document.getElementById("collected-table");
    const noShowsTable = document.getElementById("noshows-table");
    const expiredTable = document.getElementById("expired-table");

    //Reset HTML
    collectedTable.innerHTML = ``;
    noShowsTable.innerHTML = ``;
    expiredTable.innerHTML = ``;

    let collectedMoney = 0;
    let noShowMoney = 0;
    let expiredMoney = 0;

    let collectedGraphData = [];
    let noShowGraphData = [];
    let expiredGraphData = [];

    for (let i = 0; i < data.length; i++) {
        let currentBundle = data[i];

        if(currentBundle.status === "COLLECTED") {
            collectedGraphData.push(currentBundle);
            collectedMoney += currentBundle.amountDue;
            collectedTable.appendChild(convertBundleToHTML(currentBundle))
        }
        if(currentBundle.status === "NO_SHOW") {
            noShowGraphData.push(currentBundle);
            noShowMoney += currentBundle.amountDue;
            noShowsTable.appendChild(convertBundleToHTML(currentBundle))
        }
        if(currentBundle.status === "EXPIRED") {
            expiredGraphData.push(currentBundle);
            expiredMoney += currentBundle.amountDue;
            expiredTable.appendChild(convertBundleToHTML(currentBundle))
        }
    }

    //Load the total price labels
    const collectedMoneyLabel = document.getElementById("collected-money");
    const noShowMoneyLabel = document.getElementById("noshow-money");
    const expiredMoneyLabel = document.getElementById("expired-money");

    collectedMoneyLabel.innerText = "Revenue: £" + collectedMoney.toFixed(2);
    noShowMoneyLabel.innerText = "Loss: £" + noShowMoney.toFixed(2);
    expiredMoneyLabel.innerText = "Loss: £" + expiredMoney.toFixed(2);

    //Load Line Graph
    await renderLineGraph(period, collectedGraphData, noShowGraphData, expiredGraphData);

}
/**
 * This function renders the line graph section of the analytics page
 * @param {*} period
 * @param {*} collectedData
 * @param {*} noShowData
 * @param {*} expiredData
 */
async function renderLineGraph(period, collectedData, noShowData, expiredData) {

    collectedData = await groupLineGraphData(collectedData, period);
    noShowData = await groupLineGraphData(noShowData, period);
    expiredData = await groupLineGraphData(expiredData, period);

    lineConfig.datasets[0].data = collectedData;
    lineConfig.datasets[1].data = noShowData;
    lineConfig.datasets[2].data = expiredData;

    //convert period to unit for graph
    const timeUnit = (period) => {
        switch (period) {
            case "day": return "hour";
            case "week": return "day";
            case "month": return "day";
            case "year": return "month";
        }
    }

    if(lineChart) {
        lineChart.options.scales.x.time.unit = timeUnit(period);
        lineChart.update();
        return;
    }

    const lineGraphPlaceholder = document.getElementById("line-graph");



    lineChart = new Chart(lineGraphPlaceholder, {
        type: 'line',
        data: lineConfig,
        options: {
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: timeUnit(period),
                        displayFormats: {
                            hour: "h a",
                            day: "MMM d",
                            month: "MMM yyyy",
                        }
                    },
                    title: {
                        display: true,
                        text: "Date"
                    }
                },
                y: {
                    beginAtZero: true,
                }
            }
        }
    })
}

/**
 * Groups graph data.
 * @param {*} data
 * @param {*} period
 */
async function groupLineGraphData(data, period) {
    const total = await generatePaddingLists(period);
    const now = new Date();

    for (let i = 0; i < data.length; i++) {
        const bundle = data[i];
        const date = new Date(bundle.date);
        date.setMinutes(0, 0, 0);

        let key;

        switch(period) {
            case "day":
                const tempDate = new Date(now);
                tempDate.setHours(date.getHours(), 0, 0, 0);
                key = tempDate.toISOString();
                break;
            case "week":
                key = date.toISOString().split("T")[0]
                break;
            case "month":
                key = date.toISOString().split("T")[0];
                break;
            case "year":
                const tempYearDate = new Date(date);
                tempYearDate.setMonth(date.getMonth(), 1)
                tempYearDate.setHours(0,0,0,0);
                key = tempYearDate.toISOString();
                break;
            default:
                key = date.toISOString();

        }

        if(total[key] !== undefined) {
            total[key]++;
        }

    }

    return Object.keys(total).map(key => ({
        x: key,
        y: total[key]
    })).sort((a, b) => new Date(a.x) - new Date(b.x));
}


/**
 * This function generates a list of time units for the selected period.
 * @param {*} period
 */
async function generatePaddingLists(period) {
    const list = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch(period) {
        case "day":
            for (let i = 0; i < 24; i++) {
                const date = new Date(now);
                date.setHours(i);
                list[date.toISOString()] = 0;
            }
            break;
        case "week":
            for (let i = 6; i >= 0 ; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                list[date.toISOString().split("T")[0]] = 0;
            }
            break;
        case "month":
            for (let i = 30; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(now.getDate() - i);
                list[date.toISOString().split("T")[0]] = 0;
            }
            break;
        case "year":
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1,0,0,0,0);
                list[date.toISOString()] = 0;
            }
            break;
    }
    return list;
}

/**
 * Renders pie chart
 * @param {*} data
 */
async function renderPieChart(data) {

    pieConfig.datasets[0].data = data;

    if(pieChart) {
        pieChart.update();
        return;
    }

    const pieChartPlaceholder = document.getElementById("pie-chart");

    pieChart = new Chart(pieChartPlaceholder, {
        type: 'pie',
        data: pieConfig
    });



}

/**
 * Converts bundle to HTML row
 * @param {*} bundle
 */
function convertBundleToHTML(bundle) {
    const tr = document.createElement("tr");

    //Format Date
    const dateObject = new Date(bundle.date);
    const formattedDate = new Intl.DateTimeFormat('en-GB').format(dateObject);

    tr.innerHTML = `<td>${sanitise(bundle.bundleName)}</td>
        <td>${formattedDate}</td>
        <td>£${bundle.amountDue.toFixed(2)}</td></tr>`;
    return tr;
}