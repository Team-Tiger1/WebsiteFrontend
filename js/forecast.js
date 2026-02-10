import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");

const bundleSelect = document.getElementById("bundleSelect");
const getForecastButton = document.getElementById("getForecast");
const errMsg = document.getElementById("errMsg");
const forecastResult = document.getElementById("forecastResult");

/**
 * Loads the bundles into the select dropdown so the user can select a bundle to get a forecast for.
 *
 * @returns 
 */
async function loadBundlesSelect() {
    try{
    const vendorInfo = await apiGet("/vendors/me");
    //if there is an error with the response, display an error message and return
    if (!vendorInfo.ok) {
        errMsg.textContent = "An error occurred while loading vendor details";
        bundleSelect.innerHTML = "<option value=''>No bundles available</option>";
        return;
    }
    //get the vendor and extract the vendorId, then use the vendorId to get the bundles for that vendor
    const vendor = await vendorInfo.json();
    const vendorId = vendor.vendorId;
    const response = await apiGet("/bundles/" + vendorId);
    //if there is an error with the response, display an error message and return
    if (!response.ok) {
        errMsg.textContent = "An error occurred while loading bundles.";
        bundleSelect.innerHTML = "<option value=''>No bundles available</option>";
        return;
    }
    const bundles = await response.json();

    bundleSelect.innerHTML = "<option value=''>Please choose an option</option>";
    
    //extract bundleId and bundleName from each bundle and add to select options
    for(let i = 0; i<bundles.length; i++){
        const bundle = bundles[i];
        const id = bundle.bundleId;
        const name = bundle.bundleName;
        const option = document.createElement("option");
        option.value = id;
        option.textContent = name;
        bundleSelect.appendChild(option);
    }
} catch (error) {
    errMsg.textContent = "An error occurred while loading bundles.";
    bundleSelect.innerHTML = "<option value=''>No bundles available</option>";
}
}

loadBundlesSelect();
//if a user clikcs the getForecast button, get the selected bundle and make a post request to the server to get the forecast for that bundle
getForecastButton.addEventListener("click", async () => {
    //get the selected bundle from the select element
    forecastResult.textContent = "";
    errMsg.textContent = "";
    //collects the selected
    const bundleId = bundleSelect.value;
    if(bundleId === ""){
        errMsg.textContent = "Please select a bundle.";
        return;
    }
    
    errMsg.textContent = "Loading forecast...";

    const response = await apiGet("/forecast/predict/" + bundleId);
    //if there is an error with the response, display an error message
    if(!response.ok){
        errMsg.textContent = "forecast unavailable for this bundle.";
        return;
    }

    const data = await response.json();

    //extract the forecast data from the response
    const reservationProb = data.reservation.reservation_probability;
    const reservationPred = data.reservation.reservation_prediction;
    const collectionProb = data.collection.collection_probability;
    const collectionPred = data.collection.collection_prediction;

    //display the forecast result
    forecastResult.textContent = `Reservation Probability: ${reservationProb}\nReservation Prediction: ${reservationPred}\nCollection Probability: ${collectionProb}\nCollection Prediction: ${collectionPred}`;
    errMsg.textContent = "";
});