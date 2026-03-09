import {apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("VENDOR");

const weatherCategories = [
    {label: "Bad (Moderate Rain)", backendValue: "Moderate rain at times"},
    {label: "Okay (Overcast)", backendValue: "Overcast"},
    {label: "Good (Sunny)", backendValue: "Sunny"},
];

const dayCategories = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatTime(decimalTime) {
    const hours = Math.floor(decimalTime);
    const minutes = Math.round((decimalTime - hours) * 60);

    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById('priceSlider').addEventListener('input', (e) => {
        document.getElementById('priceValue').innerText = `£${parseFloat(e.target.value).toFixed(2)}`;
    });

    document.getElementById('discountSlider').addEventListener('input', (e) => {
        document.getElementById('discountValue').innerText = `${e.target.value}%`;
    });

    document.getElementById('leadTimeSlider').addEventListener('input', (e) => {
        document.getElementById('leadTimeValue').innerText = `${e.target.value} Hour(s)`;
    });

    document.getElementById('windowLengthSlider').addEventListener('input', (e) => {
        document.getElementById('windowLengthValue').innerText = `${e.target.value} Hour(s)`;
    });

    document.getElementById('weatherSlider').addEventListener('input', (e) => {
        const index = parseInt(e.target.value);
        document.getElementById('weatherValue').innerText = weatherCategories[index].label;
    });

    document.getElementById('temperatureSlider').addEventListener('input', (e) => {
        document.getElementById('temperatureValue').innerText = `${e.target.value}°C`;
    });

    document.getElementById('daySlider').addEventListener('input', (e) => {
        const index = parseInt(e.target.value);
        document.getElementById('dayValue').innerText = dayCategories[index];
    });

    document.getElementById('collectionTimeSlider').addEventListener('input', (e) => {
        const formattedTime = formatTime(parseFloat(e.target.value));
        document.getElementById('collectionTimeValue').innerText = formattedTime;
    });

    const allSliders = ['priceSlider', 'discountSlider', 'leadTimeSlider', 'windowLengthSlider', 'weatherSlider', 'temperatureSlider', 'daySlider', 'collectionTimeSlider']

    allSliders.forEach(slider => {
        document.getElementById(slider).addEventListener('change', (e) => {
            triggerSimulation()
        });
    });

    document.getElementById('categorySelect').addEventListener('change', (e) => {
        triggerSimulation();
    });

    triggerSimulation()
});

async function triggerSimulation() {
    const payload = {
        price: parseFloat(document.getElementById('priceSlider').value),
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
        const response = await apiPost("/forecast/simulate", payload);

        if (response.ok) {
            const data = await response.json();

            const reservationChance = data.reservation.reservation_probability;
            const collectionChance = data.collection.collection_probability;
            updateCircles(reservationChance, collectionChance);
        } else {
            console.error("Simulation failed with status:", response.status);
        }
    } catch (error) {
        console.error("Error calling simulation API:", error);
    }
}

function updateCircles(reservationChance, collectionChance) {
    const reservationText = document.getElementById('reservationChanceText');
    const collectionText = document.getElementById('collectionChanceText');

    reservationText.innerText = `${reservationChance}%`;
    collectionText.innerText = `${collectionChance}%`;
}