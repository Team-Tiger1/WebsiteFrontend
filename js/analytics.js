import {apiGet} from "./connection.js";
import {isAuthenticated} from "./auth.js";

let pieChart = null;
let lineChart = null;
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

document.addEventListener("DOMContentLoaded", async () => {

    await isAuthenticated("VENDOR");

    await renderOutline("day")
    await renderTables("day")
    //This adds an event listener to the period drop down, so that when the user changes the period, the tables and graphs are updated to reflect the new period
    const periodDropdown = document.getElementById("period-dropdown");
    periodDropdown.addEventListener("change", async () => {
       const period = periodDropdown.value;
       await renderTables(period);
       await renderOutline(period);
    });
});
/**
 * This function renders the outline section of the analytics page, which includes the headline statistics and the pie chart
 * It makes a call to the api call to get the number of bundles collected, no shows, and expired for the selected period, and then updates the HTML elements with the new data
 * It also calls the renderPieChart function to update the pie chart with the new data
 * @param {*} period 
 */
async function renderOutline(period) {
    const collected = document.getElementById("bundlesCollected");
    const noShows = document.getElementById("bundleNoShow");
    const expired = document.getElementById("bundlesExpired");

    const analyticsOutlineResponse = await apiGet("/bundles/metrics?period=" + period)

    if(!analyticsOutlineResponse.ok) {
        console.log("Request Failed")
    }

    const analyticsOutlineJson = await analyticsOutlineResponse.json();

    collected.textContent = analyticsOutlineJson["numCollected"];
    noShows.textContent = analyticsOutlineJson["numNoShows"];
    expired.textContent = analyticsOutlineJson["numExpired"];

    await renderPieChart([analyticsOutlineJson["numCollected"], analyticsOutlineJson["numNoShows"], analyticsOutlineJson["numExpired"]]);
}

/**
 * This function renders the tables section of the analytics page, which includes a table for each bundle outcome (collected, no show, expired)
 * It makes an api call to get the bundles for the selected period, and then iterates through the bundles and adds them to the appropriate table based on their outcome
 * It also keeps track of the total revenue/loss for each outcome, and updates the labels at the top of each table with the new totals
 * Finally, it calls the renderLineGraph function to update the line graph with the new data
 * @param {*} period 
 */
async function renderTables(period) {

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

    const analyticBundleResponse = await apiGet("/bundles/analytics?period=" + period)

    const previousBundles = await analyticBundleResponse.json();
    for (let i = 0; i < previousBundles.length; i++) {
        let currentBundle = previousBundles[i];

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
 * This function renders the line graph section of the analytics page, 
 * which shows the number of bundles collected, no shows, and expired over time for the selected period
 * 
 * 
 * @param {*} period 
 * @param {*} collectedData 
 * @param {*} noShowData 
 * @param {*} expiredData 
 * @returns 
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
 * This function takes in the bundle data for a specific outcome (collected, no show, expired) and groups it by the appropriate time unit based on the selected period (hourly for day, daily for week and month, monthly for year)
 * It first generates a list of all the time units for the selected period, and initialises the count for each unit to 0
 * 
 * 
 * @param {*} data 
 * @param {*} period 
 * @returns 
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
 * This function generates a list of time units for the selected period, and initialises the count for each unit to 0
 * @param {*} period 
 * @returns 
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
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(now.getFullYear(), now.getMonth(), i);
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
 * This function renders the pie chart section of the analytics page, which shows the proportion of bundles collected, no shows, and expired for the selected period
 * It takes in the number of bundles for each outcome, updates the pie chart configuration with the new data, and then either updates the existing chart or creates a new one if it doesn't exist
 * @param {*} data 
 * @returns 
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
 * This function takes in a bundle object and converts it to an HTML table row element, 
 * which can then be added to the table based on the bundle's outcome (collected, no show, expired)
 * 
 * @param {*} bundle 
 * @returns 
 */
function convertBundleToHTML(bundle) {
    const tr = document.createElement("tr");

    //Format Date
    const dateObject = new Date(bundle.date);
    const formattedDate = new Intl.DateTimeFormat('en-GB').format(dateObject);

    tr.innerHTML = `<td>${bundle.bundleName}</td>
        <td>${formattedDate}</td>
        <td>£${bundle.amountDue.toFixed(2)}</td></tr>`;
    return tr;
}