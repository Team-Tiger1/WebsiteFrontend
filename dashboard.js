// adding fake data 
const reservations = [
    { bundle: "bundle name", window: "17:00–18:00", status: "Reserved", claim: "-" },
    { bundle: "bundle name", window: "18:30–19:30", status: "Collected", claim: "-" },
    { bundle: "bundle name", window: "16:00–17:00", status: "No-show", claim: "-" }
];
const table = document.getElementById('reservations');
//loop res 
for (let i = 0; i < reservations.length; i++) {

    table.innerHTML += `
      <tr>
        <td>${reservations[i].bundle}</td>
        <td>${reservations[i].window}</td>
        <td>${reservations[i].status}</td>
        <td>${reservations[i].claim}</td>
      </tr>
    `;
  }