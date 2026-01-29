// split this into a get and post function and mkae it more beginner

export const CONNECTION_URL = "https://thelastfork.shop/api";//"https://thelastfork.shop/api";


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