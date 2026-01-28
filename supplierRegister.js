const form = document.getElementById("registerForm");
const msg = document.getElementById("errorMsg");
const API = "http://localhost:8080/api";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name-input").value.trim();
    const streetAddress = document.getElementById("address-input").value.trim();
    const postcode = document.getElementById("postcode-input").value.trim();
    const description = document.getElementById("description-input").value.trim();
    const phoneNumber = document.getElementById("number-input").value.trim();
    const email = document.getElementById("email-input").value.trim();
    const category = document.getElementById("category-input").value.trim();
    const password = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    if(password !== repeatPassword){
        msg.textContent="Passwords do not match, Please try again!";
        return;
    }
    msg.textContent = "Creating Account";

    const body = {name, streetAddress, postcode, description, phoneNumber, email, category, password};
    

    fetch(API + "/vendors/register", { 
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        credentials: "include"
    })
    .then(async (response) =>{
        if (!response.ok){
            msg.textContent = "Register failed";
            return null;
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")){
            return response.json();
        }
        return {};
    })

    .then((data) => {
        if (data == null)
            return;

        console.log("Register response", data);
        msg.textContent = "Account created! Redirection to  supplier login."
        window.location.href = "supplierLogin.html";
    
    })
    .catch((err) => {
        console.error(err);
        msg.textContent = "Network failure";
    });
    });
