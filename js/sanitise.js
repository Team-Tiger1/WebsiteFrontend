// sanitise.js
export function sanitise(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}