import {isAuthenticated} from "./auth.js";
await isAuthenticated("USER");
import {apiGet, apiPost} from "./connection.js";

/*prevents XSS*/
import {sanitise} from "./sanitise"


//calling api for bundles and vendors
const bundles = await apiGet("/bundles").then(r => r.json());
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
  //create card in HTML
  card.innerHTML = `
    <h3>${sanitise(name)}</h3>
    <span class="category ${category}">
      ${categoryNameMap[category] ?? category}
    </span>
    <p>${price !== undefined ? "£" + Number(price).toFixed(2) : ""}</p>

    <p class="pickupTime">Pickup: ${pickupText}</p>
    <p class="allergyInfo">Allergies: ${allergyText}</p>

    <button class="reserveBtn">Reserve</button>
  `;

  const btn = card.querySelector(".reserveBtn");
  btn.addEventListener("click", function () {
    openReservePopup(bundleId, name);
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
    reserveDetails.textContent = `DISCLAIMER: Consumer at your own risk. Are you sure you want to reserve the bundle: ${bundleName}?`;
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
 * this function filters the bundles based off the category the bundle is
 * 
 */
function CategoryFilter(){
    //gets the flter buttons and adds event listener to each one to filter 
    //the bundles shown in the company bundles and the bundle carousel
    const filterBar = document.getElementById("filterBar");
    filterBar.addEventListener("click", (e) => {
        const button = e.target.closest(".filter-btn"); //if clicked then get the button element
        if(!button) return;

        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active")); //remove all active classes 
        button.classList.add("active"); //add active to clicked button for CSS

        const selected = button.dataset.category; //collects the buttons category

        document.querySelectorAll(".bundleCard").forEach(card => {
            if (selected === "ALL" || card.querySelector(`.category.${selected}`)){ //loop through each card to see if it should still be shown based off the category selected
                card.style.display = ""; //left in default state to be shown if in category
            } else {
                card.style.display = "none"; //not shown in not in category
            }
        });

        document.querySelectorAll("#companyBundles section").forEach(section => { //after filtering the cards we loop through each company section to see if they have any visible cards left, if not we hide the whole section
            const visibleCards = [...section.querySelectorAll(".bundleCard")].some(c => c.style.display !== "none");
            section.style.display = visibleCards ? "" : "none";
        });
    });
}

CategoryFilter();

/**
 * Search bar function to filter the bundles based on the search query entered by the user
 */
function searchBar(){
    const searchInput = document.getElementById("bundleSearch"); //gets user input
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase(); //converts input to lower case

        document.querySelectorAll(".bundleCard").forEach(card => { //loops through each card to see if search matches the cards text
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? "" : "none";
        });

        document.querySelectorAll("#companyBundles section").forEach(section => { //after filtering the cards we loop through each company section to see if they have any visible cards left, if not we hide the whole section
            const visible = [...section.querySelectorAll(".bundleCard")].some(c => c.style.display !== "none");
            section.style.display = visible ? "" : "none";
        });
    });
}

searchBar();


