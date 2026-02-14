import {apiPost} from "./connection.js";
import {refreshAccessToken} from "./auth.js";
import { API_URL } from "./config.js";

const form = document.getElementById("registerForm");
const msg = document.getElementById("errorMsg");
const API = API_URL;

//listens for if the register form is submitted
form.addEventListener("submit", function (event) {
    event.preventDefault();

    //collects the user inputs 
    const email = document.getElementById("email-input").value.trim().toLowerCase();
    const password = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    //makes sure that the two password inputs are the same for validation check
    if(password !== repeatPassword){
        msg.textContent="Passwords do not match, Please try again!";
        return;
    }
    //once the form is submitted the user is shown that the account is being created
    msg.textContent = "Creating Account";

    //creates the request body
    const body = { email, password };
    
    //sends registration request to backend
    fetch(API + "/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        //converts the registration to JSON for request
        body: JSON.stringify(body),
        //includes the cookies
        credentials: "include"
    })
    //if there is a response
    .then(async (response) =>{
        //if the registration failed show this message
        if (!response.ok){
            msg.textContent = "Register failed";
            return null;
        }
        //if the response contains JSON parse it
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")){
            return response.json();
        }
        // otherwise return empty
        return {};
    })
    //if the account is successfully created
    .then((data) => {
        if (data == null)
            return;
        //debug
        console.log("Register response", data);
        //shows the user that registration is successfull and they will be redirect to the main catalog page
        msg.textContent = "Account created! Redirection to catalog."
        
        //uses the access token set is registration to get access to the catalog page
        refreshAccessToken().then(() => {
            window.location.href = "catalog.html";
        })
    
    })
    //if there is a network failure
    .catch((err) => {
        console.error(err);
        msg.textContent = "Network failure";
    });
    });
