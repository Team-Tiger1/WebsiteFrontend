import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";
/*prevents XSS*/
import {sanitise} from "./sanitise.js"
await isAuthenticated("VENDOR")

//Elements used on the Create Bundle page
const productsList = document.getElementById("productsList");
const msg = document.getElementById("bundleMsg");
const form = document.getElementById("createBundleForm");

const productSearch = document.getElementById("productSearch");
const productsSummary = document.getElementById("productsSummary");

// optimise button
const optimiseBtn = document.getElementById("optimiseBtn");
const optimiseMsg = document.getElementById("optimiseMsg");

let allProducts = []; //stores all vendor products loaded from the backend
let selectedQuantities = {}; // stores chosen quantities using product id as the key

//pop up
const successPopup = document.getElementById("successPopup");
const closePopupBtn = document.getElementById("closePopupBtn");

closePopupBtn.addEventListener("click", () => {
    successPopup.close();
});

/**
 * Loads all products belonging to the logged-in vendor.
 * the products are saved into all products so they can be
 * - displayed in the product panel
 * - searched using the search bar
 * - re-rendered without the need of another api call
 */
//new load vendor products
async function loadVendorsProducts() {
    productsList.innerHTML = "";
    msg.textContent = "";
    productsSummary.textContent = "loading products...";

    const productResponse = await apiGet("/products/vendor");

    if (!productResponse.ok) {
        msg.textContent = "could not load your products";
        productsSummary.textContent = "";
        return;
    }

    const products = await productResponse.json();
    allProducts = products;

    if (products.length === 0) {
        productsSummary.textContent = "You have no products";
        productsList.innerHTML = `<p class="text-muted">You have no products</p>`;
        return;
    }

    showProducts(allProducts);
}

/**
 * display the given list of products in the right hand panel
 * each product has a quantity input
 * if a quantity was already chosen before, it is shown again
 * using the value stored in selected quantities
 */
function showProducts(products) {
    productsList.innerHTML = "";

    if (products.length === 0) {
        productsSummary.textContent = "No products match your search";
        productsList.innerHTML = `<p class="text-muted">No products match your search</p>`;
        return;
    }

    productsSummary.textContent = products.length + " product(s) shown";

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const savedQty = selectedQuantities[product.id] || 0;

        const label = document.createElement("label");
        label.className = "product-item";

        label.innerHTML = `
            <div class="product-info">
                <strong>${sanitise(product.name)}</strong>
                <p class="text-muted">£${product.retailPrice} • ${product.weight}g</p>
            </div>

            <input
                class="qty-input"
                type="number"
                min="0"
                step="1"
                value="${savedQty}"
                inputmode="numeric"
                data-product-id="${product.id}"
                aria-label="Quantity for ${sanitise(product.name)}"
            />
        `;

        productsList.appendChild(label);
    }
}

/**
 * filters the vendors products suing the search bar text
 *
 * if the search bar is empty -- all products are shown
 * otherwise only matching product name are displayed (if something is typed into the searchbar)
 */
function filterProducts() {
    const searchText = productSearch.value.toLowerCase().trim();

    if (searchText === "") {
        showProducts(allProducts);
        return;
    }

    const filteredProducts = [];

    for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];

        if (product.name.toLowerCase().includes(searchText)) {
            filteredProducts.push(product);
        }
    }

    showProducts(filteredProducts);
}
//runs product filtering everytime the vendor types in the search bar
productSearch.addEventListener("input", function () {
    filterProducts();
});

/**
 * save the quantity changes whenever a product input is changed
 * we do this because filtered products may disappear from the screen, so the chosen quantities are stored separately
 */
productsList.addEventListener("input", function (e) {
    if (e.target.classList.contains("qty-input")) {
        const productId = e.target.dataset.productId;
        const qty = parseInt(e.target.value, 10) || 0;

        if (qty > 0) {
            selectedQuantities[productId] = qty;
        } else {
            delete selectedQuantities[productId];
        }
    }
});

/**
 * helper function that builds an array of selected product ids.
 */
function buildProductIdList() {
    const productIdList = [];

    for (const id in selectedQuantities) {
        const qty = selectedQuantities[id];

        for (let i = 0; i < qty; i++) {
            productIdList.push(id);
        }
    }

    return productIdList;
}
function formatDateTimeLocal(dateString) {
    return dateString.replace(" ", "T").slice(0, 16);
}
/**
 * fills in the text fields with values returned by backend
 */
function applyOptimisedValues(data) {
    document.getElementById("bundlePrice").value = data.price;
    document.getElementById("collectionStart").value = formatDateTimeLocal(data.collection_start);
    document.getElementById("collectionEnd").value = formatDateTimeLocal(data.collection_end);

    optimiseMsg.textContent = data.explanation;
}
/**
 * this function calls forecast optimise and applies the returned values
 */
optimiseBtn.addEventListener("click", async function () {
    optimiseMsg.textContent = "";
    msg.textContent = "";

    const category = document.getElementById("bundleCategory").value;
    const productIdList = buildProductIdList();

    if (!category) {
        optimiseMsg.textContent = "Select a category first";
        return;
    }

    if (productIdList.length === 0) {
        optimiseMsg.textContent = "Select at least one product first";
        return;
    }

    const optimiseData = {
        product_id_list: productIdList,
        category: category
    };

    try {
        optimiseBtn.disabled = true;

        const res = await apiPost("/forecast/optimise", optimiseData);

        if (!res.ok) {
            const text = await res.text();
            optimiseMsg.textContent = "Could not optimise bundle" + (text ? `: ${text}` : "");
            return;
        }

        const data = await res.json();
        applyOptimisedValues(data);

    } catch (err) {
        console.error(err);
        optimiseMsg.textContent = err.message || "Network failure";
    } finally {
        optimiseBtn.disabled = false;
        optimiseBtn.textContent = "Optimise bundle";
    }
});


/**
 * handles form submission when a vendor creates a bundle
 * 
 * validates:
 * - required fields
 * - price > 0
 * - same-day collection window
 * - end time after start time
 * - at least one product selected
 * 
 * if valid, sends bundle data to backend.
 */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById("bundleName").value;
    const description = document.getElementById("bundleDescription").value;
    const price = parseFloat(document.getElementById("bundlePrice").value);
    const category = document.getElementById("bundleCategory").value;
    const collectionStart = document.getElementById("collectionStart").value;
    const collectionEnd = document.getElementById("collectionEnd").value;

    /**
     * we build productList array
     * then add the productsId to the array
     * if quantity of a product is more than one (e.g. 3) we add the same id that many times (e.g the product id 3 times)
     */
    const productList = [];

    for (const id in selectedQuantities) {
        const qty = selectedQuantities[id];
        for (let i = 0; i < qty; i++) {
            productList.push(id);
        }
    }

    //validation
    if (!name) return (msg.textContent = "Enter a bundle name");
    if (!description) return (msg.textContent = "Enter a description");
    if (Number.isNaN(price) || price <= 0) return (msg.textContent = "Enter a valid price");
    if (!category) return (msg.textContent = "Select a category");
    if (!collectionStart) return (msg.textContent = "Choose a collection start time");
    if (!collectionEnd) return (msg.textContent = "Choose a collection end time");

    //new validation (start date must be before the end date and window must be the same day)
    const startDate =  new Date(collectionStart);
    const endDate = new Date(collectionEnd);

    const sameDay = startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth() && startDate.getDate() === endDate.getDate();
    if (!sameDay)
      return (msg.textContent = "Collection window must be on the same day");

    if (endDate <= startDate)
      return (msg.textContent = "Collection end time must be after start time");

    if (productList.length === 0) return (msg.textContent = "Select at least one product");

    //API call
    const bundleData = {
        name, description, productList, price, category,
        collectionStart: new Date(collectionStart).toISOString(),
        collectionEnd: new Date(collectionEnd).toISOString(),
        
    };
    //attempt post
    try {
        // disable button while waiting for response
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Bundle...";

        const res = await apiPost("/bundles", bundleData);

        if (!res.ok) {
        const text = await res.text();
        msg.textContent = "failed to create bundle" + (text ? `: ${text}` : "");
        return;
        }

        // show popup
        successPopup.showModal();

        form.reset();

        //reset quantity selector to 0
        selectedQuantities = {};
        productSearch.value = "";
        showProducts(allProducts);

    } catch (err) {
        console.error(err);
        msg.textContent = err.message || "network failure";
    } finally {
        // 3. Re-enable the button
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Bundle";
    }
});


// run when page loads
loadVendorsProducts();

