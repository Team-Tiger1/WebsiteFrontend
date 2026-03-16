import {apiGet, apiPost, apiPatch} from "./connection.js";
import {isAuthenticated} from "./auth.js";

const accessToken = localStorage.getItem("accessToken");

await isAuthenticated("USER");

//delete account pop up
const deletePopup = document.getElementById("deletePopup");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const msg = document.getElementById("errorMsg");
const errorEmailMsg = document.getElementById("errorEmailMsg");
const changeEmailButton = document.getElementById("changeEmailButton");



//if the user clicks delete account button
deleteAccountButton.addEventListener("click", () => {
    deletePopup.showModal();
});

confirmDeleteButton.addEventListener("click", async () => {

    const deleteInput = document.getElementById("passwordConfirm").value;

//they have to type delete to be able to delete account for confirmation
    if (deleteInput.toLowerCase() !== "delete") {
        alert('Please type "delete" to confirm.');
        return;
    }

    const response = await apiGet("/users", { method: "DELETE" });

    if (response) {
        msg.textContent = "Account deleted successfully.";
        localStorage.removeItem("accessToken");
        window.location.href = "login.html";
    } else {
        msg.textContent = "Failed to delete account";
    }
});

cancelDeleteButton.addEventListener("click", () => {
    deletePopup.close();
});

const changePasswordButton = document.getElementById("changePasswordButton");

changePasswordButton.addEventListener("click", async () => {
    const oldPassword = document.getElementById("old-password-input").value;
    const newPassword = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    //check the password is new and not the same as lat
    if (!newPassword) {
        msg.textContent = "Please enter a new password.";
        return;
    }

    //check passwords match so no human error
    if (newPassword !== repeatPassword) {
        msg.textContent = "Passwords do not match, please try again!";
        return;
    }

    const response = await apiPatch("/users/password", {
        oldPassword: oldPassword,
        newPassword: newPassword
    });
    //if the password change is successful
    if (response && response.ok) {
        msg.textContent = "Password changed successfully!";
    } else {
        msg.textContent = "Failed to change password. Check your old password is correct.";
    }
});
//if the user clicks the change email button
changeEmailButton.addEventListener("click", async () => {
    const newEmail = document.getElementById("new-email-input").value.trim().toLowerCase(); //collect the new email and set to lowercase
    //if no new email is entered
    if (!newEmail) {
        errorEmailMsg.textContent = "Please enter a new email address.";
        return;
    }

    const response = await apiPatch("/users/me", {
        email: newEmail
    });

    if (response && response.ok) {
        errorEmailMsg.textContent = "Email changed successfully!"; //if email is successfully changed
        document.getElementById("new-email-input").value = "";
    } else {
        errorEmailMsg.textContent = "Failed to change email. Please try again."; //if the email change fails
    }
});

