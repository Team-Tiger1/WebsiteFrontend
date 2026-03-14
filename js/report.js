import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

await isAuthenticated("USER");

//collect the html sections
const bundleSelect = document.getElementById("disputeSelect"); //specific bundle to raise dispute on
const reasonSelect = document.getElementById("reasonSelect");
const disputeDescription = document.getElementById("disputeDescription");
const disputSubmitButton = document.getElementById("disputeSubmitButton");
const disputeMsg = document.getElementById("disputeMsg");


/*prevents XSS*/
import {sanitise} from "./sanitise.js"


/**
 * loads the users current bundle reservations in all stages(noshow/reserved/collected)
 * then load these reservations into the dropdown for disputes
 * */
async function loadUserBundles(){
    const statuses = ["RESERVED", "COLLECTED", "NO_SHOW", "EXPIRED"];
    const allOrders = [];

    //go through each of the statuses and collect all orders for a possible disput
    for (const status of statuses) {
        const response = await apiGet(`/reservations?status=${status}`);
        if (response.ok) {
            const orders = await response.json();
            allOrders.push(...orders); //add to all orders
        }
    }

    //if the user has made no orders just show empty dropdown
    if(allOrders.length === 0){
        bundleSelect.innerHTML = "<option value=\"\">No Orders Found</option>";
        return;
    }
    //loop through each order and add it as an option in the bundle select drop down
    //each option shows the bundle name and stores the bundleID
    allOrders.forEach(order => {
        const option = document.createElement("option"); //add it as an option
        option.value = order.bundle.bundleId; //add the bundleID
        option.textContent = order.bundle.name; //add the bundle name
        bundleSelect.appendChild(option); //add as an option to the drop
    })
}

/**
 * Loads the user's disputes from the backend and displays them in a list on the page.
 * Each dispute is shown as a card with the bundle ID, reason, and description.
 * If there are no disputes or if there is an error loading them, an appropriate message is displayed.
 * @returns
 */
async function loadDisputes(){
    const list = document.getElementById("disputeList");
    const response = await apiGet("/users/dispute");

    if (!response.ok){ //if no disputes found show not found
        list.innerHTML = "<p>Could not load disputes.</p>";
        return;
    }

    const disputes = await response.json(); //collect the response
    //if the user has no disputes
    if(disputes.length === 0){
        list.innerHTML = "<p>You have no disputes</p>";
        return;
    }
    //Collect the response and place into card
    //if no response in final status just leave the dispute as pending
    //if no response just default as waiting for response otherwise return it
    list.innerHTML = ""; //reset the current disputes list
    disputes.forEach(dispute => { //for each disput add a card
        const card = document.createElement("div"); //create
        card.classList.add("dispute-card");
        card.setAttribute("aria-label", `Dispute: ${dispute.reason}, ${dispute.description}`); //each dispute has a reason, description
        card.innerHTML = ` 
            <p>Bundle Name: ${sanitise(dispute.bundleName)}</p> 
            <p>Reason: ${dispute.reason}</p>
            <p>Description: ${sanitise(dispute.description)}</p>
            <p>Status: ${dispute.status || "Pending"}</p>
            ${dispute.vendorResponse
            ? `<p>Vendor Response: ${sanitise(dispute.vendorResponse)}</p>`
            : `<p>Vendor Response: Awaiting response</p>`} 
        `;

        list.appendChild(card); //add a dispute card
    });

}

//submit a new dispute to a current bundle that they have ordered
disputSubmitButton.addEventListener("click", async ()=> {
    const bundleId = bundleSelect.value;
    const reason = reasonSelect.value;
    const description = disputeDescription.value.trim();

    //if the user doesnt fill in required information
    //if the user dosent select a bundle to actually start a disput against prompt
    if (!bundleId) {
        disputeMsg.textContent = "Please select a Bundle";
        return;
    }
    //if the user dosent enter a reason
    if (!reason) {
        disputeMsg.textContent = "Please enter a reason";
        return;
    }
    //if the user dosent enter a description to the issue
    if (!description) {
        disputeMsg.textContent = "Please enter a discription";
        return;
    }
    //post the dispute
    const response = await apiPost("/users/dispute", {
        bundleId: bundleId,
        reason: reason,
        description: description
    })
    //if the dispute is posted corrected show ok repsonse if not show dispute failed
    if (response.ok){
        //prompt dispute sent
        disputeMsg.textContent = "Dispute submitted";
        //reset the input fields to empty
        disputeDescription.value = "";
        reasonSelect.value = "";
        bundleSelect.value = "";
        loadDisputes();
    } else{
        disputeMsg.textContent = "Dispute failed";
    }

});

//call functions
loadUserBundles();
loadDisputes();