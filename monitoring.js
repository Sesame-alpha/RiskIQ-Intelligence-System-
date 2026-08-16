document.addEventListener("DOMContentLoaded", () => {

    // Protect the page
    if (
        window.RiskIQStorage &&
        !RiskIQStorage.isLoggedIn()
    ) {
        window.location.href = "login.html";
        return;
    }

    loadMonitoring();

});


function loadMonitoring() {

    const applications =
        RiskIQStorage.getApplications();

    const monitoringData =
        applications.map(application =>
            convertApplicationToMonitoring(application)
        );

    updateMonitoringKPIs(monitoringData);

    renderAlerts(monitoringData);

    renderMonitoringTable(monitoringData);

}


/* ================================
   CONVERT APPLICATION
================================ */

function convertApplicationToMonitoring(application) {

    const latePayments =
        Number(application.latePayments || 0);

    const previousDefaults =
        Number(application.previousDefaults || 0);

    let paymentStatus = "ON TIME";

    let severity = "good";

    let daysLate = 0;


    if (latePayments > 0) {

        paymentStatus = "LATE";

        severity = "warning";

        daysLate = latePayments;

    }


    if (previousDefaults > 0) {

        paymentStatus = "DEFAULT RISK";

        severity = "critical";

    }


    /*
        Applications created by Risk IQ do not necessarily
        have live repayment data yet.

        For the demo, monitoring uses the stored assessment
        information to demonstrate the monitoring workflow.
    */

    return {

        id:
            application.id ||
            Date.now(),

        name:
            application.fullName ||
            application.borrowerName ||
            "Unknown Borrower",

        phone:
            application.phone ||
            application.contactNumber ||
            "Not provided",

        loanAmount:
            Number(application.loanAmount || 0),

        riskScore:
            Number(application.riskScore || 0),

        latePayments,

        previousDefaults,

        paymentStatus,

        severity,

        daysLate,

        loanPurpose:
            application.loanPurpose ||
            "General Loan"

    };

}


/* ================================
   KPI
================================ */

function updateMonitoringKPIs(data) {

    const active =
        data.filter(
            item =>
                item.paymentStatus !== "DEFAULT"
        ).length;


    const warnings =
        data.filter(
            item =>
                item.severity === "warning"
        ).length;


    const late =
        data.filter(
            item =>
                item.latePayments > 0
        ).length;


    const defaults =
        data.filter(
            item =>
                item.severity === "critical"
        ).length;


    document.getElementById(
        "activeLoans"
    ).textContent = active;


    document.getElementById(
        "warningCount"
    ).textContent = warnings;


    document.getElementById(
        "lateCount"
    ).textContent = late;


    document.getElementById(
        "defaultCount"
    ).textContent = defaults;

}


/* ================================
   ALERTS
================================ */

function renderAlerts(data) {

    const container =
        document.getElementById(
            "monitoringAlerts"
        );


    const alerts =
        data.filter(
            item =>
                item.severity !== "good"
        );


    if (alerts.length === 0) {

        container.innerHTML = `

            <div class="empty-alert">

                <i class="fa-solid fa-circle-check"></i>

                <div>

                    <strong>
                        No active warnings
                    </strong>

                    <p>
                        Risk IQ has not detected any
                        immediate repayment concerns.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML =
        alerts.map(
            alert => createAlert(alert)
        ).join("");

}


function createAlert(item) {

    let icon =
        "fa-triangle-exclamation";

    let title =
        "Late Payment Warning";

    let message =
        `${item.name} has a repayment behaviour signal that requires attention.`;


    if (item.severity === "critical") {

        icon =
            "fa-circle-exclamation";

        title =
            "High Default Risk";

        message =
            `${item.name} has previous default behaviour and should be reviewed.`;

    }


    return `

        <div class="monitoring-alert ${item.severity}">

            <div class="alert-icon">

                <i class="fa-solid ${icon}"></i>

            </div>


            <div class="alert-content">

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>


            <button
                class="alert-review"
                onclick="reviewBorrower('${escapeHTML(item.id)}')"
            >

                Review

                <i class="fa-solid fa-arrow-right"></i>

            </button>

        </div>

    `;

}


/* ================================
   TABLE
================================ */

function renderMonitoringTable(data) {

    const table =
        document.getElementById(
            "monitoringTable"
        );


    if (data.length === 0) {

        table.innerHTML = `

            <tr>

                <td colspan="7">

                    <div class="empty-state">

                        <i class="fa-solid fa-chart-line"></i>

                        <strong>
                            No borrowers to monitor
                        </strong>

                        <p>
                            Completed loan assessments will
                            appear here.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        return;
    }


    table.innerHTML =
        data.map(
            borrower =>
                createMonitoringRow(borrower)
        ).join("");

}


function createMonitoringRow(item) {

    let statusClass =
        "good";

    let riskClass =
        "good";

    let statusText =
        "ON TIME";

    let riskText =
        "LOW";


    if (item.severity === "warning") {

        statusClass =
            "review";

        riskClass =
            "review";

        statusText =
            "LATE";

        riskText =
            "WATCH";

    }


    if (item.severity === "critical") {

        statusClass =
            "bad";

        riskClass =
            "bad";

        statusText =
            "DEFAULT RISK";

        riskText =
            "HIGH";

    }


    return `

        <tr>

            <td>

                <strong class="borrower-name">

                    ${escapeHTML(item.name)}

                </strong>

                <small class="borrower-id">

                    Loan ID: ${escapeHTML(item.id)}

                </small>

            </td>


            <td>

                <span class="phone-number">

                    ${escapeHTML(item.phone)}

                </span>

            </td>


            <td>

                <strong>

                    P${item.loanAmount.toLocaleString()}

                </strong>

                <small class="borrower-id">

                    ${escapeHTML(item.loanPurpose)}

                </small>

            </td>


            <td>

                <span class="status ${statusClass}">

                    ${statusText}

                </span>

            </td>


            <td>

                <strong>

                    ${item.daysLate}

                </strong>

            </td>


            <td>

                <span class="status ${riskClass}">

                    ${riskText}

                </span>

            </td>


            <td>

                <button
                    class="table-action"
                    onclick="reviewBorrower('${escapeHTML(item.id)}')"
                >

                    Review

                </button>

            </td>

        </tr>

    `;

}


/* ================================
   REVIEW
================================ */

function reviewBorrower(id) {

    const applications =
        RiskIQStorage.getApplications();


    const application =
        applications.find(
            item =>
                String(
                    item.id
                ) === String(id)
        );


    if (!application) {

        alert(
            "Borrower information could not be found."
        );

        return;
    }


    localStorage.setItem(
        "riskiq_review_application",
        JSON.stringify(application)
    );


    window.location.href =
        "risk-assessment.html";

}


/* ================================
   REFRESH
================================ */

function refreshMonitoring() {

    loadMonitoring();

}


/* ================================
   SIDEBAR
================================ */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("collapsed");


    document
        .querySelector(".main")
        .classList.toggle("collapsed");

}


/* ================================
   SECURITY
================================ */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
