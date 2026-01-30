//check if website is running locally
// const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const isLocal = false;

//export API url based on the above check for product or local deployment
export const API_URL = isLocal
    ? "http://localhost:8080/api"
    : "https://thelastfork.shop/api";