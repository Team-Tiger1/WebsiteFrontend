import {apiPost} from "./connection.js";
import {refreshAccessToken} from "./auth.js";
import { API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const msg = document.getElementById("errorMsg");
    const API = API_URL;
    const tcPopUp = document.getElementById("tcPopup");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        tcPopUp.showModal();
    });

//if the user closes
    document.getElementById("tcDecline").addEventListener("click", () => {
        tcPopUp.close();
    })

    document.getElementById("tcAccept").addEventListener("click", () => {
        //read and clean all the supplier register input fields
        const name = document.getElementById("name-input").value.trim();
        const streetAddress = document.getElementById("address-input").value.trim();
        const postcode = document.getElementById("postcode-input").value.trim();
        const description = document.getElementById("description-input").value.trim();
        const phoneNumber = document.getElementById("number-input").value.trim();
        const email = document.getElementById("email-input").value.trim().toLowerCase();
        const category = document.getElementById("category-input").value.trim().toUpperCase();
        const password = document.getElementById("password-input").value;
        const repeatPassword = document.getElementById("repeat-password-input").value;

        if (password !== repeatPassword) {
            msg.textContent = "Passwords do not match, Please try again!";
            return;
        }
        msg.textContent = "Creating Account";
        //collects the supplier registration information into one body to be sent to the backend endpoint
        const body = {name, streetAddress, postcode, description, phoneNumber, email, category, password};

        //send the body to the backend
        fetch(API + "/vendors/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body),
            credentials: "include"
        })
            //if their is a failure or incorrect response indicate it in the msg
            .then(async (response) => {
                if (!response.ok) {
                    msg.textContent = "Register failed";
                    return null;
                }
                //check the response content type is as expected
                const contentType = response.headers.get("content-type") || "";
                if (contentType.includes("application/json")) {
                    return response.json();
                }
                return {};
            })
            //if the response is successful for supplier registration
            .then((data) => {
                if (data == null)
                    return;

                console.log("Register response", data);
                //show the supplier the account has been created successfully
                msg.textContent = "Account created! Redirection to  supplier login."
                refreshAccessToken().then(() => {
                    window.location.href = "supplierLogin.html";
                })

            })
            //if there is a failure with the nextwork or some other fialure indicate network failure to the user
            .catch((err) => {
                console.error(err);
                msg.textContent = "Network failure";
            });
    });
});
