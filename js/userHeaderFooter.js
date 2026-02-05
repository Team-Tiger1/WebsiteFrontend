function addHeader() {
    return `<header>
    <nav class="navbar">


      <ul id="navbar">

        <li>
          <a href="catalog.html" class="navbar-logo">
            <img src="img/simp_logo.png" alt="">
          </a>
        </li>

        <li><a href="catalog.html">Catalog</a></li>
        <li><a href="orders.html">Orders</a></li>
        <li><a href="impact.html">Impact</a></li>
        <li><a href="report.html">Report Issue</a></li>
        <li><a href="#" id="logout">Log Out</a></li>

        <a href="#" id="close"><i class="fa fa-times" aria-hidden="true"></i></a>

      </ul>

      <div id="mobile">
        <i id="bar" class="fa fa-outdent" aria-hidden="true"></i>
        <a href="cart.html"><i class="fa fa-shopping-cart" aria-hidden="true"></i></a>
      </div>
    </nav>
  </header>`;

}

function addFooter() {

    return `<footer class="part1">
    <div class="col">
      <h4>Contact</h4>
      <p> <strong>Address:</strong> Northcote House, The Queens's Drive, Exeter, Devon, EX4 4QJ, United Kingdom</p>
      <p> <strong>Phone:</strong> +07766832743</p>
      <p> <strong>Hours:</strong> 10:00-18:00, Mon - Sun</p>
     
    </div>

    <div class="col">
      <h4>About</h4>
      <a href="#">About us</a>
      <a href="#">Delivery Information</a>
      <a href="#">Privacy Policy</a>
      <a href="#">Terms and Conditions</a>
      <a href="#">Contact Us</a>
    </div>

    <div class="col">
      <h4>My Account</h4>
      <a href="orders.html">View Orders</a>
      <a href="#">Help</a>
    </div>

    <div class="copyright">
      <p>© 2026, The Last Fork</p>
    </div>
  </footer>`;
}



document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    if(header != null) {
        header.innerHTML = addHeader();
    }

    if(footer != null) {
        footer.innerHTML = addFooter();
    }

    const bar = document.getElementById('bar');
    const close = document.getElementById('close');
    const nav = document.getElementById('navbar');
    const overlay = document.getElementById('nav-overlay');

    if (bar){
        bar.addEventListener('click', () => {
            nav.classList.add('active');
            overlay.classList.add('active')
        })
    }

    if (close){
        close.addEventListener('click', () => {
            nav.classList.remove('active');
            overlay.classList.remove('active');
        })
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            nav.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

});

const logoutLink = document.getElementById("logout");
// Add event listener to logout link
// When clicked, it will clear the access token and redirect to the login
if (logoutLink) {
    logoutLink.addEventListener("click", () => {
        localStorage.removeItem("accessToken");
        window.location.href = "login.html";
    });
}