import { refreshAccessToken, CONNECTION_URL } from "./auth.js";


export async function apiGet(url, options = {}) {
    options.headers = {}

    //Add access token
    options.headers["Authorization"] = "Bearer " + localStorage.getItem("accessToken");

    let response = null;
    try {
        response = await fetch(CONNECTION_URL + url, options);
    } catch (error) {
        console.log(error);
    }

    //If access token has expired, get a new one and try again
    if(response == null || response.status === 401) {

        const isRefreshed = await refreshAccessToken();
        if(isRefreshed) {
            options.headers["Authorization"] = "Bearer " + localStorage.getItem("accessToken");
            response = fetch(CONNECTION_URL + url, options);
        }
    }
    return response;
}

export async function apiPost(url, data, options = {}) {
    options.method = "POST";
    options.headers = {}

    //Add access token
    options.headers["Authorization"] = "Bearer " + localStorage.getItem("accessToken");

    //Add Data to body
    options.body = JSON.stringify(data);

    let response = null;
    try {
        response = await fetch(CONNECTION_URL + url, options);
    } catch (error) {
        console.log(error);
    }

    //If access token has expired, get a new one and try again
    if(response == null || response.status === 401) {

        const isRefreshed = await refreshAccessToken();
        if(isRefreshed) {
            options.headers["Authorization"] = "Bearer " + localStorage.getItem("accessToken");
            response = fetch(CONNECTION_URL + url, options);
        }
    }
    return response;
}