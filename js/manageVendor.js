import { apiPatch , apiGet } from "./connection.js";
import { isAuthenticated } from "./auth.js";

await isAuthenticated("VENDOR");

//test to see the the vendor details before and after
await apiGet("/vendors/me");
// await apiPatch("/vendors/password")

//get the current details of the vendor
const vendorme = await apiGet("/vendors/me");
const vendorDets = await vendorme.json();
//fill in the current details
document.getElementById("company-name-input").placeholder = vendorDets.companyName || "";
document.getElementById("vendor-email-input").placeholder = vendorDets.email || "";
document.getElementById("street-address-input").placeholder = vendorDets.streetAddress || "";
document.getElementById("postcode-input").placeholder = vendorDets.postcode || "";
document.getElementById("phone-number-input").placeholder = vendorDets.phoneNumber || "";
document.getElementById("description-input").placeholder = vendorDets.description || "";

const updateVendorButton = document.getElementById("updateVendorButton");
const vendorMsg = document.getElementById("vendorMsg");

//runs when the vendor clicks save changes
updateVendorButton.addEventListener("click", async () => {
    vendorMsg.textContent = "";

    //read and clean inputs
    const companyName = document.getElementById("company-name-input").value.trim();
    const email = document.getElementById("vendor-email-input").value.trim().toLowerCase();
    const streetAddress = document.getElementById("street-address-input").value.trim();
    const postcode = document.getElementById("postcode-input").value.trim();
    const phoneNumber = document.getElementById("phone-number-input").value.trim();
    const description = document.getElementById("description-input").value.trim();

    //create an empty payload then add to it if the vendor fills it in
    const payload = {};
    if (companyName) payload.companyName = companyName;
    if (email) payload.email = email;
    if (streetAddress) payload.streetAddress = streetAddress;
    if (postcode) payload.postcode = postcode;
    if (phoneNumber) payload.phoneNumber = phoneNumber;
    if (description) payload.description = description;

    //stop and return message if the vendor hasn't entered anything
    if (Object.keys(payload).length === 0) {
        vendorMsg.textContent = "Please enter at least one field to update   ";
        return;
    }


    // send the patch to update the vendor details
    const response = await apiPatch("/vendors/me", payload);

    if (response && response.ok) {
        vendorMsg.textContent = "Vendor details updated successfully!";

        document.getElementById("company-name-input").value = "";
        document.getElementById("vendor-email-input").value = "";
        document.getElementById("street-address-input").value = "";
        document.getElementById("postcode-input").value = "";
        document.getElementById("phone-number-input").value = "";
        document.getElementById("description-input").value = "";
    } else {
        vendorMsg.textContent = "Failed to update vendor details. Please try again  ";
    }
});
//password section
const changePasswordButton = document.getElementById("changePasswordButton");
const passwordMsg = document.getElementById("passwordMsg");
//runs when the vendor clicks change password
changePasswordButton.addEventListener("click", async () => {
    // Clear old password message
    passwordMsg.textContent = "";

    const oldPassword = document.getElementById("old-password-input").value;
    const newPassword = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    // check if all fields have been field in
    if (!oldPassword || !newPassword || !repeatPassword) {
        passwordMsg.textContent = "Please fill in all password fields";
        return;
    }

    // check if new password is same as old
    if (oldPassword === newPassword) {
        passwordMsg.textContent = "New password must be different from your current password";
        return;
    }

    // check if the passwords match
    if (newPassword !== repeatPassword) {
        passwordMsg.textContent = "Passwords do not match, please try again";
        return;
    }

    // update the password using patch
    const response = await apiPatch("/vendors/password", {
        oldPassword: oldPassword,
        newPassword: newPassword
    });

    if (response && response.ok) {
        passwordMsg.textContent = "Password changed successfully!";

        document.getElementById("old-password-input").value = "";
        document.getElementById("password-input").value = "";
        document.getElementById("repeat-password-input").value = "";
    } else {
        passwordMsg.textContent = "Failed to change password. Check your current password";
    }
});

//delete the vendor account section
const deleteVendorPopup = document.getElementById("deleteVendorPopup");
const confirmDeleteVendorButton = document.getElementById("confirmDeleteVendorButton");
const cancelDeleteVendorButton = document.getElementById("cancelDeleteVendorButton");
const deleteVendorButton = document.getElementById("deleteVendorButton");
const deleteMsg = document.getElementById("deleteMsg");

//if vendor clicks delete account button --> open popup
deleteVendorButton.addEventListener("click", () => {
    deleteMsg.textContent = "";
    vendorMsg.textContent = "";
    passwordMsg.textContent = "";
    document.getElementById("deleteVendorConfirm").value = "";
    deleteVendorPopup.showModal();
});
//if vendor confirms delete
confirmDeleteVendorButton.addEventListener("click", async () => {
    const deleteInput = document.getElementById("deleteVendorConfirm").value.trim();

    // they must type delete to confirm
    if (deleteInput.toLowerCase() !== "delete") {
        deleteMsg.textContent = 'please type "delete" to confirm';
        return;
    }

    const response = await apiGet("/vendors", { method: "DELETE" });

    if (response && response.ok) {
        localStorage.removeItem("accessToken");
        window.location.href = "login.html";
    } else {
        deleteMsg.textContent = "failed to delete vendor account";
        deleteVendorPopup.close();
    }
});

// if vendor clicks cancel, close popup
cancelDeleteVendorButton.addEventListener("click", () => {
    deleteVendorPopup.close();
});

