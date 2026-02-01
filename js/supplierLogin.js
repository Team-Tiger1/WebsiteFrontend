import {apiPost} from "./connection.js";
import {refreshAccessToken} from "./auth.js";
import { API_URL } from "./config.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("errorMsg");
const API = API_URL;

//listens for if supplier login page is submitted 
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //collects their email and password for request body
    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    msg.textContent = "";

    //checks both fields have been entered into
    if (!email || !password){
        msg.textContent = "Please enter an email and password";
        return;
    }

    try{
        //Sends login request to the back end for teh supplier using endpoint
        const response = await fetch(`${API}/vendors/login`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            //conversts email and password into JSON for request
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        //if the login page show this msg
        if (!response.ok){
            msg.textContent = "Invalid credentials. Please Try Again";
            return;
        }
        // if the login is successful get the new access token
        await refreshAccessToken();
        //send the supplier to the dashboard page if successful login
        window.location.href = "dashboard.html";
    } catch (err){
        console.error(err);
        msg.textContent = err.message;   
    }
});

