
//constants
const product_API = "https://thelastfork.shop/productsservice";
const user_API = "https://thelastfork.shop/userservice";
const token = localStorage.getItem("accessToken");

//to be used for the catalog
const bundleList = document.getElementById("bundleList");
const msg = document.getElementById("msg");

//once logins work uncomment
// if (!token){
//     window.location.href = "login.html";
// }

loadCatalog();

async function loadCatalog(){
    msg.textContent = "Loading Vendors";

    //getting the vendors
    const vendorsResponse = await fetch (user_API + "/vendors", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    if (vendorsResponse.status !== 200) {
        msg.textContent = "Error 404"
        return;
    }

    const vendorsData = await vendorsResponse.json();
    //created array of the vendor objects
    bundleList.innerHTML = "";

    for (let i = 0; i < vendorsData.length; i++){
        const vendor = vendorsData[i];
        const vendorId = vendor.id || vendor.vendorId; //dont know currently which one is used... will ask dan

        if (!vendorId){
            continue
        }
        const bundlesResponse = await fetch (product_API + "/bundles/" + vendorId, {
            method: "GET",
            headers: {
            "Authorization": "Bearer " + token
        }
        });
        // if the vendor dosent have any skip
        if (bundlesResponse.status !== 200){
            continue
        }

        //array of the bundle objects
        const bundlesData = await bundlesResponse.json();
        for (let j = 0; j < bundlesData.length; j++){
            const bundle = bundlesData[j];
            addBundleToPage(bundle);
        }
    }

    msg.textContent= "";
}

//create bundle card for the page
function addBundleToPage(bundle){
    //card will have a price name description and button to reserve
    const card = document.createElement("div");
    card.className = "bundleCard";

    const bundleId = bundle.id || bundle.bundleId; // again need to ask dan which one is correct but just left all options for now
    const bundleName = bundle.name || bundle.title || "Bundle";
    const bundlePrice = bundle.price;

    //create card in HTML and populate data
    card.innerHTML = `
    <h3>${bundleName}</h3>
    <p>${ "£" + bundlePrice}</p>
    <button class="reserveButton">Reserve</button>`

    //reserve button 
    const reserveButton = card.querySelector(".reserveButton");
    reserveButton.addEventListener("click", function(){
        reserveBundle(bundleId);
    })

    //add the bundle to the page
    bundleList.appendChild(card);
} 

//when the custmer reserves a bundle send it to the orders apge where they can get their confirmation code and view other orders
async function reserveBundle(bundleId){
    const reserveResponse = await fetch(product_API + "/reservations/" + bundleId, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });
    if (!reserveResponse.ok){
        msg.textContent("reservation failed");
        return;
    }
    window.location.href = "orders.html";
}

