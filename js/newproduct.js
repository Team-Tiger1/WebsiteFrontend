import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");

// import {apiPost} from "./connection.js";
// import { API_URL } from "./config.js";

// const form = document.getElementById("createProductForm");
// const msg = document.getElementById("productMsg");
// const API = API_URL;

// form.addEventListener("submit", async (e) =>{
//     e.preventDefault();

//     const name = document.getElementById("productName").value;
//     const retailPrice = document.getElementById("retailPrice").value;
//     const weight = document.getElementsById("weight").value;

//     msg.textContent = "";

//     if (!name || !retailPrice|| !weight ){
//         msg.textContent = "please fill in all the fields";
//         return
//     }

//     const accessToken = localStorage.getItem("accessToken");

//     if (!accessToken){
//         msg.textContent = "you must be logged in to create a product";
//         return
//     }

//     try{
//         const response = await apiPost("/products", {name, retailPrice, weight})


//         if (!response.ok){
//                 msg.textContent = "Failed to create product";
//                 return;
//             }

//             // backend may return empty body
//             msg.textContent = "Product created successfully";
//             form.reset();

//         } catch (err){
//             console.error(err);
//             msg.textContent = err.message;
//         }
// });

// v2 
// import { apiPost } from "./connection.js";

// const form = document.getElementById("createProductForm");
// const msg = document.getElementById("productMsg");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const name = document.getElementById("productName").value.trim();
//   const retailPrice = document.getElementById("retailPrice").value;
//   const weight = document.getElementById("weight").value;

//   msg.textContent = "";

//   if (!name || !retailPrice || !weight) {
//     msg.textContent = "Please fill in all the fields";
//     return;
//   }

//   const accessToken = localStorage.getItem("accessToken");
//   if (!accessToken) {
//     msg.textContent = "You must be logged in to create a product";
//     return;
//   }

//   const productData = {
//     name,
//     retailPrice: Number(retailPrice),
//     weight: Number(weight),
//   };

//   if (Number.isNaN(productData.retailPrice) || Number.isNaN(productData.weight)) {
//     msg.textContent = "Retail price and weight must be numbers";
//     return;
//   }

//   try {
//     const response = await apiPost("/products", productData);

//     if (!response.ok) {
//       msg.textContent = "Failed to create product";
//       return;
//     }

//     msg.textContent = "Product created successfully";
//     form.reset();
//   } catch (err) {
//     console.error(err);
//     msg.textContent = "Network error";
//   }
// });


// // v3
// /**
//  * Creates a new product by sending a POST request to the backend.
//  * specifies the product data in the request body.
//  * @param {*} productData 
//  * @returns 
//  */
// async function createProduct(productData) {
//   const token = localStorage.getItem("accessToken");

//   const res = await fetch("https://thelastfork.shop/api" + "/products", {
//     method: "POST",
//     headers: {
//       "Authorization": "Bearer " + token,
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//     },
//     body: JSON.stringify(productData)
//   });

//   return res;
// }


// import { apiPost } from "./connection.js";

// const form = document.getElementById("createProductForm");
// const msg = document.getElementById("productMsg");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const name = document.getElementById("productName").value.trim();
//   const retailPrice = parseFloat(document.getElementById("retailPrice").value);
//   const weight = parseFloat(document.getElementById("weight").value);

//   const allergies = document.getElementById("allergies").value.split(",").map(a => a.trim()).filter(Boolean).map(a => a.toUpperCase());

//   msg.textContent = "";

//   if (!name || isNaN(retailPrice) || isNaN(weight)) {
//     msg.textContent = "please fill in all the fields with valid data";
//     return;
//   }

//   try {
//     // v3
// /**
//  * Creates a new product by sending a POST request to the backend.
//  * specifies the product data in the request body.
//  * @param {*} productData 
//  * @returns 
//  */
// async function createProduct(productData) {
//   const token = localStorage.getItem("accessToken");

//   const res = await fetch("https://thelastfork.shop/api" + "/products", {
//     method: "POST",
//     headers: {
//       "Authorization": "Bearer " + token,
//       "Content-Type": "application/json",
//       "Accept": "application/json"
//     },
//     body: JSON.stringify(productData)
//   });

//   return res;
// }


// //import { apiPost } from "./connection.js";

// const form = document.getElementById("createProductForm");
// const msg = document.getElementById("productMsg");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const name = document.getElementById("productName").value.trim();
//   const retailPrice = parseFloat(document.getElementById("retailPrice").value);
//   const weight = parseFloat(document.getElementById("weight").value);

//   const allergies = document.getElementById("allergies").value.split(",").map(a => a.trim()).filter(Boolean).map(a => a.toUpperCase());

//   msg.textContent = "";

//   if (!name || isNaN(retailPrice) || isNaN(weight) || allergies.length === 0) {
//     msg.textContent = "please fill in all the fields with valid data";
//     return;
//   }

//   try {
//     const response = await createProduct({ name, retailPrice, weight, allergies });
//     if (!response.ok) {
//       msg.textContent = "Failed to create product";
//       return;
//     }

//     msg.textContent = "Product created successfully";
//     form.reset();
//   } catch (err) {
//     console.error(err);
//     msg.textContent = "network failure";
//   }
// });
//     if (!response.ok) {
//       msg.textContent = "Failed to create product";
//       return;
//     }

//     msg.textContent = "Product created successfully";
//     form.reset();
//   } catch (err) {
//     console.error(err);
//     msg.textContent = "network failure";
//   }
// });

//v4 :D
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
