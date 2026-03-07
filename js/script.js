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
//track position when mouse is clicked and scroll by how much distance in x direction.
carousel.addEventListener("mousedown", (e) =>{
    click = true;
    startX = e.pageX - carousel.offsetLeft;
    scroll = carousel.scrollLeft;
});
//When the mouse leaves the carousel stop scrolling
carousel.addEventListener("mouseleave", ()=>{
    click = false;
});
//when the mouse is released stop scrolling
carousel.addEventListener("mouseup", ()=>{
    click = false;
});
//when the mouse moves and click scroll the carousel by the distance the mouse has moved
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

document.addEventListener("keydown", (e) => {
    const current = document.activeElement; //gets the element that is currently selected
    const tag = current.tagName; //gets the tag name of the current element

    //skips navigation if the user is currently selected on an input, textarea or select element which would affect inputing text or selecting check boxes etc
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    //gets all focusable elements but only within the current section
    const allFocusable = document.querySelectorAll("a, button, input, select, textarea, [tabindex='0']");
    const focusable = Array.from(allFocusable).filter(el => el.offsetParent !== null);
    const index = focusable.indexOf(current);

    if (e.key === "ArrowRight") { //move to next element within section
        e.preventDefault();
        focusable[index + 1]?.focus();
    } else if (e.key === "ArrowLeft") { //move to previous element within section
        e.preventDefault();
        focusable[index - 1]?.focus();
    } else if (e.key === "ArrowDown") { //jump to next section
        e.preventDefault();
        focusable[index + 1]?.focus();
    } else if (e.key === "ArrowUp") { //jump to previous section
        e.preventDefault();
        focusable[index - 1]?.focus();

    }
});
