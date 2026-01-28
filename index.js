const API = "https://thelastfork.shop/api";
const token = localStorage.getItem("accessToken");
const accountType = localStorage.getItem("accountType");

if (!token){
    window.location.href = "login.html";
} else if (accountType == "supplier"){
    window.location.href = "catalog.html"
} else{
    window.location.href = "catalog.html";
}