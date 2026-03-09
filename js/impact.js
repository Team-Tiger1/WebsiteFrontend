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

/**
 * Loads the money leaderboard and displays the top 10 users
 * also shows the current users position at the bott0m
 */
async function loadMoneyLeaderboard(){
    const response = await apiGet("/users/leaderboard?metric=MONEY");
    if (!response.ok){
        document.getElementById("moneyLeaderboardList").innerHTML = "<p>Could not load leaderboard</p>";
        return;
    }
    //collect the response
    const data = await response.json();
    const list = document.getElementById("moneyLeaderboardList");
    list.innerHTML = "";

    //loop through the top 10 and display each one
    data.top.forEach((entry, index) => {
        const row = document.createElement("div");
        row.classList.add("leaderboard-row");
        row.innerHTML = `
            <span>#${index + 1}</span>
            <span>${entry.username}</span>
            <span>£${entry.value.toFixed(2)}</span>
        `; //fix to 2 decimal place for all values
        //use the backend names to call the values to place
        //each added to show one row in the leaderboard
        list.appendChild(row); //add row
    });

    //show the current users position and stats for money
    document.getElementById("moneyUserPosition").innerHTML =
        `<p>Your position: #${data.position},  ${data.username},  £${data.value.toFixed(2)}</p>`;
}

/**
 * Loads the waste leaderboard and displays the top 10 users
 * also shows the current users position at the bottom
 */
async function loadWasteLeaderboard(){
    const response = await apiGet("/users/leaderboard?metric=WASTE");
    if (!response.ok){
        document.getElementById("wasteLeaderboardList").innerHTML = "<p>Could not load leaderboard</p>";
        return;
    }
    //collect the response
    const data = await response.json();
    const list = document.getElementById("wasteLeaderboardList");
    list.innerHTML = "";

    //loop through the top 10 and display each one
    data.top.forEach((entry, index) => {
        const row = document.createElement("div");
        row.classList.add("leaderboard-row");
        row.innerHTML = `
            <span>#${index + 1}</span>
            <span>${entry.username}</span>
            <span>${entry.value.toFixed(2)}kg</span>
        `; //setting all values to 2 decimal places
        //using index +1 to show position on leadboard
        list.appendChild(row); //add row
    });

    //show the current users position and their stats for waste
    document.getElementById("wasteUserPosition").innerHTML =
        `<p>Your position: #${data.position},  ${data.username},  ${data.value.toFixed(2)}kg</p>`; //adding the users positoon with 2 decimal places
}

loadMoneyLeaderboard();
loadWasteLeaderboard();


