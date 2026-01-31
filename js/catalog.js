import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//to be used for the catalog
const vendorCarousel = document.getElementById("vendorCarousel");
const bundleCarousel = document.getElementById("bundleCarousel");
const msg = document.getElementById("msg");

/**
 * Loads the main page.
 * Checks that the user is logged in (redirect if now)
 * Loads the bundles into the bundles carousel and loads the vendors into
 * their carousel.
 */
await isAuthenticated();
await loadBundles();
await loadVendorsIntoCarousel();

/**
 * Loads the list of vendors from the backend and displays them
 * to be clickable cards so their can access each vendors page.
 * This is shown in the vendors carousel.
 * 
 * When a vendor is clicked save the vendorId in local storage 
 * then redirect to their page.
 *  
 */
async function loadVendorsIntoCarousel(){
    try{

        const response = await apiGet("/vendors");

        if(!response.ok){
            msg.textContent = "Could not get vendors";
            return;
        }

        //get vendors
        const vendors = await response.json();
        
        //clear the carousel each time in case more companies are added
        vendorCarousel.innerHTML = "";

        for (let i = 0; i < vendors.length; i++){
            //loop through each vendor and create their card in hte carousel
            const vendor = vendors[i];
            const vendorId = vendor.vendorId;
            const vendorName = vendor.vendorName;

            //creating card for carracel
            const card = document.createElement("div");
            card.className = "company"
            card.tabIndex = 0;
            card.innerHTML = `<h1>${vendorName}</h1>`
            card.addEventListener("click", function(){
                localStorage.setItem("vendorId", vendorId);
                window.location.href = "vendor.html";
            });
            vendorCarousel.appendChild(card);
        }
    } catch(err){
        console.error(err);
    }

}

/**
 * Loads the list of bundles for all vendors from the backend and displays them.
 * They are shown as cards in the bundles carousel and each have a clickable reserve button.
 * 
 */
async function loadBundles(){
    bundleCarousel.innerHTML = "";
    msg.textContent = "";

    try{
        const response = await apiGet("/bundles");

        if(!response.ok){
            msg.textContent = "Could not load the bundles"
            return;
        }
        const bundles = await response.json();

        //if no bundles found 
        if (bundles.length == 0){
            msg.textContent = "No bundles found";
            return;
        }

        for (let i = 0; i<bundles.length; i++){
            createBundleCard(bundles[i]);
        }
    } catch(error){
        console.error(error);
        msg.textContent = "network failure";
    }
}

/**
 * Creates the bundle card and adds it to the bundle carousel
 * Each card has a:
 * - bundle name
 * - price 
 * - reserve button
 * 
 * When the reserve button is clicked it calls reserveBundle(param) with the bunlde ID as the paramater
 * 
 * @param {*} bundle 
 */
function createBundleCard(bundle){
    const card = document.createElement("div");
    card.className = "bundleCard";

    //extracts the data about each bundle
    const bundleId = bundle.bundleId;
    const name = bundle.bundleName;
    const price = bundle.price;

    //creates bundle card from the data using HTML
    card.innerHTML = `
    <h3>${name}</h3>
    <p>${price !== undefined ? "£" + price : ""}</p>
    <button class="reserveBtn">Reserve</button>`;

    //the reserve button represents an event to reserve that bundle
    const btn = card.querySelector(".reserveBtn");
    btn.addEventListener("click", function(){
        reserveBundle(bundleId);
    });
    bundleCarousel.appendChild(card);
}

/**
 * Sends a reservation request to the backend enpoint when
 * the function is triggered at a click event on a bundle card
 * if the reservation succeeds it reirects to the roder page where they 
 * can see the resrevation/order information.
 * 
 * If the reservation fails an alert is shown to the user.
 * 
 * @param {*} bundleId 
 * @returns 
 */
async function reserveBundle(bundleId) {

    const reserve = await apiPost("/reservations/" + bundleId, {});

    if (!reserve.ok){
        alert("reservation failed");
        return;
    }

    window.location.href = "orders.html";
}
