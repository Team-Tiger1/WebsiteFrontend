import {apiGet} from "./connection.js";
import { API_URL } from "./config.js";

const API = API_URL;
const token = localStorage.getItem("accessToken");
const tableBody = document.getElementById("ordersBody");

if (!token) {
    window.location.href = "login.html";
} else {
    //if the user is logged in load their orders
    loadOrders();
}

/**
 * Loads all the orders/reservations for the user.
 * These orders are displayed in the orders table
 * 
 */
async function loadOrders() {
    let response;
    try {

        response = await apiGet("/reservations");

    } catch (err) {
        console.error(err);
        return;
    }

    // if access token expires or they dont have one... log out
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

    for (let i = 0; i < reservation.length; i++) {
        const r = reservation[i];
        const reservationId = r.reservationId;
        const bundleId = r.bundle.bundleId;
        const bundleName = r.bundle.name;
        const pickupStartTime = r.bundle.pickupStartTime;
        const pickupEndTime = r.bundle.pickupEndTime;
        const pickupTime = formatPickupTime(r.pickupStartTime, r.pickupEndTime);


        let claimCode = "";
        if (reservationId) {
            claimCode = await getClaimCode(reservationId);
        }

        addReservation(bundleId, reservationId, claimCode, pickupTime, bundleName);
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
function addReservation(bundleId, reservationId, claimCode, pickupTime, bundleName) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
    <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${bundleName ?? "-"}
    </td>

    <td style="padding: 12px; border-top: 1px solid #ffffff;" title="${reservationId}">
      ${reservationId ? reservationId.slice(0, 8) + "..." : "-"}
    </td>

    <td style="padding: 12px; border-top: 1px solid #ffffff;">
      ${pickupTime}
    </td>

    <td style="padding: 12px; border-top: 1px solid #ffffff; font-weight: bold;">
      ${claimCode ?? "-"}
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