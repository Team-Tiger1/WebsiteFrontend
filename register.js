const form = document.getElementById("registerForm");
const msg = document.getElementById("errorMsg");
const API = "https://thelastfork.shop/userservice";

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    if(password !== repeatPassword){
        msg.textContent="Passwords do not match, Please try again!";
        return;
    }
    msg.textContent = "Creating Account";

    const body = {email, password};
    

    fetch(API + "/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(async (response) =>{
        if (!response.ok){
            msg.textContent = "Register failed";
            return null;
        }
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")){
            return response.json();
        }
        return {};
    })

    .then((data) => {
        if (data == null)
            return;

        console.log("Register response", data);
        msg.textContent = "Account created! Redirection to login."
        window.location.href = "login.html";
    
    })
    .catch((err) => {
        console.err(err);
        msg.textContent = "Network failure";
    });
    });
