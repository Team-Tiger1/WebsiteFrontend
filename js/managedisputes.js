import { apiGet, apiPost } from "./connection.js";
import { isAuthenticated } from "./auth.js";

await isAuthenticated("VENDOR");

const tableBody = document.getElementById("disputes");

/*prevents XSS*/
import {sanitise} from "./sanitise.js"

// modal elements
const modal = document.getElementById("disputeModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

let selectedDispute = null;

// run page
runManageDisputes();

async function runManageDisputes() {
    await loadDisputes();
}

async function loadDisputes() {
    tableBody.innerHTML = "";

    const res = await apiGet("/vendors/disputes");

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        tableBody.innerHTML =
            `<tr><td colspan="6">Failed to load disputes${text ? ": " + text : ""}</td></tr>`;
        return;
    }

    const disputes = await res.json();

    if (disputes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6">No current disputes</td></tr>`;
        return;
    }

    for (const d of disputes) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${shortDisputeId(d.disputeId)}</td>
            <td>${sanitise(d.bundleName ?? "-")}</td>
            <td>${sanitise(formatReason(d.reason))}</td>
            <td>${sanitise(formatStatus(d.status))}</td>
            <td>${sanitise(formatDate(d.createdAt))}</td>
            <td><button class="primary-btn view-dispute-btn" type="button">View</button></td>
        `;

        const viewButton = tr.querySelector(".view-dispute-btn");

        viewButton.addEventListener("click", () => {
            selectedDispute = d;

            const html = `
                <div class="dispute-details">
                    <p><strong>Dispute ID:</strong> ${d.disputeId ?? "-"}</p>
                    <p><strong>Bundle Name:</strong> ${sanitise(d.bundleName ?? "-")}</p>
                    <p><strong>Reason:</strong> ${sanitise(formatReason(d.reason))}</p>
                    <p><strong>Status:</strong> ${sanitise(formatStatus(d.status))}</p>
                    <p><strong>Date Opened:</strong> ${sanitise(formatDate(d.createdAt))}</p>
                    <p><strong>Description:</strong> ${sanitise(d.description ?? "-")}</p>
                    <p><strong>Vendor Response:</strong> ${sanitise(d.vendorResponse ?? "No response yet")}</p>
                </div>
            
                <div class="dispute-response-group">
                    <label for="vendorResponseInput">Your Response</label>
                    <textarea id="vendorResponseInput" rows="4" placeholder="Write your response here"></textarea>
                </div>
            
                <div class="dispute-action-row">
                    <div class="dispute-main-actions">
                        <button id="acceptDisputeBtn" class="primary-btn accept-btn" type="button">Accept</button>
                        <button id="dismissDisputeBtn" class="primary-btn reject-btn" type="button">Reject</button>
                        <br>
                    </div>
            
                    
                </div>
            `;


            openModal("Dispute Details", html, true);
            document.getElementById("modalCloseInline")?.addEventListener("click", closeModal);

            const acceptBtn = document.getElementById("acceptDisputeBtn");
            const dismissBtn = document.getElementById("dismissDisputeBtn");

            acceptBtn?.addEventListener("click", async () => {
                await updateDispute("APPROVED");
            });

            dismissBtn?.addEventListener("click", async () => {
                await updateDispute("REJECTED");
            });
        });

        tableBody.appendChild(tr);
    }
}

async function updateDispute(finalStatus) {
    if (!selectedDispute) {
        return;
    }

    const vendorResponseInput = document.getElementById("vendorResponseInput");
    const vendorResponse = (vendorResponseInput?.value || "").trim();

    if (!vendorResponse) {
        alert("Please enter a response first.");
        return;
    }

    try {
        const res = await apiPost("/vendors/disputes", {
            disputeId: selectedDispute.disputeId,
            finalStatus: finalStatus,
            vendorResponse: vendorResponse
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            alert("Failed to update dispute" + (text ? ": " + text : ""));
            return;
        }

        closeModal();
        await loadDisputes();
    } catch (err) {
        console.error(err);
        alert("Network error.");
    }
}

// helper functions
function formatDate(dateString) {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `${formattedDate}, ${formattedTime}`;
}

function formatReason(reason) {
    if (!reason) return "-";

    return reason
        .toLowerCase()
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function shortDisputeId(id) {
    if (!id) return "-";
    return id.slice(0, 8);
}

function formatStatus(status) {
    if (!status) {
        return "-";
    }

    const lowerCaseStatus = status.toLowerCase();
    const firstLetter = lowerCaseStatus.charAt(0).toUpperCase();
    const restOfWord = lowerCaseStatus.slice(1);

    return firstLetter + restOfWord;
}

// modal helpers
function openModal(title, body, isHtml = false) {
    modalTitle.textContent = title;

    if (isHtml) {
        modalBody.innerHTML = body;
    } else {
        modalBody.textContent = body;
    }

    modal.showModal();
}

function closeModal() {
    modal.close();
}

modalClose?.addEventListener("click", closeModal);
