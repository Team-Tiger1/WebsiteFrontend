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

// import { apiGet } from "./connection.js";

// const tableBody = document.getElementById("reservations");

// // summary boxes (
// const reservedEl = document.getElementById("reservedCount");
// const pickupEl = document.getElementById("pickupCount");

// loadVendorReservations();

// async function loadVendorReservations() {
//   // clear table first
//   tableBody.innerHTML = "";

//   const res = await apiGet("/reservations/vendor");

//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     tableBody.innerHTML = `<tr><td colspan="4">Failed to load reservations${text ? ": " + text : ""}</td></tr>`;
//     return;
//   }

//   const reservations = await res.json();

//   // update summary boxes
//   if (reservedEl) reservedEl.textContent = String(reservations.length);

//   // reservations whose collectionStart is today === picks up that are today
//   if (pickupEl) {
//     const today = new Date();
//     const pickupsToday = reservations.filter(r =>
//       isSameDay(new Date(r.collectionStart), today)
//     );
//     pickupEl.textContent = String(pickupsToday.length);
//   }

//   if (!reservations.length) {
//     tableBody.innerHTML = `<tr><td colspan="4">No active reservations</td></tr>`;
//     return;
//   }

//   // render each row
//   for (const r of reservations) {
//     const pickupWindow = formatPickupTime(r.collectionStart, r.collectionEnd);

//     const tr = document.createElement("tr");
//     tr.innerHTML = `
//       <td>${(r.bundleName ?? "-")}</td>
//       <td>${pickupWindow}</td>
//       <td>Pending</td>
//       <td>${r.reservationId ? r.reservationId.slice(0, 8) + "..." : "-"}</td>
//     `;
//     tableBody.appendChild(tr);
//   }
// }

// function formatPickupTime(start, end) {
//   if (!start || !end) return "-";

//   const startDate = new Date(start);
//   const endDate = new Date(end);

//   const date = startDate.toLocaleDateString("en-GB", {
//     day: "numeric",
//     month: "short",
//     year: "numeric",});

//   const startTime = startDate.toLocaleTimeString("en-GB", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const endTime = endDate.toLocaleTimeString("en-GB", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return `${date}, ${startTime}–${endTime}`;
// }

// function isSameDay(a, b) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }
// dashboard

import { apiGet, apiPost } from "./connection.js";
import { isAuthenticated } from "./auth.js";

//only vendors can view this page
await isAuthenticated("VENDOR");

const posted = document.getElementById("postedCount");     // bundles Posted
const reserved = document.getElementById("reservedCount"); // Bundles Reserved
const pickup = document.getElementById("pickupCount");     // pickups Today


const tableBody = document.getElementById("reservations");

//running the dashboard with page loads
runDashboard();
async function runDashboard() {
  await loadVendorReservations();
  // await loadBundlesToday

}

// load vendor reservation

/**
 * Using the get /reservations/vendor
 * - update summary boxes
 * - add rows to active reservation table
 */
async function loadVendorReservations() {
  tableBody.innerHTML = "";

  const res = await apiGet("/reservations/vendor");

  //if fails we show also reset the count
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    tableBody.innerHTML =
      `<tr><td colspan="4">Failed to load reservations${text ? ": " + text : ""}</td></tr>`;

      if (reserved) reserved.textContent = "0";
    if (pickup) pickup.textContent = "0";
    return;
  }

  const reservations = await res.json();

  //update bundle reserved and pick ups today
  if (reserved) {
    reserved.textContent = String(reservations.length);
  }

  const today = new Date();
  const pickupsToday = reservations.filter((r) => {
    return isSameDay(new Date(r.collectionStart), today);
  });

  if (pickup){
    pickup.textContent = String(pickupsToday.length);

  }

  //Get Bundles Currently Posted and Display Metric
  const bundleResponse = await apiGet("/bundles/available");

  if(bundleResponse.ok) {
    const bundleJson = await bundleResponse.json();
    posted.textContent = String(bundleJson);
  } else {
    posted.textContent = "";
  }

  //if there are no reservation we show a message
  if (reservations.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4">No active reservations</td></tr>`;
    return;
  }

  // now we return the rows
  for (const r of reservations) {
    const pickupWindow = formatPickupWindow(r.collectionStart, r.collectionEnd);

    // create row
    const tr = document.createElement("tr");


    const claimSpanId = `claim-${r.reservationId}`;

    tr.innerHTML = `
      <td>${r.bundleName ?? "-"}</td>
      <td>${pickupWindow}</td>
      <td><span id="${claimSpanId}">Loading…</span></td>
      <td>
        <div style="display:flex; gap:8px; align-items:center;">
          <input
            type="text"
            placeholder="Enter code"
            class="claim-input"
            data-reservation-id="${r.reservationId}"
            style="padding:8px; border:1px solid #ddd; border-radius:8px; width:140px;"
          />
          <button
            type="button"
            class="primary-btn claim-btn"
            data-reservation-id="${r.reservationId}"
            style="padding:8px 12px; border-radius:8px;"
          >
            Complete
          </button>
        </div>
      </td>
    `;

    //add a row to table
    tableBody.appendChild(tr);
    //load the claim code for a reseservation
    await loadClaimCode(r.reservationId, claimSpanId);


  }
  wireUpCompleteButtons();
}

  //load the claim code for reservation
/**
 * Calls GET /reservations/claimcode/{reservationId}
 * write the claim code to the table
 */
async function loadClaimCode(reservationId, spanId) {
  const span = document.getElementById(spanId);
  if (!span) return;

  const res = await apiGet(`/reservations/claimcode/${reservationId}`);

  if (!res.ok) {
    span.textContent = "-";
    return;
  }

  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    span.textContent = data?.claimCode ?? "-";
  } else {
    const text = await res.text().catch(() => "");
    span.textContent = text || "-";
  }
}

/**
 * POST /reservations/claimcode
 * Body: { claimCode: "..." }
 *
 * reload reservations to refresh table + counts.
 */
function wireUpCompleteButtons() {
  const buttons = document.querySelectorAll(".claim-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const reservationId = btn.dataset.reservationId;

      // Find the input beside the button
      const input = document.querySelector(
        `.claim-input[data-reservation-id="${reservationId}"]`
      );

      const claimCode = (input?.value || "").trim();

      if (!claimCode) {
        alert("Enter a claim code first.");
        return;
      }

      const postRes = await apiPost("/reservations/claimcode", { claimCode });

      if (!postRes.ok) {
        const text = await postRes.text().catch(() => "");
        alert("Failed to complete reservation" + (text ? `: ${text}` : ""));
        return;
      }


      await loadVendorReservations();
    });
  });
}



//helper functions

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



