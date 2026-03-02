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
    carousel.scrollLeft = carousel.scrollLeft - move;
});

//adding the ability for users to navigate the page via arrows keys
document.addEventListener("keydown", (e) => {
    const focusable = [...document.querySelectorAll("a, button, input, select, textarea, [tabindex='0']")]; //gets all the elements on the page
    const current = document.activeElement; //gets the element that is currently selected
    const index = focusable.indexOf(current); 
    const tag = current.tagName; //gets the tag name of the current element

    //skips navigation if the user is currently focused on an input, textarea or select element which would affect typing or selecting options
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowRight") { //if the user presses the down or right arrow key move to the next element
        e.preventDefault();
        focusable[index + 1]?.focus(); //if there is a next element go to it if not do nothing
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { //if the user presses the up or left arrow key move to the previous  element
        e.preventDefault();
        focusable[index - 1]?.focus(); //if there is a previous element go to it if not do nothing
    }
});