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