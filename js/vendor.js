import {apiGet, apiPost} from "./connection.js";

let bundleList = null;
let sortOrder = "asc"

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


document.addEventListener('DOMContentLoaded', async () => {
    const vendorName = document.getElementById('vendorName');
    const vendorDescription = document.getElementById('vendorDescription');
    const phoneNumber = document.getElementById('phoneNumber');
    const emailAddress = document.getElementById('emailAddress');
    const streetAddress = document.getElementById('streetAddress');
    const postcode = document.getElementById('postcode');
    const map = document.getElementById('map');


    const vendorId = localStorage.getItem("vendorId");
    if (vendorId == null) {
        window.location.href = "catalog.html";
        return;
    }

    let vendorResponse = await apiGet("/vendors/" + vendorId);

    if (vendorResponse.status !== 200) {
        window.location.href = "404.html";
    }

    let data = await vendorResponse.json();
    vendorName.innerHTML = data.companyName || "Unknown Company";
    vendorDescription.innerHTML = data.description || "";
    phoneNumber.innerHTML = data.phoneNumber || "Unknown Phone Number";
    emailAddress.innerHTML = data.email || "Unknown Email Address";
    streetAddress.innerHTML = data.streetAddress || "Unknown Street";
    postcode.innerHTML = data.postcode || "Unknown Postcode";

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

function renderBundles(bundleContainer, bundleList) {

    //Clear the old bundles
    bundleContainer.innerHTML = '';

    for (let i = 0; i < bundleList.length; i++) {

        const bundleJson = bundleList[i];
        // const allergies = bundleJson.allergies;
        // let allergyHtml = ``;
        // for (let j = 0; j < allergies.length; j++) {
        //     allergyHtml += `<p>${allergyHtml}</p>`;
        // }

        let html =
            `
            <div class="bundle" data-id="${bundleJson.bundleId}">
                <div class="bundle-header">
                  <div class="bundle-element">
                    <p>${bundleJson.bundleName}</p>
                    <p class="category ${bundleJson.category}"">${categoryNameMap[bundleJson.category]}</p>
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

        //Add drop-down functionality
        const currentBundle = bundleContainer.lastElementChild;
        currentBundle.addEventListener("click", async function (e) {

            //Flip the arrow
            const arrow = currentBundle.querySelector(".arrow");
            const dropDown = currentBundle.querySelector(".drop-down");

            if (dropDown != null) {
                const isHidden = dropDown.style.display === "none";
                dropDown.style.display = isHidden ? "block" : "none";
                arrow.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
                return;
            }

            const detailedBundleResponse = await apiGet("/bundles/detailed/" + bundleJson.bundleId);
            if (detailedBundleResponse.status !== 200) {
                return;
            }


            //Get more descriptive information
            const detailedBundleJson = await detailedBundleResponse.json();

            //Create the product's html
            const productList = detailedBundleJson.productList;
            let productHtml = `<b>Products</b>`;
            for (let i = 0; i < productList.length; i++) {
                const product = productList[i];
                productHtml += `<div><p>1x </p><p>${product.name}: £${product.retailPrice.toFixed(2)}</p></div>`
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


            const dropDownHtml =
                `
            <div class="drop-down">
            
                <p>${detailedBundleJson.description}</p>
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