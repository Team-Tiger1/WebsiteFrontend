import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//to be used for the catalog
const vendorCarousel = document.getElementById("vendorCarousel");
const bundleCarousel = document.getElementById("bundleCarousel");
const msg = document.getElementById("msg");


await isAuthenticated();
await loadBundles();
await loadVendorsIntoCarousel();


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

function createBundleCard(bundle){
    const card = document.createElement("div");
    card.className = "bundleCard";

    const bundleId = bundle.bundleId;
    const name = bundle.bundleName;
    const price = bundle.price;

    card.innerHTML = `
    <h3>${name}</h3>
    <p>${price !== undefined ? "£" + price : ""}</p>
    <button class="reserveBtn">Reserve</button>`;

    const btn = card.querySelector(".reserveBtn");
    btn.addEventListener("click", function(){
        reserveBundle(bundleId);
    });
    bundleCarousel.appendChild(card);
}

async function reserveBundle(bundleId) {

    const reserve = await apiPost("/reservations/" + bundleId, {});

    if (!reserve.ok){
        alert("reservation failed");
        return;
    }

    window.location.href = "orders.html";
}






// loadCatalog();

// async function loadCatalog(){
//     msg.textContent = "Loading Vendors";

//     //getting the vendors
//     const vendorsResponse = await fetch (user_API + "/vendors", {
//         method: "GET",
//         headers: {
//             "Authorization": "Bearer " + token
//         }
//     });

//     if (vendorsResponse.status !== 200) {
//         msg.textContent = "Error 404"
//         return;
//     }

//     const vendorsData = await vendorsResponse.json();
//     //created array of the vendor objects
//     bundleList.innerHTML = "";

//     for (let i = 0; i < vendorsData.length; i++){
//         const vendor = vendorsData[i];
//         const vendorId = vendor.id || vendor.vendorId; //dont know currently which one is used... will ask dan

//         if (!vendorId){
//             continue
//         }
//         const bundlesResponse = await fetch (product_API + "/bundles/" + vendorId, {
//             method: "GET",
//             headers: {
//             "Authorization": "Bearer " + token
//         }
//         });
//         // if the vendor dosent have any skip
//         if (bundlesResponse.status !== 200){
//             continue
//         }

//         //array of the bundle objects
//         const bundlesData = await bundlesResponse.json();
//         for (let j = 0; j < bundlesData.length; j++){
//             const bundle = bundlesData[j];
//             addBundleToPage(bundle);
//         }
//     }

//     msg.textContent= "";
// }

// //create bundle card for the page
// function addBundleToPage(bundle){
//     //card will have a price name description and button to reserve
//     const card = document.createElement("div");
//     card.className = "bundleCard";

//     const bundleId = bundle.id || bundle.bundleId; // again need to ask dan which one is correct but just left all options for now
//     const bundleName = bundle.name || bundle.title || "Bundle";
//     const bundlePrice = bundle.price;

//     //create card in HTML and populate data
//     card.innerHTML = `
//     <h3>${bundleName}</h3>
//     <p>${ "£" + bundlePrice}</p>
//     <button class="reserveButton">Reserve</button>`

//     //reserve button 
//     const reserveButton = card.querySelector(".reserveButton");
//     reserveButton.addEventListener("click", function(){
//         reserveBundle(bundleId);
//     })

//     //add the bundle to the page
//     bundleList.appendChild(card);
// } 

// //when the custmer reserves a bundle send it to the orders apge where they can get their confirmation code and view other orders
// async function reserveBundle(bundleId){
//     const reserveResponse = await fetch(product_API + "/reservations/" + bundleId, {
//         method: "POST",
//         headers: {
//             "Authorization": "Bearer " + token
//         }
//     });
//     if (!reserveResponse.ok){
//         msg.textContent("reservation failed");
//         return;
//     }
//     window.location.href = "orders.html";
// }

