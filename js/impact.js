import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("USER");

const badge = document.querySelector(".user-badge");

//map the api response of badge names with how they are displayed
const imageMap = {
    "THE_EXPLORER": "The Explorer",
    "LOYAL_SHOPPER": "Loyal Shopper",
    "HOT_SHOPPER": "Hot Shopper",
    "WASTE_KING": "Waste King",
    "CATEGORY_KING": "Category King",
    "WEEKLY_WARRIOR": "Weekly Warrior",
    "WALLET_WATCHER": "Wallet Watcher"
};

//map the grades too
const gradeMap = {
    "BRONZE": "Bronze",
    "SILVER": "Silver",
    "GOLD": "Gold"
};


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

    loadBadges(badges)
}
loadBadgesForUser();

/**
 * loads the badges for the impact page and places them into cards for each badge
 * each card has a proguess bar that shows how close the user is to the next grade for that badge
 */
async function loadBadges(badges){
    const list = document.getElementById("badges");
    list.innerHTML = "";

    badges.forEach(badge => {
        const card = document.createElement("div");
        card.classList.add("badge-card");

        const progressPercent = badge.threshold > 0
            ? Math.min((badge.currentAmount / badge.threshold) * 100, 100).toFixed(0)
            : 0;

        const formattedName = badge.name.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

        const progressBar = badge.grade === "UNRANKED" && progressPercent < 100
            ? `${progressPercent}% progress`
            : progressPercent >= 100
                ? "Max Grade reached!"
                : `${progressPercent}%`;

        card.setAttribute("aria-label", `${formattedName} - ${badge.grade} grade, ${progressPercent}% progress`);

        const imageName = imageMap[badge.name];
        const gradeSuffix = gradeMap[badge.grade];
        const badgeImg = imageName && gradeSuffix
            ? `<img src="img/${imageName}-${gradeSuffix}.png" alt="${formattedName} ${badge.grade} badge" style="width:70px; height:70px; object-fit:contain;">`
            : `<div style="width:70px; height:70px; border-radius:8px; background:#ccc;"></div>`;

        card.innerHTML = `
         <div class="badge-info">
            <div class="badge-name">${formattedName}</div>
            <div class="badge-grade">Grade: ${badge.grade}</div>
            <div class="progress-bar-wrap">
                <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                <span class="progress-bar-label">${progressBar}</span>
            </div>
            <div class="badge-amounts">${badge.currentAmount} / ${badge.threshold}</div>
         </div>
         <div class="badge-image">
            ${badgeImg}
         </div>`;
        list.appendChild(card);
    })
}




