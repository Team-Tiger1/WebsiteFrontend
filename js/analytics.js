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

// Configuration for the new bar chart (labels and data are now dynamically populated)
const barConfig = {
    labels: [],
    datasets: [{
        label: "Proportion Collected",
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
    }]
};

document.addEventListener("DOMContentLoaded", async () => {

    await isAuthenticated("VENDOR");

    const dataResponse = await apiGet("/bundles/analytics?period=year");
    const jsonData = await dataResponse.json();

    if(dataResponse.ok) {
        await Promise.all([
            renderOutline(jsonData),
            renderTables("year", jsonData)
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


/* Renders the new Bar Chart showing the proportion of collected bundles per discount band.*/
async function renderBarChart() {
    try {
        const response = await apiGet("/bundles/analytics/discount");

        if (!response.ok) {
            console.error("Failed to fetch discount analytics");
            return;
        }

        const data = await response.json();

        // Sort data by startDiscount to ensure the chart renders from 0% up to 100% in order
        data.sort((a, b) => a.startDiscount - b.startDiscount);

        // Map the backend DTO data to Chart.js arrays
        const labels = data.map(item => `${item.startDiscount}-${item.endDiscount}%`);
        const proportions = data.map(item => item.collectionRate);

        // Apply data to the chart configuration
        barConfig.labels = labels;
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
                        text: 'Collection Rate'
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
                            return 'Collection Rate: ' + (context.raw * 100).toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });

    } catch (err) {
        console.error("Network error rendering bar chart:", err);
    }
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
    const averageWeight = document.getElementById("averageWeight");
    const C02Saved = document.getElementById("C02Saved")

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
    C02Saved.textContent = formatWeight(totalWeightSaved*2.53846)
    averageWeight.textContent = ((Math.round((parseInt(totalWeightSaved)/Number(occurrenceMap["COLLECTED"]))) || 0 )+ "g");

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
    let collectedWeight = 0;
    let collectedCount = 0;
    let noShowWeight = 0;
    let noShowCount=0;
    let expiredWeight = 0;
    let expiredcount=0;

    let collectedGraphData = [];
    let noShowGraphData = [];
    let expiredGraphData = [];

    for (let i = 0; i < data.length; i++) {
        let currentBundle = data[i];

        if(currentBundle.status === "COLLECTED") {
            collectedGraphData.push(currentBundle);
            collectedMoney += currentBundle.amountDue;
            collectedTable.appendChild(convertBundleToHTML(currentBundle))
            collectedWeight += parseInt(currentBundle.weight);
            collectedCount+=1;
        }
        if(currentBundle.status === "NO_SHOW") {
            noShowGraphData.push(currentBundle);
            noShowMoney += currentBundle.amountDue;
            noShowsTable.appendChild(convertBundleToHTML(currentBundle))
            noShowWeight += parseInt(currentBundle.weight);
            noShowCount+=1;
        }
        if(currentBundle.status === "EXPIRED") {
            expiredGraphData.push(currentBundle);
            expiredMoney += currentBundle.amountDue;
            expiredTable.appendChild(convertBundleToHTML(currentBundle))
            expiredWeight += parseInt(currentBundle.weight);
            expiredcount+=1;
        }
    }

    //Load the total price labels
    const collectedMoneyLabel = document.getElementById("collected-money");
    const noShowMoneyLabel = document.getElementById("noshow-money");
    const expiredMoneyLabel = document.getElementById("expired-money");

    //Weight and average weight
    const collectedWeightLabel = document.getElementById("collected-weight");
    const collectedAverageWeightLabel = document.getElementById("collected-average-weight")

    const noshowWeightLabel=document.getElementById("noshow-weight")
    const noshowAverageWeightLabel = document.getElementById("noshow-average-weight")

    const expiredWeightLabel = document.getElementById("expired-weight");
    const expiredAverageWeightLabel = document.getElementById("expired-average-weight")

    const noshowC02Label = document.getElementById("noshow-C02")
    const expiredC02Label = document.getElementById("expired-C02")
    const collectedC02Label = document.getElementById("collected-C02")

    collectedMoneyLabel.innerText = "Revenue: £" + collectedMoney.toFixed(2);
    noShowMoneyLabel.innerText = "Loss: £" + noShowMoney.toFixed(2);
    expiredMoneyLabel.innerText = "Loss: £" + expiredMoney.toFixed(2);

    // Weight ,average weight, and C02
    collectedWeightLabel.innerText = "Total Weight: " + formatWeight(collectedWeight);
    collectedC02Label.innerText = "C02 Saved: " + formatWeight(collectedWeight* 2.53846)
    collectedAverageWeightLabel.innerText = "Avg Weight: " + (collectedCount > 0 ? (collectedWeight / collectedCount).toFixed(2) : "0.00") + " g";

    noshowWeightLabel.innerText = "Total Weight: " + formatWeight(noShowWeight);
    noshowC02Label.innerText = "C02 Wasted: " + formatWeight(noShowWeight* 2.53846)
    noshowAverageWeightLabel.innerText = "Avg Weight: " + (noShowCount > 0 ? (noShowWeight / noShowCount).toFixed(2) : "0.00") + " g";

    expiredWeightLabel.innerText = "Total Weight: " + formatWeight(expiredWeight);
    expiredC02Label.innerText = "C02 Wasted: " + formatWeight(expiredWeight* 2.53846)
    expiredAverageWeightLabel.innerText = "Avg Weight: " + (expiredcount > 0 ? (expiredWeight / expiredcount).toFixed(2) : "0.00") + " g";

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