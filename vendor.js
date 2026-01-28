import { apiGet, apiPost } from "./connection.js";

document.addEventListener('DOMContentLoaded', async (event) => {
    const vendorName = document.getElementById('vendorName');
    const vendorDescription = document.getElementById('vendorDescription');
    const phoneNumber = document.getElementById('phoneNumber');
    const emailAddress = document.getElementById('emailAddress');
    const streetAddress = document.getElementById('streetAddress');
    const postcode = document.getElementById('postcode');
    const map = document.getElementById('map');


    const vendorId = localStorage.getItem("vendorId");

    if(vendorId != null) {
        let vendorResponse = await apiGet("/vendors/" + vendorId);

        if(vendorResponse.status !== 200){
            window.location.href = "404.html";
        }

        let data = await vendorResponse.json();
        vendorName.innerHTML = data.companyName || "Unknown Company";
        vendorDescription.innerHTML = data.description || "";
        phoneNumber.innerHTML = data.phoneNumber || "Unknown Phone Number";
        emailAddress.innerHTML = data.email || "Unknown Email Address";
        streetAddress.innerHTML = data.streetAddress || "Unknown Street";
        postcode.innerHTML = data.postcode || "Unknown Postcode";

        const srcFirstHalf = "https://maps.google.com/maps?width=100%&height=600&hl=en&q=";
        const locationURI = encodeURIComponent(data.streetAddress);
        const srcSecondHalf = "&ie=UTF8&t=&z=14&iwloc=B&output=embed";
        map.src = srcFirstHalf + locationURI + srcSecondHalf;

    } else {
        window.location.href = "catalog.html";
    }


})