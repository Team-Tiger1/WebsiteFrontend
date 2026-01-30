import { API_URL } from "./config.js";
const API = API_URL;
const token = localStorage.getItem("accessToken");
const accountType = localStorage.getItem("accountType");

if (!token){
    window.location.href = "login.html";
} else if (accountType == "supplier"){
    window.location.href = "catalog.html"
} else{
    window.location.href = "catalog.html";
}