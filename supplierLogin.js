const form = document.getElementById("loginForm");
const msg = document.getElementById("errorMsg");
const API = "https://thelastfork.shop/userservice";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    msg.textContent = "";

    if (!email || !password){
        msg.textContent = "Please enter an email and password";
        return;
    }

    try{
        const response = await fetch(`${API}/vendors/login`,
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok){
            msg.textContent = "Invalid credentials. Please Try Again";
            return;
        }
    
        const data = await response.json();

        if (data.accessToken){
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("accountType", "supplier");
        }
        
        window.location.href = "dashboard.html";
    } catch (err){
        console.error(err);
        msg.textContent = err.message;   
    }
});

