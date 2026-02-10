// // adding fake data 
// const reservations = [
//     { bundle: "bundle name", window: "17:00–18:00", status: "Reserved", claim: "-" },
//     { bundle: "bundle name", window: "18:30–19:30", status: "Collected", claim: "-" },
//     { bundle: "bundle name", window: "16:00–17:00", status: "No-show", claim: "-" }
// ];



// const table = document.getElementById('reservations');
// //loop res 
// for (let i = 0; i < reservations.length; i++) {

//     table.innerHTML += `
//       <tr>
//         <td>${reservations[i].bundle}</td>
//         <td>${reservations[i].window}</td>
//         <td>${reservations[i].status}</td>
//         <td>${reservations[i].claim}</td>
//       </tr>
//     `;
//   }

// loadSummaryBoxes();

// import {apiGet, apiPost} from "./connection.js";
// import {isAuthenticated} from "./auth.js";

// // await isAuthenticated("VENDOR");
// import { apiGet } from "./connection.js";

//////this is tests
// testGetVendorReservations();

// async function testGetVendorReservations() {
//   try {
//     const res = await apiGet("/reservations/vendor");

//     console.log("GET /reservations/vendor status:", res.status);

//     const contentType = res.headers.get("content-type") || "";
//     console.log("content-type:", contentType);

//     if (!res.ok) {
//       const text = await res.text().catch(() => "");
//       console.log("Error body:", text);
//       return;
//     }

//     if (contentType.includes("application/json")) {
//       const data = await res.json();
//       console.log("Reservations JSON:", data);
//     } else {
//       const text = await res.text();
//       console.log("Non-JSON body:", text);
//     }
//   } catch (err) {
//     console.error("Network error calling /reservations/vendor:", err);
//   }
// }

import { apiGet } from "./connection.js";

const tableBody = document.getElementById("reservations");

// summary boxes (
const reservedEl = document.getElementById("reservedCount");
const pickupEl = document.getElementById("pickupCount");

loadVendorReservations();

async function loadVendorReservations() {
  // clear table first
  tableBody.innerHTML = "";

  const res = await apiGet("/reservations/vendor");

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    tableBody.innerHTML = `<tr><td colspan="4">Failed to load reservations${text ? ": " + text : ""}</td></tr>`;
    return;
  }

  const reservations = await res.json();

  // update summary boxes
  if (reservedEl) reservedEl.textContent = String(reservations.length);

  // reservations whose collectionStart is today === picks up that are today 
  if (pickupEl) {
    const today = new Date();
    const pickupsToday = reservations.filter(r =>
      isSameDay(new Date(r.collectionStart), today)
    );
    pickupEl.textContent = String(pickupsToday.length);
  }

  if (!reservations.length) {
    tableBody.innerHTML = `<tr><td colspan="4">No active reservations</td></tr>`;
    return;
  }

  // render each row
  for (const r of reservations) {
    const pickupWindow = formatPickupTime(r.collectionStart, r.collectionEnd);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(r.bundleName ?? "-")}</td>
      <td>${pickupWindow}</td>
      <td>Pending</td>
      <td>${r.reservationId ? r.reservationId.slice(0, 8) + "..." : "-"}</td>
    `;
    tableBody.appendChild(tr);
  }
}

function formatPickupTime(start, end) {
  if (!start || !end) return "-";

  const startDate = new Date(start);
  const endDate = new Date(end);

  const date = startDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",});

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