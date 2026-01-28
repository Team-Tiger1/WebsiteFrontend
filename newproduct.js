const form = document.getElementById("createProductForm");
const msg = document.getElementById("productMsg");
const API = "https://thelastfork.shop/api";

form.addEventListener("sumbit", async (e) =>{
    e.preventDefault();

    const name = document.getElementById("productName").value;
    const retailPrice = document.getElementById("retailPrice").value;
    const weight = document.getElementsById("weight").value;

    msg.textContent = "";

    if (!name || !retailPrice|| !weight ){
        msg.textContent = "please fill in all the fields";
        return
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken){
        msg.textContent = "you must be logged in to create a product";
        return
    }

    try{
        const response = await fetch(`${API}/products`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                name,
                retailPrice,
                weight
            }),
        });

    if (!response.ok){
            msg.textContent = "Failed to create product";
            return;
        }

        // backend may return empty body
        msg.textContent = "Product created successfully";
        form.reset();

    } catch (err){
        console.error(err);
        msg.textContent = err.message;   
    }
});