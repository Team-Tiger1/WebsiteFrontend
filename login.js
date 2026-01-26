const form = document.getElementById("loginForm");
const msg = document.getElementById("errorMsg");
const API = "https://thelastfork.shop/userservice";

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    const body = { email,password};

    msg.textContent = "Logging In";

    try{
        const response = await fetch(`${API}/users/login`,{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body),
        });

        if (!response.ok){
            msg.textContent = "Login failed";
            return;
        }
    
        let data = {};
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")){
            data = await response.json();
        }
    
        if (data.accessToken){
            localStorage.setItem("accessToken", data.accessToken);
        }
        
        window.location.href = "catalog.html";
    } catch (err){
        console.error(err);
        msg.textContent = "Network failure"   
    }
});

