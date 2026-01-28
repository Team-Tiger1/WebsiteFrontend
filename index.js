const API = "http://localhost:8080/api";
const token = localStorage.getItem("accessToken");
const accountType = localStorage.getItem("accountType");

if (!token){
    window.location.href = "login.html";
} else if (accountType == "supplier"){
    window.location.href = "catalog.html"
} else{
    window.location.href = "catalog.html";
}