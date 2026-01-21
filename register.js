const form = document.getElementById("registerForm");
const msg = document.getElementById("msg");
const API = "https://thelastfork.shop/userservice";

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;
    const repeatPassword = document.getElementById("repeat-password-input").value;

    if(password != repeatPassword){
        msg.textContent="Passwords do not match, Please try again!";
        return;
    }
    msg.textContent = "Creating Account";

    const body = {
        email: email,
        password: password
    };

    fetch(API + "/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(function (response){
        if (!response.ok){
            msg.textContent = "Register failed";
            return null;
        }
        return response.json();
    })

    .then(function(data){
        if (data == null)
            return;

        console.log("Register response", data);
        msg.textContent = "Account created! Redirection to login."
        window.location.href = "login.html";
    
    });
    })
