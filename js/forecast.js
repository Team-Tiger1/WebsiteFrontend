import {apiGet} from "./connection.js";
import {isAuthenticated} from "./auth.js";
import {sanitise} from "./sanitise.js";

await isAuthenticated("VENDOR");

const adviceContainer = document.getElementById("adviceContainer");
const filterButtons = document.querySelectorAll(".filter-btn");

let allRecommendations = [];

// Determine current day of week to set initial filter
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDay = daysOfWeek[new Date().getDay()];

// Initialise filer buttons and set the filter to the current day
filterButtons.forEach(btn => {
    if (btn.getAttribute("data-day") === currentDay) {
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }
});

/**
 * Gets the advice from the forecast service
 * @returns {Promise<void>}
 */
async function fetchProductionAdvice() {
    try {
        const response = await apiGet("/forecast/production-advice");
        const data = await response.json();

        allRecommendations = data.recommendations;

        if (allRecommendations.length === 0) {
            adviceContainer.innerHTML = "<p>You don't have any consistent waste! Great job managing your production.</p>";
            return;
        }

        // Gets the advice for just the current day
        renderAdvice(currentDay);

    } catch (error) {
        console.error("Failed to load forecast data:", error);
        adviceContainer.innerHTML = "<p class='error'>Failed to load advice. Please try again later.</p>";
    }
}

/**
 * Adds the advice to the UI
 * @param dayFilter
 */
function renderAdvice(dayFilter) {
    adviceContainer.innerHTML = "";

    // Filter recommendations based on selected day
    const filteredData = dayFilter === "ALL"
        ? allRecommendations
        : allRecommendations.filter(item => item.day_of_week === dayFilter);

    if (filteredData.length === 0) {
        const dayText = dayFilter === "ALL" ? "any day" : `${sanitise(dayFilter)}s`;
        adviceContainer.innerHTML = `<p>No overproduction for ${dayText}.</p>`;
        return;
    }

    // Use HTML for each advice box
    filteredData.forEach(advice => {
        const boxHTML = `
            <div class="summary-box">
                <div class="advice-header">
                    <span class="advice-category">${sanitise(advice.category)}</span>
                    <span class="advice-day">${sanitise(advice.day_of_week)}s</span>
                </div>
                <div class="advice-recommendation">${sanitise(advice.recommendation)}</div>
                <div class="advice-rationale">${sanitise(advice.rationale)}</div>
                <span class="confidence-badge confidence-${sanitise(advice.confidence)}">
                    ${sanitise(advice.confidence)} Confidence
                </span>
            </div>
        `;
        adviceContainer.insertAdjacentHTML('beforeend', boxHTML);
    });
}

// Adds event listeners for filter buttons
filterButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        const selectedDay = e.target.getAttribute("data-day");
        renderAdvice(selectedDay);
    });
});

// Loads the advice on page initialisation
fetchProductionAdvice();