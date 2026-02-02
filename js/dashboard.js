// // adding fake data 
// const reservations = [
//     { bundle: "bundle name", window: "17:00–18:00", status: "Reserved", claim: "-" },
//     { bundle: "bundle name", window: "18:30–19:30", status: "Collected", claim: "-" },
//     { bundle: "bundle name", window: "16:00–17:00", status: "No-show", claim: "-" }
// ];
import { apiGet } from "./connection";

//summary boxes
const postedCountEl = document.getElementById("postedCount");
const reservedCountEl = document.getElementById("reservedCount");
const pickupCountEl = document.getElementById("pickupCount");
const savedKgEl = document.getElementById("savedKg");

//trying to get network response -- will delete 
async function loadSummaryBoxes() {
  try {
    const data = await apiGet("/dashboard/summary");

    // 👇 These keys MUST match your network response
    postedCountEl.textContent = data.posted;
    reservedCountEl.textContent = data.reserved;
    pickupCountEl.textContent = data.pickups;
    savedKgEl.textContent = data.savedKg;

  } catch (err) {
    console.error("Failed to load summary boxes", err);

    postedCountEl.textContent = "-";
    reservedCountEl.textContent = "-";
    pickupCountEl.textContent = "-";
    savedKgEl.textContent = "-";
  }
}



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

loadSummaryBoxes();