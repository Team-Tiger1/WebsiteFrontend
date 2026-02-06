import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

const productsList = document.getElementById("productsList");
const msg = document.getElementById("bundleMsg");

// load the vendors products 
async function loadVendorsProducts(){
    productsList.innerHTML = "";
    msg.textContent = "";

    const productResponse = await apiGet("/products/vendor"); 
    if (!productResponse.ok) {
        msg.textContent = "Could not load your products";
        return;
    }
    const products = await productResponse.json();

    if (productsList.length === 0) {
            msg.textContent = "You have no products";
            return;
        }
    
    // loop through each product and create a checkbox row 
    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const label = document.createElement("label");
        label.className = "product-item";

    
        label.innerHTML = `
            <input type="checkbox" name="bundleProducts" value="${product.id}">
            <div class="product-info">
                <strong>${product.name}</strong>
                <p class="text-muted">£${product.retailPrice} • ${product.weight}g</p>
            </div>
        `;
        productsList.appendChild(label);
    } 
}
// handle bundle creation 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const name = document.getElementById("bundleName").value;
    const description = document.getElementById("bundleDescription").value;
    const price = parseFloat(document.getElementById("bundlePrice").value);
    const category = document.getElementById("bundleCategory").value;
    const collectionStart = document.getElementById("collectionStart").value;
    const collectionEnd = document.getElementById("collectionEnd").value;

    //collect all checked products 
    const productSelected = document.querySelectorAll (
        'input[name="bundleProducts"]:checked;
    );
    const selectedList = Array.from(checked).map(cb=> cb.value);

    if (!name) return (msg.textContent = "Enter a bundle name");
    if (!description) return (msg.textContent = "Enter a description");
    if (Number.isNaN(price) || price <= 0) return (msg.textContent = "Enter a valid price");
    if (!category) return (msg.textContent = "Select a category");
    if (!collectionStart) return (msg.textContent = "Choose a collection start time");
    if (!collectionEnd) return (msg.textContent = "Choose a collection end time");

    if (new Date(collectionEnd) <= new Date(collectionStart))
        return (msg.textContent = "Collection end must be after start");

    if (selectedList.length === 0) return (msg.textContent = "Select at least one product");

    const bundleData = {
        name, description, selectedList, price, category,
        collectionStart: new Data(collectionStart).toISOString(),
        collectionEnd: new Data(collectionEnd).toISOString(),
        
    };
    //attempt post 
    try {
        const res = await apiPost("/bundles", bundleData);

        if (!res.ok) {
        const text = await res.text();
        msg.textContent = "failed to create bundle" + (text ? `: ${text}` : "");
        return;
        }
    msg.textContent = "Bundle created!"
    form.rest();
    }
};








// run when page loads
loadVendorsProducts();

