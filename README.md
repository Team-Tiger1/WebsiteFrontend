# Website Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)


## Overview
The Last Fork website is a food rescue marketplace designed to reduce food waste by connecting food vendors with consumers. Vendors can add their surplus products and create them into listed food bundles.
Customers in turn can reserve these food bundles at reduced prices compared to the market price and collect them using a confirmation code at a vendors store when paid for. The users can view their reservation in the order page. Furthermore, users can create disputes based off reserved bundles and receive a vendor response either accepting or rejecting their claim. Users can also view a impact page where they can view leaderboards and their badges based off their usage of the cite including a personnel impact summary section.
their orders page with their relevant collection information. A vendors location and information can be accessed directly through each vendors page made accessible on the catalog page vendor carousel.

The vendors side of the Last Fork website allows managers to view and manage pickups/reservations, create products and bundles.
Furthermore the forecast page allows users to gain forecast on collection probabilities based on factors such as weather.


## Tech Stack

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![CSS](https://img.shields.io/badge/CSS-639?style=for-the-badge&logo=css&logoColor=fff)



## Contributions CW1:

**Author: Toby Beckett**

- Created the Lofi Designs for the Login (supplier and user), register(Supplier and user), Orders, catalog, impact, and the report issue pages that are all on the user side of the website
- Created the user Login page: HTML, CSS and javascript
- Created the user Signup page: HTML, CSS and javascript
- Created the supplier Login page: HTML, CSS and javascript
- Created the supplier Signup page: HTML, CSS and javascript
- Created the users Catalog page: HTML, CSS and javascript
- Created the users Orders page: HTML, CSS and javascript
- Created the suppliers forecast page: HTML, CSS and javascript
- Created the index page: javascript and HTML
- Created the README file for the front end repository

<br>

**Author: William Foulger**
- Created the Lofi designs for the Dashboard, Forecast, Create produce, create bundle, Analytics and forecast pages
- Created the supplier Dashboard page: HTML, CSS, javascript
- Created the supplier Create Products page: HTML, CSS, javascript
- Created the supplier Create Bundles page: HTML, CSS, javascript

<br>

**Author: Daniel Jackson**
- Integrated the Authentication Mechanism into the Website
  - Created a check to see if the access token is valid
  - Created standard POST and GET methods with retry mechanisms
- Created the Vendor Page
  - Created Display for Vendor Information and Google Map Embed
  - Created List of Available Bundles with Drop-Down for Product List
- Created Standard Header and Footer for all Web pages
- Created Analytics page so Vendor's can see bundle performance across different time spans
- Created the badges

<br>

## Contributions CW2:

**Author: Toby Beckett**
- Added keyboard navigation to all pages
- Made all pages have the required WCAG accessibility colour contrast and text size
- Created the user impact page: HTML, CSS, JS
  - Added badges
  - Waste and Money leaderboards
  - Personnel impact summary
- Created the user disputes page so the user could start disputes based on bundles they have collected/reserved/noshow: HTML, CSS, JS
- Created search bar and filter catalog page
- Made all pages resistant to XSS through sanitization of displaying any user inputted information
- Created manage account page: HTML, CSS, JS
  - change email
  - change password
  - delete account
- Ensuring all pages and new ones are mobile accessible

<br>

**Author: Jed Leas**

Added minor bug fixes and features which included:
- Analytics page
  - Discount sell through rates graph
  - Average weights in summary box
  - Weights and Average weights in the raw data for:
    - Collected Bundles
    - No Show Bundles
    - Expired Bundles
  - Added mobile friendly formating
- Catalog Page
  - Adjusted disclaimer popup to include link to our Food Safety & Allergies page
- New Bundle Page
  - Disabled create new bundle while waiting for response
  - Added popup to make new bundle creation more clear
- Supplier Register Page
  - Fixed phone number length constraint

<br>

## External Resources
- Inline SVG elements were implemented using the W3C SVG namespace (http://www.w3.org/2000/svg). No external image assets were used.
- Our Company Logo was created in-house 
