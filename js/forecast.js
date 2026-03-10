import {apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");

// Frontend labels and backend inputs
const weatherCategories = [
    {label: "Heavy Rain", backendValue: "Heavy rain at times"},
    {label: "Light Rain", backendValue: "Light rain"},
    {label: "Overcast", backendValue: "Overcast"},
    {label: "Partly Cloudy", backendValue: "Partly cloudy"},
    {label: "Sunny", backendValue: "Sunny"}];

const dayCategories = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Updates the UI labels as the sliders move
document.getElementById('discountSlider').addEventListener('input', (e) => {
    document.getElementById('discountValue').innerText = `${e.target.value}%`;
});

document.getElementById('leadTimeSlider').addEventListener('input', (e) => {
    document.getElementById('leadTimeValue').innerText = `${e.target.value} Hour(s)`;
});

document.getElementById('collectionTimeSlider').addEventListener('input', (e) => {
    const formattedTime = formatTime(parseFloat(e.target.value));
    document.getElementById('collectionTimeValue').innerText = formattedTime;
});

document.getElementById('windowLengthSlider').addEventListener('input', (e) => {
    document.getElementById('windowLengthValue').innerText = `${e.target.value} Hour(s)`;
});

document.getElementById('daySlider').addEventListener('input', (e) => {
    const index = parseInt(e.target.value);
    document.getElementById('dayValue').innerText = dayCategories[index];
});

document.getElementById('weatherSlider').addEventListener('input', (e) => {
    const index = parseInt(e.target.value);
    document.getElementById('weatherValue').innerText = weatherCategories[index].label;
});

document.getElementById('temperatureSlider').addEventListener('input', (e) => {
    document.getElementById('temperatureValue').innerText = `${e.target.value}°C`;
});

// Calls the API when any of the inputs are changed
const allSliders = ['retailPriceInput', 'discountSlider', 'leadTimeSlider', 'windowLengthSlider', 'weatherSlider', 'temperatureSlider', 'daySlider', 'collectionTimeSlider']

allSliders.forEach(slider => {
    document.getElementById(slider).addEventListener('change', () => {
        triggerSimulation()
    });
});

document.getElementById('categorySelect').addEventListener('change', () => {
    triggerSimulation();
});

// Calls the API when the webpage opens so it is not blank to begin with
triggerSimulation()

/**
 * Calls the API and then updates the UI with the resulting forecast
 * @returns {Promise<void>}
 */
async function triggerSimulation() {
    const bundlePrice = getBundlePrice();

    // Creates the payload in the specific order expected by the backend
    const payload = {
        price: bundlePrice,
        discount: parseFloat(document.getElementById('discountSlider').value),
        lead_time: parseFloat(document.getElementById('leadTimeSlider').value),
        window_length: parseFloat(document.getElementById('windowLengthSlider').value),
        weather: weatherCategories[parseInt(document.getElementById('weatherSlider').value)].backendValue,
        temperature: parseFloat(document.getElementById('temperatureSlider').value),
        category: document.getElementById('categorySelect').value,
        day: dayCategories[parseInt(document.getElementById('daySlider').value)],
        time_of_day: parseFloat(document.getElementById('collectionTimeSlider').value)
    };

    try {
        // Calls the API
        const response = await apiPost("/forecast/simulate", payload);

        if (response.ok) {
            const data = await response.json();

            // Gets the reservation and collection percentages from the API response
            const reservationChance = data.reservation.reservation_probability;
            const collectionChance = data.collection.collection_probability;

            // Updates the frontend to show the results
            updateCircles(reservationChance, collectionChance);
        } else {
            console.error("Simulation failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error calling simulation API:", error);
    }
}

/**
 * Updates the gauges to show the returned percentages visually
 * @param reservationChance
 * @param collectionChance
 */
function updateCircles(reservationChance, collectionChance) {
    const reservationCircle = document.getElementById('reservationChanceCircle');
    const reservationText = document.getElementById('reservationChanceText');

    const collectionCircle = document.getElementById('collectionChanceCircle');
    const collectionText = document.getElementById('collectionChanceText');

    // Changes the text to be the returned percentages
    reservationText.innerText = `${reservationChance}%`;
    collectionText.innerText = `${collectionChance}%`;

    // Gets the circle colour based on the returned percentages
    const reservationColour = getCircleColour(reservationChance);
    const collectionColour = getCircleColour(collectionChance);

    // Updates the CSS for the gauges
    reservationCircle.style.setProperty('--fill', `${reservationChance * 0.75}%`);
    collectionCircle.style.setProperty('--fill', `${collectionChance * 0.75}%`);

    reservationCircle.style.setProperty('--color', reservationColour);
    collectionCircle.style.setProperty('--color', collectionColour);
}

/**
 * Converts decimal time (14.5) to 14:30 for frontend
 * @param decimalTime
 * @returns {string}
 */
function formatTime(decimalTime) {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
}

/**
 * Gets the bundle price using the current discount and price set by the user
 * @returns {number}
 */
function getBundlePrice() {
    const retailPrice = parseFloat(document.getElementById('retailPriceInput').value);
    const discount = parseFloat(document.getElementById('discountSlider').value);
    return retailPrice * (1 - (discount / 100));
}

/**
 * Gets the colour for the gauge based on the percentage
 * @param percentage
 * @returns {string}
 */
function getCircleColour(percentage) {
    if (percentage >= 70) {
        return '#4CAF50';
    } else if (percentage >= 40) {
        return '#FF9800';
    } else {
        return '#F44336';
    }
}