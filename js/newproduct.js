import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");



//setup -->createproduct-->get form
//sumbit -->read inputs --> read allegeries --> validate --> call createProduct

/**
 * Sends a POST request to create a new product.
 *
 * @param {Object} productData - Product payload containing:
 *  - name (String)
 *  - retailPrice (Number)
 *  - weight (Number)
 *  - allergies (Array<String>)
 *
 * @returns {Response} Fetch API response object.
 */
async function createProduct(productData){
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("you must be looged in to create a product");

  const res = await fetch("https://thelastfork.shop/api/products", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(productData),
  });

  return res;
}

const form = document.getElementById("createProductForm"); //main form element 
const msg = document.getElementById("productMsg"); //status / feedback element 


/**
 * Handles product creation form submission.
 * - Extracts and validates input values.
 * - Sends product data to backend.
 * - Displays feedback to the vendor.
 */
form.addEventListener("submit", async(e)=> {
  e.preventDefault();
  msg.textContent = ""; //Clear previous message

  //Collect input values.
  const name = document.getElementById("productName").value.trim();
  const retailPrice = parseFloat(document.getElementById("retailPrice").value);
  const weight = parseFloat(document.getElementById("weight").value);

  //Collect Selected Allergies
  const checked = document.querySelectorAll('input[name="allergies"]:checked');
  const allergies = Array.from(checked).map((cb) => cb.value);

  if (!name || Number.isNaN(retailPrice) || Number.isNaN(weight)) {
    msg.textContent = "fill in all the fields"
  }
  //Send data to backend 
  try{
    const response = await createProduct({name, retailPrice, weight, allergies});

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      msg.textContent = "failed to create product" +  (text ? `: ${text}` : "");
      return;
    }
    
    msg.textContent= "product created successfully"
    form.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "network failure";
  }


});
