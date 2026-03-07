import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("USER");

const badge = document.querySelector(".user-badge");


/**
 * loads the badges for the impact page
 * @returns
 */
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
loadBadgesForUser();

/**
 * loads the badges for the impact page and places them into cards for each badge
 * each card has a proguess bar that shows how close the user is to the next grade for that badge
 */
async function loadBadges(){
    const list = document.getElementById("badges");
    list.innerHTML = "";

    badges.forEach(badge => {
        const card = document.createElement("div");
        card.classList.add("badge-card");
        card.setAttribute("aria-label", `${badge.name} - ${badge.grade} grade, ${badge.progress}% to ${badge.nextGrade}`);

        const proguessBar = badge.progress === 100
            ? `${badge.progress} - Max Grade reached!`
            : `${badge.progress}% to ${badge.nextGrade}`;

        card.innerHTML = `
         <div class="badge-info">
            <div class="badge-name">${badge.name}</div>
            <div class="badge-grade">Grade: ${badge.grade}</div>
            <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${badge.progress}%;"></div>
                <span class="progress-bar-label">${progressLabel}</span>
            </div>
         </div>
         <div class="badge-image" style="background: ${badge.color}20;">
            <!--Swap for image when backend have made it for me-->
            <div style="width:70px; height:70px; border-radius:8px; background:${badge.color};"></div>
         </div>`;
        list.appendChild(card);
    })
}

loadBadges(response.badges);




