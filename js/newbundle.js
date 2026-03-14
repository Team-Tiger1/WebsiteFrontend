import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//Elements used on the Create Bundle page
const productsList = document.getElementById("productsList");
const msg = document.getElementById("bundleMsg");
const form = document.getElementById("createBundleForm");


/*prevents XSS*/
import {sanitise} from "./sanitise"

/**
 * Loads all products belonging to the logged-in vendor.
 * These are displayed with quantity selectors so the vendor
 * can choose how many of each product to include in the bundle.
 */
async function loadVendorsProducts(){
    productsList.innerHTML = "";
    msg.textContent = "";

    const productResponse = await apiGet("/products/vendor"); 
    if (!productResponse.ok) {
        msg.textContent = "Could not load your products";
        return;
    }
    const products = await productResponse.json();

    if (products.length === 0) {
            msg.textContent = "You have no products";
            return;
        }
    
    // creates a quantity selector for each product 
    for (let i = 0; i < products.length; i++) {
        const product = products[i];

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
                value="0"
                inputmode="numeric"
                data-product-id="${product.id}"
                aria-label="Quantity for ${sanitise(product.name)}"
            />
        `;

        productsList.appendChild(label);
    } 
}
/**
 * Handles form submission when a vendor creates a bundle.
 * 
 * Validates:
 * - Required fields
 * - Price > 0
 * - Same-day collection window
 * - End time after start time
 * - At least one product selected
 * 
 * If valid, sends bundle data to backend.
 */
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const name = document.getElementById("bundleName").value;
    const description = document.getElementById("bundleDescription").value;
    const price = parseFloat(document.getElementById("bundlePrice").value);
    const category = document.getElementById("bundleCategory").value;
    const collectionStart = document.getElementById("collectionStart").value;
    const collectionEnd = document.getElementById("collectionEnd").value;

    /**
     * We build productList array.
     * Then add the productsId to the array .
     * If quantity of a product is more than one (e.g. 3) we add the same id that many times (e.g the product id 3 times) .
     */
    const qtyInputs = document.querySelectorAll("#productsList .qty-input");
    const productList = [];

    qtyInputs.forEach((input) => {
        const id = input.dataset.productId;
        const qty = parseInt(input.value, 10) || 0;

        for (let i = 0; i < qty; i++) {
            productList.push(id); // push same id multiple times
        }
    });

    //Validation 
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
    //Attempt post 
    try {
        const res = await apiPost("/bundles", bundleData);

        if (!res.ok) {
        const text = await res.text();
        msg.textContent = "failed to create bundle" + (text ? `: ${text}` : "");
        return;
        }
        msg.textContent = "bundle created"
        form.reset();

        // Reset quantity selector to 0 
        const allQty = document.querySelectorAll("#productsList .qty-input");
        allQty.forEach((i) => (i.value = 0));

    } catch (err) {
        console.error(err);
        msg.textContent = err.message || "network failure";
    }
});

    







// run when page loads
loadVendorsProducts();

