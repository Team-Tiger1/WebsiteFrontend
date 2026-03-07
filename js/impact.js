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
loadBadgesForUser();

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
33                <div class="badge-name">${badge.name}</div>
34                <div class="badge-grade">Grade: ${badge.grade}</div>
35                <div class="progress-bar-wrap">
36                    <div class="progress-bar-fill" style="width: ${badge.progress}%;"></div>
37                    <span class="progress-bar-label">${progressLabel}</span>
38                </div>
39            </div>
40            <div class="badge-image" style="background: ${badge.color}20;">
41                <!--Swap for image when backend have made it for me-->
42                <div style="width:70px; height:70px; border-radius:8px; background:${badge.color};"></div>
43            </div>`;
        list.appendChild(card);
    })
}

loadBadges(response.badges);




