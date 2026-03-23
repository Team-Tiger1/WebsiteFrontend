import {isAuthenticated} from "./auth.js";
await isAuthenticated("USER");
import {apiGet, apiPost} from "./connection.js";

/*prevents XSS*/
import {sanitise} from "./sanitise.js"


//calling api for bundles and vendors
const bundles = await apiGet("/bundles?limit=10000").then(r => r.json());
const vendors = await apiGet("/vendors").then(r => r.json());


//to be used for the catalog
const vendorCarousel = document.getElementById("vendorCarousel");
const bundleCarousel = document.getElementById("bundleCarousel");
const msg = document.getElementById("msg");
const companyBundles = document.getElementById("companyBundles");
const streak = document.querySelector(".streak");

//category names to be displayed to users
const categoryNameMap = {
    BREAD_BAKED_GOODS: "Bread & Baked Goods",
    SWEET_TREATS_DESSERTS: "Sweet Treats",
    MEAT_PROTEIN: "Meat",
    FRUIT_VEGETABLES: "Fruit & Veg",
    DAIRY_EGGS: "Dairy & Eggs",
    READY_MEALS_HOT_FOOD: "Ready Meals & Hot Food",
    SNACKS_SAVOURY_ITEMS: "Snacks",
    BREAKFAST_ITEMS: "Breakfast",
    VEGAN_VEGETARIAN: "Vegan & Vegetarian",
    DRINKS_BEVERAGES: "Drinks"
  };

/**
 * Loads the main page.
 * Checks that the user is logged in (redirect if now)
 * Loads the bundles into the bundles carousel and loads the vendors into
 * their carousel.
 */
await loadBundles(bundles)
await loadVendorsIntoCarousel(vendors)
await loadCompanyBundles(bundles, vendors)
await getStreak();

/**
 * Loads the list of vendors from the backend and displays them
 * to be clickable cards so their can access each vendors page.
 * This is shown in the vendors carousel.
 *
 * When a vendor is clicked save the vendorId in local storage
 * then redirect to their page.
 *
 */
async function loadVendorsIntoCarousel(vendors){
    try{
        //if no vendors show this message
        if(vendors.length===0){
            msg.textContent = "Could not get vendors";
            return;
        }

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


            //making the webpage accessible
            card.setAttribute("role", "link")
            card.setAttribute("aria-label", `Open ${vendorName} bunldes`)
            
            card.innerHTML = `<h1>${sanitise(vendorName)}</h1>`
            card.addEventListener("click", function(){
                localStorage.setItem("vendorId", vendorId);
                window.location.href = "vendor.html";
            });
            card.addEventListener("keydown", (e)=>{
                if (e.key == "Enter" || e.key == " "){
                    e.preventDefault();
                    localStorage.setItem("vendorId", vendorId);
                    window.location.href = "vendor.html";
                }
            })
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
async function loadBundles(bundles){
    bundleCarousel.innerHTML = "";
    msg.textContent = "";

    try{
        //if no bundles found
        if(bundles.length === 0){
            msg.innerHTML = "<p style='text-align: center;'>No bundles available right now, check back later!</p>";
            return;
        }

        for (let i = 0; i<bundles.length; i++){
            const b = bundles[i];
            createBundleCard(b, bundleCarousel);
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
 * - allergies
 * - pick up times
 *
 * When the reserve button is clicked it calls reserveBundle(param) with the bunlde ID as the paramater
 *
 * @param {*} bundle
 */
function createBundleCard(bundle, targetCarousel) {
  const card = document.createElement("div");
  card.className = "bundleCard";

  const bundleId = bundle.bundleId;
  const name = bundle.bundleName;
  const category = bundle.category;
  const price = bundle.price;
  const startDate = bundle.collectionStart;
  const endDate = bundle.collectionEnd;
  const allergies = bundle.allergens;

  //making the website accessible
  card.tabIndex =0;
  card.setAttribute("role", "group");
  card.setAttribute("aria-label", `Bundle ${name}, price £${Number(price).toFixed(2)}`);

  //if cant find the details set default texts
  let pickupText = "Not available";
  let allergyText = "None listed";

    //pickup times
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        //format to readable string
        const readableStart = start.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        });

        //again for end time
        const readableEnd = end.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        });
        //set pickup text
        pickupText = `${readableStart} - ${readableEnd}`;
    }

    // allergies
    const a = allergies;
    if (Array.isArray(a) && a.length > 0) {
        allergyText = a.join(", ");
    } else if (typeof a === "string" && a.trim() !== "") {
        allergyText = a;
    }

    // store time and postcode for filtering
    card.dataset.start = bundle.collectionStart || "";
    card.dataset.end = bundle.collectionEnd || "";
    card.dataset.postcode = bundle.postcode || "";

    const postCodeHTML = bundle.postcode ? `<p class="postcodeInfo">Location: ${sanitise(bundle.postcode)}</p>` : "";

    //create card in HTML
    card.innerHTML = `
    <h3>${sanitise(name)}</h3>
    <span class="category ${category}">
      ${categoryNameMap[category] ?? category}
    </span>
    <p>${price !== undefined ? "£" + Number(price).toFixed(2) : ""}</p>

    <p class="pickupTime">Pickup: ${pickupText}</p>
    ${postCodeHTML}
    <p class="allergyInfo">Allergies: ${allergyText}</p>

    <button class="reserveBtn">Reserve</button>
  `;

  const btn = card.querySelector(".reserveBtn");
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); //stops the card click also happening when pressing reserve
    openReservePopup(bundleId, name);
  });

  card.style.cursor = "pointer";
  card.addEventListener("click", function () {
      localStorage.setItem("vendorId", bundle.vendorId);
      localStorage.setItem("openBundleId", bundleId);
      window.location.href = "vendor.html";
    });

//can activate reserve by pressing enter or space when the card is focused
   card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openReservePopup(bundleId, name);
    }
  });

  targetCarousel.appendChild(card);
}

/**
 * Sends a reservation request to the backend endpoint when
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
async function loadCompanyBundles(bundles, vendors){
    companyBundles.innerHTML = "";

    if(bundles.length === 0){
        msg.innerHTML = "<p style='text-align: center;'>No bundles available right now, check back later!</p>";
        return;
    }
    
    //loop through each vendor and create their section
    for(let i = 0; i<vendors.length; i++){
        //create section for each vendor and collect the information each loop
        const vendorName = vendors[i].vendorName;
        const vendorId = vendors[i].vendorId;
        const section = document.createElement("section");
        const h3 = document.createElement("h3");
        h3.textContent = vendorName;
        const carousel = document.createElement("div");
        carousel.className = "bundle-carousel";

        //add bundles for this vendor
        for (let j = 0; j<bundles.length; j++){
            const bundle = bundles[j];
            //check the name using the pattern in the bundle description
            if (bundle.vendorId === vendorId){
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

/**
 * Gets the user's current streak from the backend
 * @returns 
 */
async function getStreak(){
    try{
        const response = await apiGet("/users/streak"); //calls the users current streat

        if(!response.ok){
            console.error("Could not get streak");
            return;
        }

        const data = await response.json();
        const streakCount = data.streak || 0;

        streak.textContent = `${streakCount} weeks!`;

    } catch(err){
        console.error(err);
    }
}


//Reservation popup elements
const reservePopup = document.getElementById("reservePopup");
const reserveDetails = document.getElementById("reserveDetails");
const confirmReserveBtn = document.getElementById("confirmReserveBtn");
const cancelReserveBtn = document.getElementById("cancelReserveBtn");

let selectedBundleId = null;

/**
 * Opens the reserve confirmation popup
 * @param {*} bundleId 
 * @param {*} bundleName 
 */
function openReservePopup(bundleId, bundleName){
    selectedBundleId = bundleId;
    reserveDetails.innerHTML = `
        DISCLAIMER: Consume at your own risk.<a href="https://thelastfork.shop/foodSafety.html" target="_blank" style="color: blue; text-decoration: underline;">See more</a> <br>
        Are you sure you want to reserve the bundle: <b>${sanitise(bundleName)}<b>? 
    `;
    reservePopup.showModal();
}

/**
 * Event listeners for the confirm and cancel buttons
 * on the reserve popup message
 */
confirmReserveBtn.addEventListener("click", async function(){
    if(selectedBundleId){
        await reserveBundle(selectedBundleId);
        reservePopup.close();
    }
});

cancelReserveBtn.addEventListener("click", function(){
    selectedBundleId = null;
    reservePopup.close();
});

/**
 * Making the vendor and bundle carousels accessbile though arrow keys
 * and ensuring smooth interaction.
 * @param {*} el 
 */
function enableScrollKeys(el){
    el.addEventListener("keydown", (e) =>{
        if(e.key === "ArrowRight"){
            e.preventDefault();
            el.scrollBy({
                left: 250, behavior: "smooth"});
        }else if (e.key === "ArrowLeft"){
            e.preventDefault();
            el.scrollBy({
                left: -250, behavior: "smooth"});
        }else if(e.key === "End"){
            e.preventDefault();
            el.scrollTo({
                left: el.scrollWidth, behavior: "smooth"});
        }
    })
    }
//appling the accessibility to each bundle carousel and the vendor carousel
enableScrollKeys(vendorCarousel)
enableScrollKeys(bundleCarousel)

/**
 * this function filters the bundles based off the category the bundle is, the location, and time.
 * 
 */
function applyFilters() {
    const searchInput = document.getElementById("bundleSearch");
    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const activeCategoryBtn = document.querySelector(".filter-btn.active");
    const selectedCategory = activeCategoryBtn ? activeCategoryBtn.dataset.category : "ALL";

    const filterFromInput = document.getElementById("filterFrom");
    const filterTillInput = document.getElementById("filterTill");
    const postcodeInput = document.getElementById("postcodeFilter");

    const filterFromStr = filterFromInput ? filterFromInput.value : "";
    const filterTillStr = filterTillInput ? filterTillInput.value : "";
    const postcodeQuery = postcodeInput ? postcodeInput.value.toLowerCase() : "";

    const filterFromTime = filterFromStr ? new Date(filterFromStr).getTime() : null;
    const filterTillTime = filterTillStr ? new Date(filterTillStr).getTime() : null;

    document.querySelectorAll(".bundleCard").forEach(card => {
        let show = true;

        // search filter
        if (query && !card.textContent.toLowerCase().includes(query)) show = false;

        // filter category
        if (selectedCategory !== "ALL" && !card.querySelector(`.category.${selectedCategory}`)) show = false;

        // filter date
        const bundleStartStr = card.dataset.start;
        const bundleEndStr = card.dataset.end;

        if (filterFromTime || filterTillTime) {
            if (!bundleStartStr || !bundleEndStr) {
                show = false;
            } else {
                const bundleStartTime = new Date(bundleStartStr).getTime();
                const bundleEndTime = new Date(bundleEndStr).getTime();

                //check overlapp
                if (filterFromTime && bundleEndTime < filterFromTime) show = false;
                if (filterTillTime && bundleStartTime > filterTillTime) show = false;
            }
        }

        // filter postcode
        const bundlePostcode = card.dataset.postcode ? card.dataset.postcode.toLowerCase() : "";
        if (postcodeQuery && !bundlePostcode.startsWith(postcodeQuery)) show = false;

        card.style.display = show ? "" : "none"; //not shown in not in category
    });

    //after filtering the cards we loop through each company section to see if they have any visible cards left, if not we hide the whole section
    document.querySelectorAll("#companyBundles section").forEach(section => {
        const visibleCards = [...section.querySelectorAll(".bundleCard")].some(c => c.style.display !== "none");
        section.style.display = visibleCards ? "" : "none";
    });
}

/**
 * Attaches event listeners to inputs triggering applyFilters()
 */
function setupFilters() {
    // search and advanced filters
    const searchInput = document.getElementById("bundleSearch");
    if(searchInput) searchInput.addEventListener("input", applyFilters);

    const filterFromInput = document.getElementById("filterFrom");
    if(filterFromInput) filterFromInput.addEventListener("input", applyFilters);

    const filterTillInput = document.getElementById("filterTill");
    if(filterTillInput) filterTillInput.addEventListener("input", applyFilters);

    const postcodeInput = document.getElementById("postcodeFilter");
    if(postcodeInput) postcodeInput.addEventListener("input", applyFilters);

    // category filters
    const filterBar = document.getElementById("filterBar");
    if (filterBar) {
        filterBar.addEventListener("click", (e) => {
            const button = e.target.closest(".filter-btn");
            if (!button) return;

            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            button.classList.add("active");

            applyFilters();
        });
    }
}
setupFilters();