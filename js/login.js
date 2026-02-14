import {apiPost} from "./connection.js";
import {refreshAccessToken} from "./auth.js";
import { API_URL } from "./config.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("errorMsg");
const API = API_URL;

//Listens for if the login form is submitted
form.addEventListener("submit", async (e) => {
    //prevents the broswer from refreshing page on submit
    e.preventDefault();

    const email = document.getElementById("email-input").value.trim().toLowerCase();
    const password = document.getElementById("password-input").value;

    msg.textContent = "";
    //Checks a password and email have been entered
    if (!email || !password){
        msg.textContent = "Please enter an email and password";
    }

    try{
        //sends login request to backend using the endpoint
        const response = await fetch(`${API}/users/login`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            //converts email and password to JSON for request
            body: JSON.stringify({ email, password }),
            //includes cookies
            credentials: "include",
        });

        //if the login fails
        if (!response.ok){
            msg.textContent = "Invalid credentials. Please Try Again";
            return;
        }
        //if login is successful get a new access token
        await refreshAccessToken();
        
        //redirects user to main catalog page
        window.location.href = "catalog.html";
    } catch (err){
        console.error(err);
        msg.textContent = err.message;   
    }
});

