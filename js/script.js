const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accountType");
    window.location.href = "login.html";
    });
}

// carousel scrollable via click
const carousel = document.getElementById("vendorCarousel");
let click = false;
//stores position of the mouse before and after
let startX;
let scroll;

carousel.addEventListener("mousedown", (e) =>{
    click = true;
    startX = e.pageX - carousel.offsetLeft;
    scroll = carousel.scrollLeft;
});

carousel.addEventListener("mouseleave", ()=>{
    click = false;
});

carousel.addEventListener("mouseup", ()=>{
    click = false;
});

carousel.addEventListener("mousemove", (e)=>{
    //if mouse not being clicked do nothing
    if (!click){
        return;
    }

    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const move = (x - startX) * 1.5
    carousel.scrollLeft = scrollLeft - move;
});
