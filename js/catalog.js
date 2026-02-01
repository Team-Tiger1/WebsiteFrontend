import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//to be used for the catalog
const vendorCarousel = document.getElementById("vendorCarousel");
const bundleCarousel = document.getElementById("bundleCarousel");
const msg = document.getElementById("msg");
const companyBundles = document.getElementById("companyBundles");

/**
 * Loads the main page.
 * Checks that the user is logged in (redirect if now)
 * Loads the bundles into the bundles carousel and loads the vendors into
 * their carousel.
 */
await isAuthenticated("USER");
await loadBundles();
await loadVendorsIntoCarousel();
await loadCompanyBundles();

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
            createBundleCard(bundles[i], bundleCarousel);
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
function createBundleCard(bundle, targetCarousel){
    const card = document.createElement("div");
    card.className = "bundleCard";

    //extracts the data about each bundle
    const bundleId = bundle.bundleId;
    const name = bundle.bundleName;
    const category = bundle.category;
    const price = bundle.price;

    //creates bundle card from the data using HTML
    card.innerHTML = `
    <h3>${name}</h3>
    <span class="category ${category}"> 
    ${category}
    </span>
    <p>${price !== undefined ? "£" + price : ""}</p>
    <button class="reserveBtn">Reserve</button>`;

    //the reserve button represents an event to reserve that bundle
    const btn = card.querySelector(".reserveBtn");
    btn.addEventListener("click", function(){
        reserveBundle(bundleId);
    });
    //append into the carousel specified
    targetCarousel.appendChild(card);
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


/**
 * Loads the company bundles for each vendor and displays them
 * in the carousel for each company
 * @returns
 */
async function loadCompanyBundles(){
    companyBundles.innerHTML = "";
    msg.textContent = "";

    const vendorResponse = await apiGet("/vendors");
    if(!vendorResponse.ok){
        msg.textContent = "Could not load company bundles";
        return;
    }
    const vendors = await vendorResponse.json();

    //get bundles for each vendor
    const bundleResponse = await apiGet("/bundles");
    if(!bundleResponse.ok){
        msg.textContent = "Could not load company bundles";
        return;
    }
    const bundles = await bundleResponse.json();
    
    //loop through each vendor and create their section
    for(let i = 0; i<vendors.length; i++){
        //create section for each vendor
        const vendorName = vendors[i].vendorName;
        const section = document.createElement("section");
        const h3 = document.createElement("h3");
        h3.textContent = vendorName;
        const carousel = document.createElement("div");
        carousel.className = "bundle-carousel";

        //add bundles for this vendor
        for (let j = 0; j<bundles.length; j++){
            const bundle = bundles[j];
            //check the name using the pattern in the bundle description
            if (bundle.bundleName && bundle.bundleName.startsWith(vendorName + " ")){
                createBundleCard(bundle, carousel);
            }
        }

        //only add section if there are bundles for this vendor
        if(carousel.children.length > 0){
            section.appendChild(h3);
            section.appendChild(carousel);
            companyBundles.appendChild(section);
        }
    }
}
