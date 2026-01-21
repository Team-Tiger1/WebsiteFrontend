const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const API = "https://thelastfork.shop/userservice";

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    const body = {
        username: email,
        password: password
    };
    msg.textContent = "Logging In";

    fetch(API + "/users/login",{
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    .then(function (response){
        if (!response.ok){
            msg.textContent = "Login failed";
            return null;
    }
        return response.json();
    })
    .then(function (data) {
        if (!data)
            return;

        console.log("Login response:",  data);
        localStorage.setItem("accessToken", data.accessToken);
        window.location.href="catalog.html";
    });
    });


