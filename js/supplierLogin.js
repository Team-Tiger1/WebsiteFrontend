import {apiPost} from "./connection.js";
import {refreshAccessToken} from "./auth.js";
import { API_URL } from "./config.js";

const form = document.getElementById("loginForm");
const msg = document.getElementById("errorMsg");
const API = API_URL;

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    msg.textContent = "";

    if (!email || !password){
        msg.textContent = "Please enter an email and password";
        return;
    }

    try{

        const response = await fetch(`${API}/vendors/login`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
            credentials: "include"
        });

        if (!response.ok){
            msg.textContent = "Invalid credentials. Please Try Again";
            return;
        }
    
        await refreshAccessToken();
        
        window.location.href = "dashboard.html";
    } catch (err){
        console.error(err);
        msg.textContent = err.message;   
    }
});

