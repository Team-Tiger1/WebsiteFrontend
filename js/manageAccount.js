import {apiGet, apiPost} from "./connection.js";
import {isAuthenticated} from "./auth.js";

const accessToken = localStorage.getItem("accessToken");

await isAuthenticated("USER");

//delete account pop up
const deletePopup = document.getElementById("deletePopup");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const deleteAccountButton = document.getElementById("deleteAccountButton");
const msg = document.getElementById("errorMsg");

//if the user clicks delete account button
deleteAccountButton.addEventListener("click", () => {
    deletePopup.showModal();
});

confirmDeleteButton.addEventListener("click", async () => {

    const response = await apiGet("/users", { method: "DELETE" });

    if (response) {
        msg.textContent = "Account deleted successfully.";
        localStorage.removeItem("accessToken");
        window.location.href = "index.html";
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

    const response = await apiPost("/users/password", {
        oldPassword: oldPassword,
        newPassword: newPassword
    }, { method: "PATCH" });

    if (response && response.ok) {
        msg.textContent = "Password changed successfully!";
    } else {
        msg.textContent = "Failed to change password. Check your old password is correct.";
    }
});

