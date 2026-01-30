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

const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');



document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");

    if(header != null) {
        header.innerHTML = addHeader();
    }

    if(footer != null) {
        footer.innerHTML = addFooter();
    }

    if (bar){
        bar.addEventListener('click', () => {
            nav.classList.add('active');
        })
    }

    if (close){
        close.addEventListener('click', () => {
            nav.classList.remove('active');
        })
    }

});