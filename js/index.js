import {refreshAccessToken} from "./auth.js";

let accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
   accessToken = await refreshAccessToken();
}

if(!accessToken) {
    window.location.href = "login.html";
}

if(accessToken) {
    const payload = accessToken.split(".")[1];
    const decodedPayload = atob(payload);
    const payloadJson = JSON.parse(decodedPayload);
    const role = payloadJson.role;

    if(role === "VENDOR") {
        window.location.href = "dashboard.html";
    }
    if(role === "USER") {
        window.location.href = "catalog.html";
    }
}