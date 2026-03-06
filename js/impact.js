import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("USER");

const badge = document.querySelector(".user-badge");

async function loadBadgesForUser(){
    const response = await apiGet("/users/badges");
    if (!response.ok) {
        badge.textContent = "Could not load badges";
        return;
    }
    const badges = await response.json();

    if (badges.length === 0) {
        badge.textContent = "You have no badges";
        return;
    }
}



