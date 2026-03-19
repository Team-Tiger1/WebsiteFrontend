import {apiGet} from "./connection.js";
import {isAuthenticated} from "./auth.js";

const token = localStorage.getItem("accessToken");
const tableBody = document.getElementById("ordersBody");
const disputeMsg = document.getElementById("ordersMsg");

await isAuthenticated("USER");

await loadOrders();

/*prevents XSS*/
import {sanitise} from "./sanitise.js"

/**
 * Loads all the orders/reservations for the user.
 * These orders are displayed in the orders table
 * 
 */
async function loadOrders() {
    let response;
    try {

        response = await apiGet("/reservations?status=RESERVED"); //gets the orders that the user currently has reserved

    } catch (err) {
        console.error(err);
        return;
    }

    // if access token expires or they don't have one... log out
    if (response.status === 401) {
        localStorage.removeItem("accessToken");
        window.location.href = "login.html"
        return;
    }
    //converts the response to javascript object
    const reservation = await response.json();
    //refresh table

    //clears the table before adding new rows
    tableBody.innerHTML = "";
    if (reservation.length === 0) {
        disputeMsg.textContent = "Currently you have no Reservations";
    }

    for (let i = 0; i < reservation.length; i++) {
        const r = reservation[i];
        const reservationId = r.reservationId;
        const bundleId = r.bundle.bundleId;
        const bundleName = r.bundle.name;
        const pickupStartTime = r.bundle.collectionStart;
        const pickupEndTime = r.bundle.collectionEnd;
        const pickupTime = formatPickupTime(r.bundle.collectionStart, r.bundle.collectionEnd);
        const vendorName = r.vendorName;
        const vendorLocation = `${r.streetAddress}, ${r.postcode}`;


        let claimCode = "";
        if (reservationId) {
            claimCode = await getClaimCode(reservationId);
        }

        addReservation(bundleId, reservationId, claimCode, pickupTime, bundleName, vendorName, vendorLocation);
    }
}

// this function gets the claim code for a specfic reservation to be shown in the orders table
/**
 * Gets the claim code for a specific reservationID
 * This is the code shown to the supplier at collection
 * 
 * @param {*} reservationId 
 * @returns 
 */
async function getClaimCode(reservationId) {
    try {
        const response = await apiGet("/reservations/claimcode/" + encodeURIComponent(reservationId));

        if (!response.ok) {
            return "no code"
        }
        const contentType = response.headers.get("content-type")
        if (contentType.includes("application/json")) {
            const data = await response.json();
            return data.claimCode;
        }
    } catch(err) {
        console.error(err);
        return "error";
    }
}

//this function adds reservations to the orders table and is used for the load orders function
/**
 * takes each bundles/reservation info and inserts this into a row in
 * the orders table
 * 
 * @param {*} bundleId 
 * @param {*} reservationId 
 * @param {*} claimCode 
 * @param {*} pickupTime
 */
function addReservation(bundleId, reservationId, claimCode, pickupTime, bundleName, vendorName, vendorLocation) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${sanitise(bundleName ?? "-")}
    </td>

    <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${sanitise(pickupTime)}
    </td>

    <td style="padding: 12px; border-top: 1px solid #ffffff; font-weight: bold;">
      ${sanitise(claimCode ?? "-")}
    </td>
    
    <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${sanitise(vendorName ?? "-")}
    </td>
    
        <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${sanitise(vendorLocation ?? "-")}
    </td>
  `;
    //adds the row to the table body
    tableBody.appendChild(tr);
}

/**
 * Formats the pickup time for display in the orders table
 * as it is stored as ISO strings in the backend
 * so this converts the time to a readable format
 * @param {*} start
 * @param {*} end
 * @returns
 */
function formatPickupTime(start, end) {
  if (!start || !end) return "-";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const date = startDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const startTime = startDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const endTime = endDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return `${date}, ${startTime}–${endTime}`;
}