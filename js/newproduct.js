import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");



//setup -->createproduct-->get form
//sumbit -->read inputs --> read allegeries --> validate --> call createProduct

/**
 * Creates a new product by sending a POST request to the backend.
 * @param {*} productData
 * @returns 
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
const form = document.getElementById("createProductForm");
const msg = document.getElementById("productMsg");

form.addEventListener("submit", async(e)=> {
  e.preventDefault();
  msg.textContent = "";

  const name = document.getElementById("productName").value.trim();
  const retailPrice = parseFloat(document.getElementById("retailPrice").value);
  const weight = parseFloat(document.getElementById("weight").value);

  //check checkboxes
  const checked = document.querySelectorAll('input[name="allergies"]:checked');
  const allergies = Array.from(checked).map((cb) => cb.value);

  if (!name || Number.isNaN(retailPrice) || Number.isNaN(weight)) {
    msg.textContent = "fill in all the fields"
  }

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
