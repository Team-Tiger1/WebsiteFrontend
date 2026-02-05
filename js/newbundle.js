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
            msg.textContent = "You have no products"
        }
    
    // loop through each product and create a checkbox row 
    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const label = document.createElement("label");
        label.className = "product-item";

    
        label.innerHTML = `
            <input type="checkbox" name="bundleProducts" value="${product.productId}">
            <div class="product-info">
                <strong>${product.name}</strong>
                <p class="text-muted">£${product.retailPrice} • ${product.weight}g</p>
            </div>
        `;
        productsList.appendChild(label);
    }

}
// run when page loads 
loadVendorsProducts();