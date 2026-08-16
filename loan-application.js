RiskIQStorage.protectPage();


function loadApplications() {

    const applications =
        RiskIQStorage.getApplications();


    document.getElementById(
        "totalApplications"
    ).textContent = applications.length;


    document.getElementById(
        "approvedApplications"
    ).textContent =
        applications.filter(
            app => app.decision === "APPROVED"
        ).length;


    document.getElementById(
        "declinedApplications"
    ).textContent =
        applications.filter(
            app => app.decision === "DECLINED"
        ).length;


    document.getElementById(
        "reviewApplications"
    ).textContent =
        applications.filter(
            app => app.decision === "HUMAN REVIEW"
        ).length;


    const list =
        document.getElementById(
            "applicationList"
        );


    list.innerHTML = "";


    if (applications.length === 0) {

        list.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-file-circle-xmark"></i>

                <h3>No loan applications yet</h3>

                <p>
                    Applications will appear here after a
                    borrower assessment is completed.
                </p>

            </div>

        `;

        return;

    }


    applications.forEach(application => {

        const row =
            document.createElement("div");

        row.className = "comparison-row";

        const decision =
            application.decision || "HUMAN REVIEW";


        row.innerHTML = `

            <span>
                <strong>
                    ${escapeHTML(
                        application.fullName || "Unknown"
                    )}
                </strong>
            </span>


            <span>

                ${application.riskScore ?? "--"}

                /100

            </span>


            <span>

                <span class="status ${
                    decision === "APPROVED"
                        ? "good"
                        : decision === "DECLINED"
                            ? "bad"
                            : "review"
                }">

                    ${decision}

                </span>

            </span>


            <span>

                ${
                    application.createdAt
                    ? new Date(
                        application.createdAt
                      ).toLocaleDateString()
                    : "--"
                }

            </span>

        `;


        list.appendChild(row);

    });

}


// ===============================
// SIDEBAR
// ===============================

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("collapsed");


    document
        .querySelector(".main")
        .classList.toggle("collapsed");

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


loadApplications();
