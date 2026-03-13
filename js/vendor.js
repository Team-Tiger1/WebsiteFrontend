import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("USER");

let bundleList = null;
let sortOrder = "asc"
//shows the user-friendly category name instead of the enum value stored in the database
const categoryNameMap = {
    "BREAD_BAKED_GOODS": "Bread & Baked Goods",
    "SWEET_TREATS_DESSERTS": "Sweet Treats",
    "MEAT_PROTEIN": "Meat",
    "FRUIT_VEGETABLES": "Fruit & Veg",
    "DAIRY_EGGS": "Dairy & Eggs",
    "READY_MEALS_HOT_FOOD": "Ready Meals & Hot Food",
    "SNACKS_SAVOURY_ITEMS": "Snacks",
    "BREAKFAST_ITEMS": "Breakfast",
    "VEGAN_VEGETARIAN": "Vegan & Vegetarian",
    "DRINKS_BEVERAGES": "Drinks"
};

//if the user presses the sort button, it sorts the bundles by price in either ascending or descending order depending on the current state. It then re-renders the bundles with the new order.
const sortButton = document.getElementById("sortButton");
sortButton.addEventListener("click", function (e) {
    if (bundleList == null) {
        return;
    }
    if (sortOrder === "asc") {
        bundleList.sort((a, b) => b.price - a.price);
        sortOrder = "desc"
        sortButton.innerHTML = "Sort High-Low <span>↕</span>"
    } else {
        bundleList.sort((a, b) => a.price - b.price);
        sortOrder = "asc"
        sortButton.innerHTML = "Sort Low-High <span>↕</span>"
    }
    const bundleContainer = document.getElementById("bundles-container");

    renderBundles(bundleContainer, bundleList);

})

//When the page loads, it fetches the vendor's information and bundles from the backend and populates the page with this information. 
// It also sets up event listeners for the reserve buttons and bundle drop-downs.
document.addEventListener('DOMContentLoaded', async () => {
    const vendorName = document.getElementById('vendorName');
    const vendorDescription = document.getElementById('vendorDescription');
    const phoneNumber = document.getElementById('phoneNumber');
    const emailAddress = document.getElementById('emailAddress');
    const streetAddress = document.getElementById('streetAddress');
    const postcode = document.getElementById('postcode');
    const map = document.getElementById('map');

// If there is no vendorId in local storage, redirect the user to the catalog page as they are not a vendor and should not be on this page
    const vendorId = localStorage.getItem("vendorId");
    if (vendorId == null) {
        window.location.href = "catalog.html";
        return;
    }

    let vendorResponse = await apiGet("/vendors/" + vendorId);

    if (vendorResponse.status !== 200) {
        window.location.href = "404.html";
    }
//gets the response from the backend and populates the page with the vendor's information.
    let data = await vendorResponse.json();
    //If any of the vendor's information is missing, it displays a default message instead of leaving it blank
    vendorName.textContent = data.companyName || "Unknown Company";
    vendorDescription.textContent = data.description || "";
    phoneNumber.textContent = data.phoneNumber || "Unknown Phone Number";
    emailAddress.textContent = data.email || "Unknown Email Address";
    streetAddress.textContent = data.streetAddress || "Unknown Street";
    postcode.textContent = data.postcode || "Unknown Postcode";

   //create the interactive map for the vendors location using the google maps embed API
    const srcFirstHalf = "https://maps.google.com/maps?width=100%&height=600&hl=en&q=";
    const locationURI = encodeURIComponent(data.streetAddress);
    const srcSecondHalf = "&ie=UTF8&t=&z=14&iwloc=B&output=embed";
    map.src = srcFirstHalf + locationURI + srcSecondHalf;

    //Load all bundles
    const bundleResponse = await apiGet("/bundles/" + vendorId);
    const bundleContainer = document.getElementById("bundles-container");

    if (bundleResponse.status !== 200 || bundleResponse.length === 0) {
        //Show message for no available bundles
        const noBundleMessage = `<div class="bundle">No Bundles Available</div>`
        bundleContainer.insertAdjacentHTML('afterbegin', noBundleMessage);
    }

    bundleList = await bundleResponse.json();
    renderBundles(bundleContainer, bundleList);

})
/**
 * This function takes in a list of bundles and a container element, and renders the bundles as HTML elements inside the container. 
 * It also sets up event listeners for the reserve buttons and bundle drop-downs.
 * @param {*} bundleContainer 
 * @param {*} bundleList 
 */
function renderBundles(bundleContainer, bundleList) {

    //Clear the old bundles
    bundleContainer.innerHTML = '';

    for (let i = 0; i < bundleList.length; i++) {

        const bundleJson = bundleList[i];
        const allergies = bundleJson.allergens;
        let allergyHtml = ``;
        if(allergies.length > 0){
            allergyHtml += `<div class="allergens">`;
            for (let j = 0; j < allergies.length; j++) {
                allergyHtml += `<p>${capitaliseString(allergies[j])}</p>`;
            }
            allergyHtml += `</div>`
        }

        let html =
            `
            <div class="bundle" data-id="${bundleJson.bundleId}">
                <div class="bundle-header">
                  <div class="column">
                      <div class="bundle-element">
                        <p>${sanitise(bundleJson.bundleName)}</p>
                        <p class="category ${bundleJson.category}"">${categoryNameMap[bundleJson.category]}</p>
                      </div>
                      
                        ${allergyHtml}
                      
                  </div>
                  <div class="bundle-element">
                    <p>£${bundleJson.price.toFixed(2)}</p>
                    <button>Reserve</button>
                    <img class="arrow" src="../svg/down_arrow.svg" alt="">
                  </div>
                </div>
            </div>
            `


        bundleContainer.insertAdjacentHTML('beforeend', html);
        const currentBundle = bundleContainer.lastElementChild;

        //Add reserve button functionality
        const reserveButton = currentBundle.querySelector("button");
        reserveButton.addEventListener("click", function (e) {
           e.stopPropagation();
           openReservePopup(bundleJson.bundleId, bundleJson.bundleName);
        });


        //Add drop-down functionality
        currentBundle.addEventListener("click", async function (e) {

            //Flip the arrow
            const arrow = currentBundle.querySelector(".arrow");
            const dropDown = currentBundle.querySelector(".drop-down");

            if (dropDown != null) {
                const isHidden = dropDown.style.display === "none";
                dropDown.style.display = isHidden ? "block" : "none";
                arrow.style.transform = isHidden ? "rotate(180deg)" : "rotate(0deg)";
                return;
            }

            const detailedBundleResponse = await apiGet("/bundles/detailed/" + bundleJson.bundleId);
            if (detailedBundleResponse.status !== 200) {
                return;
            }

            arrow.style.transform = "rotate(180deg)";

            //Get more descriptive information
            const detailedBundleJson = await detailedBundleResponse.json();

            //Create the product's html
            const productList = detailedBundleJson.productList;
            let productHtml = `<b>Products</b>`;
            for (let i = 0; i < productList.length; i++) {
                const product = productList[i];
                console.log(product);
                productHtml += `<div><p>${product.quantity}x </p><p>${sanitise(product.productName)}: £${product.price.toFixed(2)}</p></div>`
            }

            //Convert times to be more readable
            const collectionStartTime = new Date(detailedBundleJson.collectionStart);
            const collectionEndTime = new Date(detailedBundleJson.collectionEnd);

            const readableCollectionStart = collectionStartTime.toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            });

            const readableCollectionEnd = collectionEndTime.toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });

            //this is the html for the drop down that appears when the user clicks on a bundle
            // It includes the bundle's description, a list of products in the bundle, the retail price, and the collection time
            const dropDownHtml =
                `
            <div class="drop-down">
            
                <p>${sanitise(detailedBundleJson.description)}</p>
                <div class="product-list"></div>
                
                <div class="retail-price"">
                    <p>Retail Price: £</p>
                    <p>${detailedBundleJson.retailPrice.toFixed(2)}</p>
                </div>
                
                <div class="collection-time">
                    <p style="font-weight: bold">Collection Time: </p><p>${readableCollectionStart} - ${readableCollectionEnd}</p>
                </div>
                
            </div>
            `;

            currentBundle.insertAdjacentHTML('beforeend', dropDownHtml);
            const productListHtml = currentBundle.querySelector(".product-list");
            productListHtml.innerHTML = productHtml;

        })

    }


}

//Reservation popup elements
const reservePopup = document.getElementById("reservePopup");
const reserveDetails = document.getElementById("reserveDetails");
const confirmReserveBtn = document.getElementById("confirmReserveBtn");
const cancelReserveBtn = document.getElementById("cancelReserveBtn");

let selectedBundleId = null;
/**
 * This function is called when the user clicks the reserve button on a bundle. 
 * It sets the selected bundle ID and updates the reserve pop-up with the bundle name. It then shows the pop-up to the user to confirm their reservation.
 * @param {*} bundleId 
 * @param {*} bundleName 
 */
function openReservePopup(bundleId, bundleName){
    selectedBundleId = bundleId;
    reserveDetails.textContent = `DISCLAIMER: Consumer at your own risk. Are you sure you want to reserve the bundle: ${bundleName}?`;
    reservePopup.showModal();
}

confirmReserveBtn.addEventListener("click", async function(){
    if(selectedBundleId){

        //Reserve Bundle
        const reserveResponse = await apiPost("/reservations/" + selectedBundleId, {})

        if(!reserveResponse.ok) {
            alert("Reservation Failed");
            return;
        }

        window.location.href = "orders.html";

        reservePopup.close();
    }
});

cancelReserveBtn.addEventListener("click", function(){
    selectedBundleId = null;
    reservePopup.close();
});
/**
 * This function takes in a string and capitalises the first letter while making the rest of the letters lowercase.
 * This is used to display the allergy information in a more user-friendly way.
 * @param {*} string 
 * @returns 
 */
function capitaliseString (string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*prevents XSS*/
function sanitise(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}