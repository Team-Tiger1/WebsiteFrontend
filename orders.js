const API = "https://thelastfork.shop/api";
const token = localStorage.getItem("accessToken");
const tableBody = document.getElementById("ordersBody");

if(!token){
    window.location.href = "login.html";
} else{
    //if the user is logged in load their orders
    loadOrders();
}

//this functions loads the reservation for the user
async function loadOrders(){
    let response;
    try{
        response = await fetch (API + "/reservations",{
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            }
        })
    } catch(err){
        console.error(err);
        return;
    }

    // if access token expires or they dont have one... log out
    if (response.status == 401){
        localStorage.removeItem("accessToken");
        window.location.href = "login.html"
        return;
    }
    //converts the response to javascaript object
    const reservation = await response.json();
    //refresh table

    //clears the table before adding new rows
    tableBody.innerHTML = "";

    for (let i = 0; i<reservation.length; i++){
        const r = reservation[i];
        const reservationId = r.reservationId;
        const bundleId = r.bundleId;

        let claimCode = "";
        if(reservationId){
            claimCode = await getClaimCode(reservationId);
        }

        addReservation(bundleId, reservationId, claimCode);
    }
}

async function getClaimCode(reservationId) {
    try{
        const response = await fetch(API + "reservations/claimcode/" + encodeURIComponent(reservationId),
        {method: "GET",
        headers: {
            Authorization: "Bearer " + token
            }
        }
    )
    if (!response.ok){
        return "no code"
    }
        const contentType = response.headers.get("content-type")
        if (contentType.includes("application/json")){
            const data = await response.json();
            return data.claimCode;
        }
    } catch{
        console.error(err);
        return "error";
    }
}

function addReservation(bundleId, reservationId, claimCode){
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td style="padding: 12px; border-top: 1px solid #ffffff;" title="${reservationId}">
      ${reservationId ? reservationId.slice(0, 8) + "..." : "-"}
    </td>
    <td style="padding: 12px; border-top: 1px solid #ffffff;">${claimCode}</td>
  `;

  tableBody.appendChild(tr);
}