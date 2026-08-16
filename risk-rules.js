/* =========================================================
   RISK IQ - LOAN APPLICATIONS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const searchInput =
            document.getElementById(
                "searchInput"
            );


        const decisionFilter =
            document.getElementById(
                "decisionFilter"
            );


        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        searchInput.addEventListener(
            "input",
            renderApplications
        );


        decisionFilter.addEventListener(
            "change",
            renderApplications
        );


        refreshButton.addEventListener(
            "click",
            renderApplications
        );


        renderApplications();



        /* =================================================
           RENDER
           ================================================= */

        function renderApplications() {

            const applications =
                RiskIQStorage.getApplications();


            updateStats(
                applications
            );


            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const filter =
                decisionFilter.value;


            const filtered =
                applications.filter(
                    function (application) {

                        const name =
                            String(
                                application.fullName || ""
                            ).toLowerCase();


                        const id =
                            String(
                                application.idNumber || ""
                            ).toLowerCase();


                        const matchesSearch =
                            name.includes(search) ||
                            id.includes(search);


                        const matchesDecision =
                            filter === "all" ||
                            application.decision === filter;


                        return (
                            matchesSearch &&
                            matchesDecision
                        );

                    }
                );


            const table =
                document.getElementById(
                    "applicationsTable"
                );


            table.innerHTML = "";


            if (filtered.length === 0) {

                table.innerHTML = `

                    <tr>

                        <td
                            colspan="6"
                            class="empty-table"
                        >

                            <i class="fa-solid fa-file-circle-xmark"></i>

                            <strong>
                                No applications found
                            </strong>

                            <span>
                                Completed borrower assessments will appear here.
                            </span>

                        </td>

                    </tr>

                `;

                return;

            }


            /*
             * Newest applications first
             */

            filtered
                .slice()
                .reverse()
                .forEach(
                    function (application) {

                        table.appendChild(
                            createRow(
                                application
                            )
                        );

                    }
                );

        }



        /* =================================================
           CREATE TABLE ROW
           ================================================= */

        function createRow(
            application
        ) {

            const row =
                document.createElement("tr");


            const score =
                Number(
                    application.riskScore
                ) || 0;


            let riskClass =
                "high";


            let riskText =
                "HIGH RISK";


            if (score >= 75) {

                riskClass =
                    "low";

                riskText =
                    "LOW RISK";

            }

            else if (score >= 50) {

                riskClass =
                    "medium";

                riskText =
                    "MEDIUM RISK";

            }


            let decisionClass =
                "review";


            if (
                application.decision ===
                "APPROVED"
            ) {

                decisionClass =
                    "approved";

            }

            else if (
                application.decision ===
                "DECLINED"
            ) {

                decisionClass =
                    "declined";

            }


            const date =
                application.createdAt
                    ? new Date(
                        application.createdAt
                    ).toLocaleDateString()
                    : "—";


            row.innerHTML = `

                <td>

                    <div class="borrower-cell">

                        <div class="borrower-avatar">

                            ${getInitials(
                                application.fullName
                            )}

                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    application.fullName ||
                                    "Unknown"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    application.idNumber ||
                                    "No ID"
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    <strong>
                        P${Number(
                            application.loanAmount || 0
                        ).toLocaleString()}
                    </strong>

                    <small>
                        ${application.loanTerm || 0} months
                    </small>

                </td>


                <td>

                    <div class="score-cell">

                        <strong>
                            ${score}/100
                        </strong>

                        <span class="risk-badge ${riskClass}">
                            ${riskText}
                        </span>

                    </div>

                </td>


                <td>

                    <span class="verification-badge
                        ${application.verificationStatus === "VERIFIED"
                            ? "verified"
                            : "pending"}">

                        <i class="fa-solid
                            ${application.verificationStatus === "VERIFIED"
                                ? "fa-circle-check"
                                : "fa-triangle-exclamation"}">
                        </i>

                        ${application.verificationStatus || "REVIEW"}

                    </span>

                </td>


                <td>

                    <span class="decision-badge ${decisionClass}">

                        ${application.decision || "PENDING"}

                    </span>

                </td>


                <td>

                    <span class="date-cell">
                        ${date}
                    </span>

                </td>

            `;


            return row;

        }



        /* =================================================
           STATISTICS
           ================================================= */

        function updateStats(
            applications
        ) {

            let approved = 0;

            let review = 0;

            let declined = 0;


            applications.forEach(
                function (application) {

                    if (
                        application.decision ===
                        "APPROVED"
                    ) {

                        approved++;

                    }

                    else if (
                        application.decision ===
                        "DECLINED"
                    ) {

                        declined++;

                    }

                    else {

                        review++;

                    }

                }
            );


            document.getElementById(
                "totalApplications"
            ).textContent =
                applications.length;


            document.getElementById(
                "approvedApplications"
            ).textContent =
                approved;


            document.getElementById(
                "reviewApplications"
            ).textContent =
                review;


            document.getElementById(
                "declinedApplications"
            ).textContent =
                declined;

        }



        /* =================================================
           INITIALS
           ================================================= */

        function getInitials(
            name
        ) {

            if (!name) {

                return "??";

            }


            return name
                .split(" ")
                .slice(0, 2)
                .map(
                    word =>
                        word.charAt(0)
                )
                .join("")
                .toUpperCase();

        }



        /* =================================================
           SAFE HTML
           ================================================= */

        function escapeHtml(
            text
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                text;


            return div.innerHTML;

        }

    }
);
