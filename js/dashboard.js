
// dashboard

import {apiDelete, apiGet, apiPatch, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//Access control -- only users with the VENDOR role can access this page.
await isAuthenticated("VENDOR");


/*prevents XSS*/
import {sanitise} from "./sanitise.js"


//Summary boxes
const posted = document.getElementById("postedCount");     // bundles Posted
const reserved = document.getElementById("reservedCount"); // Bundles Reserved
const pickup = document.getElementById("pickupCount");     // pickups Today

const editPopup = document.getElementById("editPopup");
const deletePopup = document.getElementById("deletePopup");

const editConfirmButton = document.getElementById("edit-confirm-button");
const deleteConfirmButton = document.getElementById("delete-confirm-button");
const editCancelButton = document.getElementById("edit-cancel-button");
const deleteCancelButton = document.getElementById("delete-cancel-button");


// getting the claim inputs and model elements 
const claimInput = document.getElementById("claimCodeInput");
const claimBtn = document.getElementById("claimCodeBtn");
const claimMsg = document.getElementById("claimMsg");

const modal = document.getElementById("claimModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

let selectedBundleId = null;
const editName = document.getElementById("name");
const editDescription = document.getElementById("description");
const editPrice = document.getElementById("price");
const editCollectionStart = document.getElementById("collectionStart");
const editCollectionEnd = document.getElementById("collectionEnd");

//running the dashboard with page loads
document.addEventListener("DOMContentLoaded", () => {

    runDashboard();

    editCancelButton.addEventListener("click", async () => {
        const errorMessage = document.getElementById("edit-error-msg");
        errorMessage.style.display = "none";
        editPopup.close();
    })

    editConfirmButton.addEventListener("click", async () => {

        const payload = {
            "name": editName.value,
            "description": editDescription.value,
            "price": editPrice.value,
            "collectionStart": editCollectionStart.value,
            "collectionEnd": editCollectionEnd.value,
        }

        const editResponse = await apiPatch("/bundles/" + selectedBundleId, payload);

        if(editResponse.status === 204) {
            editPopup.close();
            loadVendorBundles()
        } else {
            const errorMessage = document.getElementById("edit-error-msg");
            errorMessage.style.display = "block";
        }

    })

    deleteCancelButton.addEventListener("click", async () => {
        deletePopup.close();
        const errorMessage = document.getElementById("delete-error-msg");
        errorMessage.style.display = "none";
    })

    deleteConfirmButton.addEventListener("click", async () => {

        const deleteResponse = await apiDelete("/bundles/" + selectedBundleId);
        if(deleteResponse.status === 204) {
            //Deleted Successfully
            await loadVendorBundles()
            deletePopup.close();
        } else {
            const errorMessage = document.getElementById("delete-error-msg");
            errorMessage.style.display = "block";
        }

    })

})

/**
 * Loads the bundle and reservations
 * @returns {Promise<void>}
 */
async function runDashboard() {
    await Promise.all([
        loadVendorBundles(),
        loadVendorReservations()
    ])

}

/**
 * Claim Code submission handler.
 * Send POST request to validate and complete a reservation using claim code.
 * If successful with display reservation details in a model and refreshes dashboard
 */
claimBtn?.addEventListener("click", async () => {
    const claimCode = (claimInput?.value || "").trim();

    claimMsg.textContent = "";

    if (!claimCode) {
        claimMsg.textContent = "Enter a claim code first.";
        return;
    }

    try {
        // POST claim code -> backend should mark reservation as collected
        const res = await apiPost("/reservations/claimcode", {claimCode});

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            claimMsg.textContent = "Invalid claim code" + (text ? `: ${text}` : "");
            return;
        }


        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await res.json().catch(() => null);

            // If backend returns bundle/reservation info --> show it
            if (data) {
                const title = "Reservation completed";

                const price = (typeof data.amountDue === "number")
                    ? `£${data.amountDue.toFixed(2)}`
                    : "-";

                const windowTxt = formatPickupWindow(data.collectionStart, data.collectionEnd);

                const html = `
          <p><strong>Bundle:</strong> ${sanitise(data.bundleName ?? "-")}</p>
          <p><strong>Pickup window:</strong> ${sanitise(windowTxt)}</p>
          <p><strong>Amount due:</strong> ${price}</p>
          <p><strong>Reservation ID:</strong> ${data.reservationId ?? "-"}</p>
        `;

                openModal(title, html, true);
            } else {
                openModal("Reservation completed", "Claim code accepted.");
            }

            // Refresh the table + rest inputs 
            claimInput.value = "";
            await loadVendorReservations();
        }

    } catch (err) {
        console.error(err);
        claimMsg.textContent = err.message || "Network error.";
    }
});

/**
 * Loads the bundles, showing the bundles for sale
 * @returns {Promise<void>}
 */
async function loadVendorBundles() {
    //load bundles currently available
    const bundleResponse = await apiGet("/bundles/me");

    const bundleContainer = document.getElementById("bundle-container");
    bundleContainer.innerHTML = "";

    if(!bundleResponse.ok) {
        //Give error message
        const errorMessage = `<p class="error">Error: Could not load bundles</p>`
        bundleContainer.insertAdjacentHTML("beforeend", errorMessage);

    } else {
        let bundleData = await bundleResponse.json();

        //Update total at top
        posted.innerText = bundleData.length;

        //Show message if no bundles
        if(bundleData.length === 0) {
            const noBundlesHtml = `No bundles posted. Create one to see it here!`
            bundleContainer.insertAdjacentHTML('beforeend', noBundlesHtml);
        }

        //Load the bundles from backend
        for (let i = 0; i < bundleData.length; i++) {

            //Get Forecast
            const bundleId = bundleData[i].bundleId;
            const forecastResponse = await apiGet("/forecast/predict/" + bundleId);

            let forecast;
            if(forecastResponse.ok) {
                const forecastJson = await forecastResponse.json();
                forecast = forecastJson.reservation.reservation_probability;
            } else {
                forecast = "-";
            }

            const name = bundleData[i].name;
            const description = bundleData[i].description;
            const price = bundleData[i].price;
            const collectionStart = bundleData[i].collectionStart;
            const collectionEnd = bundleData[i].collectionEnd;

            let tempHTML = `
            <div class="bundle-card-container" data-id="${bundleId}">
                    <div class="bundle-row bundle-header">
                        <span>BUNDLE NAME</span>
                        <span>PRICE</span>
                        <span>COLLECTION WINDOW</span>
                        <span>RESERVATION CHANCE</span>
                        <span style="margin-left: 40px;">ACTIONS</span>
                    </div>
                    <div class="bundle-row bundle-card">
                        <span class="bundle-name">${sanitise(name)}</span>
                        <div class="price">£${price.toFixed(2)}</div>
                        <div class="window">${formatPickupWindow(collectionStart, collectionEnd)}</div>
                        <div class="chance">${forecast}%</div>


                        <div class="bundle-button-container">
                            <button id="edit-button">
                                <img src="svg/edit_bundle.svg" alt="">
                                <p>Edit</p>
                            </button>
                            <button id="remove-button">
                                <img src="svg/delete_bundle.svg" alt="">
                                <p>Remove</p>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            bundleContainer.insertAdjacentHTML('beforeend', tempHTML);
            const currentBundle = bundleContainer.lastElementChild;

            //Add Edit Button Functionality
            const allButtons = currentBundle.querySelectorAll("button");
            allButtons[0].addEventListener("click", function (e) {
                const card = e.target.closest(".bundle-card-container");
                if(!card) {return;}

                editName.value = name;
                editDescription.value = description;
                editPrice.value = price;
                editCollectionStart.value = collectionStart;
                editCollectionEnd.value = collectionEnd;

                selectedBundleId = card.dataset.id;
                editPopup.showModal();

            });

            //Add Delete Button Functionality
            allButtons[1].addEventListener("click", function (e) {
                const card = e.target.closest(".bundle-card-container");
                if(!card) {return;}

                selectedBundleId = card.dataset.id;
                deletePopup.showModal();

            });



        }
    }
}




/**
 * - Using the get /reservations/vendor.
 * - Update summary boxes.
 * - Add rows to active reservation table.
 */
async function loadVendorReservations() {


    const res = await apiGet("/reservations/vendor");

    const reservationContainer = document.getElementById("reservation-container");


    //If fails we show also reset the count
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        reservationContainer.innerHTML =
            `<p>Failed to load reservations${text ? ": " + text : ""}</p>`;

        if (reserved) reserved.textContent = "0";
        if (pickup) pickup.textContent = "0";
        return;
    }
    
    const reservations = await res.json();

    //Update bundle reserved and pick ups due today
    if (reserved) {
        reserved.textContent = String(reservations.length);
    }
    //Calculate pickups scheduled for today 
    const today = new Date();
    const pickupsToday = reservations.filter((r) => {
        return isSameDay(new Date(r.collectionStart), today);
    });

    if (pickup) {
        pickup.textContent = String(pickupsToday.length);

    }


    //If there are no reservation, show a message
    if (reservations.length === 0) {
        reservationContainer.innerHTML =
            `<p>No reservations found.</p>`;
        return;
    }

    // Render reservation rows
    for (let i = 0; i < reservations.length; i++) {

        const bundleId = reservations[i].bundleId;
        const forecastResponse = await apiGet("/forecast/predict/" + bundleId);

        let forecast;
        if(forecastResponse.ok) {
            const forecastJson = await forecastResponse.json();
            forecast = forecastJson.collection.collection_probability;
        } else {
            forecast = "-";
        }

        const name = reservations[i].bundleName;
        const price = reservations[i].amountDue;
        const collectionStart = reservations[i].collectionStart;
        const collectionEnd = reservations[i].collectionEnd;

        let tempHTML = `
            <div class="bundle-card-container" data-id="${bundleId}">
                    <div class="reservation-row bundle-header">
                        <span>BUNDLE NAME</span>
                        <span>PRICE</span>
                        <span>COLLECTION WINDOW</span>
                        <span>COLLECTION CHANCE</span>
                    </div>
                    <div class="reservation-row reservation-card">
                        <span class="bundle-name">${sanitise(name)}</span>
                        <div class="price">£${price.toFixed(2)}</div>
                        <div class="window">${formatPickupWindow(collectionStart, collectionEnd)}</div>
                        <div class="chance">${forecast}%</div>


          
                    </div>
                </div>
            `;

        reservationContainer.insertAdjacentHTML('beforeend', tempHTML);

    }

}



//Helper functions

//Formats ISO date strings into readable date and time window 
function formatPickupWindow(start, end) {
    if (!start || !end) return "-";

    const startDate = new Date(start);
    const endDate = new Date(end);

    const date = startDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const startTime = startDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const endTime = endDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${date}, ${startTime}–${endTime}`;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

//Helpers opens modal 
function openModal(title, body, isHtml = false) {
    modalTitle.textContent = title;

    if (isHtml) {
        modalBody.innerHTML = body;
    } else {
        modalBody.textContent = body;
    }

    modal.classList.remove("hidden");
}
//Closes modal 
function closeModal() {
    modal.classList.add("hidden");
}

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});



