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

// await isAuthenticated("VENDOR");
import { apiGet } from "./connection.js";

// runs as soon as dashboard loads
testGetVendorReservations();

async function testGetVendorReservations() {
  try {
    const res = await apiGet("/reservations/vendor");

    console.log("GET /reservations/vendor status:", res.status);

    // If backend returns non-JSON errors sometimes, this helps debugging:
    const contentType = res.headers.get("content-type") || "";
    console.log("content-type:", contentType);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.log("Error body:", text);
      return;
    }

    if (contentType.includes("application/json")) {
      const data = await res.json();
      console.log("Reservations JSON:", data);
    } else {
      const text = await res.text();
      console.log("Non-JSON body:", text);
    }
  } catch (err) {
    console.error("Network error calling /reservations/vendor:", err);
  }
}
