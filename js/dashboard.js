
// dashboard

import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

//Access control -- only users with the VENDOR role can access this page.
await isAuthenticated("VENDOR");

//Summary boxes
const posted = document.getElementById("postedCount");     // bundles Posted
const reserved = document.getElementById("reservedCount"); // Bundles Reserved
const pickup = document.getElementById("pickupCount");     // pickups Today


//Active reservation table
const tableBody = document.getElementById("reservations");

// getting the claim inputs and model elements 
const claimInput = document.getElementById("claimCodeInput");
const claimBtn = document.getElementById("claimCodeBtn");
const claimMsg = document.getElementById("claimMsg");

const modal = document.getElementById("claimModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

//running the dashboard with page loads
runDashboard();

async function runDashboard() {
    await loadVendorReservations();
    // await loadBundlesToday

}
/**
 * Claim Code submission handler.
 * Send POST request to validate and complete a reservation using claim code.
 * If successfull with display reservation details in a model and refreshes dashboard 
 
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
          <p><strong>Bundle:</strong> ${data.bundleName ?? "-"}</p>
          <p><strong>Pickup window:</strong> ${windowTxt}</p>
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

// load vendor reservation

/**
 * - Using the get /reservations/vendor.
 * - Update summary boxes.
 * - Add rows to active reservation table.
 */
async function loadVendorReservations() {
    tableBody.innerHTML = "";

    const res = await apiGet("/reservations/vendor");

    //If fails we show also reset the count
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        tableBody.innerHTML =
            `<tr><td colspan="3">Failed to load reservations${text ? ": " + text : ""}</td></tr>`;

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
    
    //load bundles currently available 
    const bundleResponse = await apiGet("/bundles/available");
    if (posted) {
        if (bundleResponse.ok) {
          posted.textContent = await bundleResponse.json();
        } else {
            posted.textContent = "0";
        }
    }

    //If there are no reservation, show a message
    if (reservations.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No active reservations</td></tr>`;
        return;
    }

    // Render reservation rows
    for (const r of reservations) {
        const pickupWindow = formatPickupWindow(r.collectionStart, r.collectionEnd);
        const amount = Number(r.amountDue);
        const priceText = Number.isFinite(amount) ? `£${amount.toFixed(2)}` : "-";

        const tr = document.createElement("tr");
        tr.innerHTML = `
    <td>${r.bundleName ?? "-"}</td>
    <td>${pickupWindow}</td>
    <td>${priceText}</td>
  `;
        tableBody.appendChild(tr);
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



