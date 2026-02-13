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

//summary boxes
const posted = document.getElementById("postedCount");     // bundles Posted
const reserved = document.getElementById("reservedCount"); // Bundles Reserved
const pickup = document.getElementById("pickupCount");     // pickups Today


//table
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
claimBtn?.addEventListener("click", async () => {
  const claimCode = (claimInput?.value || "").trim();

  claimMsg.textContent = "";

  if (!claimCode) {
    claimMsg.textContent = "Enter a claim code first.";
    return;
  }

  try {
    // POST claim code -> backend should mark reservation as collected
    const res = await apiPost("/reservations/claimcode", { claimCode });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      claimMsg.textContent = "Invalid claim code" + (text ? `: ${text}` : "");
      return;
    }

    // Try to show something in the modal (response might be json or empty)
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json().catch(() => null);

      // If backend returns bundle/reservation info --> show it 
      if (data) {
        openModal(
          "Reservation completed ",
          JSON.stringify(data, null, 2)
        );
      } else {
        openModal("Reservation completed ", "Claim code accepted.");
      }
    } else {
      openModal("Reservation completed ", "Claim code accepted.");
    }

    // Refresh the table + counts
    claimInput.value = "";
    await loadVendorReservations();

  } catch (err) {
    console.error(err);
    claimMsg.textContent = err.message || "Network error.";
  }
});

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
      `<tr><td colspan="3">Failed to load reservations${text ? ": " + text : ""}</td></tr>`;

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

  const bundleResponse = await apiGet("/bundles/available");
if (posted) {
  if (bundleResponse.ok) {
    const bundleJson = await bundleResponse.json();
    posted.textContent = Array.isArray(bundleJson) ? String(bundleJson.length) : "0";
  } else {
    posted.textContent = "0";
  }
}

  //if there are no reservation we show a message
  if (reservations.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3">No active reservations</td></tr>`;
    return;
  }

  // now we return the rows
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

//   //load the claim code for reservation
// /**
//  * Calls GET /reservations/claimcode/{reservationId}
//  * write the claim code to the table
//  */
// async function loadClaimCode(reservationId, spanId) {
//   const span = document.getElementById(spanId);
//   if (!span) return;

//   const res = await apiGet(`/reservations/claimcode/${reservationId}`);

//   if (!res.ok) {
//     span.textContent = "-";
//     return;
//   }

//   const contentType = res.headers.get("content-type") || "";

//   if (contentType.includes("application/json")) {
//     const data = await res.json().catch(() => null);
//     span.textContent = data?.claimCode ?? "-";
//   } else {
//     const text = await res.text().catch(() => "");
//     span.textContent = text || "-";
//   }
// }

/**
 * POST /reservations/claimcode
 * Body: { claimCode: "..." }
 *
 * reload reservations to refresh table + counts.
 */
// function wireUpCompleteButtons() {
//   const buttons = document.querySelectorAll(".claim-btn");

//   buttons.forEach((btn) => {
//     btn.addEventListener("click", async () => {
//       const reservationId = btn.dataset.reservationId;

//       // Find the input beside the button
//       const input = document.querySelector(
//         `.claim-input[data-reservation-id="${reservationId}"]`
//       );

//       const claimCode = (input?.value || "").trim();

//       if (!claimCode) {
//         alert("Enter a claim code first.");
//         return;
//       }

//       const postRes = await apiPost("/reservations/claimcode", { claimCode });

//       if (!postRes.ok) {
//         const text = await postRes.text().catch(() => "");
//         alert("Failed to complete reservation" + (text ? `: ${text}` : ""));
//         return;
//       }


//       await loadVendorReservations();
//     });
//   });
// }



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
//helper function for the pop up 
function openModal(title, body) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});



