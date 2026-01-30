import { API_URL } from "./config.js";
export const CONNECTION_URL = API_URL;


export async function refreshAccessToken() {
    try {
        const res = await fetch(CONNECTION_URL + "/auth/refresh", {
            method: "POST",
            credentials: "include", // send HttpOnly cookie
        });
        if(res.status !== 200) {
            localStorage.removeItem("accessToken")
            window.location.href = "login.html";
            return false;
        }
        const data = await res.json();
        localStorage.setItem("accessToken", data.accessToken);
        return true;

    } catch (err) {
        localStorage.removeItem("accessToken")
        window.location.href = "login.html";
        return false;
    }
}

export async function isAuthenticated(pageRole) {

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken !== null) {
        //Decode and check if expired or wrong permissions
        const payload = accessToken.split(".")[1];
        const decodedPayload = atob(payload);
        const payloadJson = JSON.parse(decodedPayload);

        //Check expiry time
        const expiryTime = payloadJson.exp;
        const currentTime = Date.now() / 1000;
        if(currentTime > expiryTime) {
            //Token is expired
            await refreshAccessToken();
        }

        //Also check user type is allowed on this page
        const role = payloadJson.role;
        if(role === pageRole) {
            return;
        }
        else {
            if(role === "user") {
                window.href.location = ""
            }

        }
    }

}