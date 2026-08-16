document.addEventListener(
    "DOMContentLoaded",
    function () {


        // ================= PROTECT PAGE =================

        RiskIQStorage.protectPage();


        // ================= USER =================

        const savedUser =
            localStorage.getItem("riskiq_user");


        if (savedUser) {

            const user =
                JSON.parse(savedUser);


            document.getElementById(
                "sidebarUserName"
            ).textContent = user.name;


            document.getElementById(
                "topUserName"
            ).textContent = user.name;


            document.getElementById(
                "welcomeUser"
            ).textContent = user.name;

        }


        // ================= SIDEBAR =================

        const sidebar =
            document.getElementById("sidebar");

        const main =
            document.getElementById("main");

        const sidebarToggle =
            document.getElementById("sidebarToggle");


        sidebarToggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("collapsed");

                main.classList.toggle("collapsed");

                const icon =
                    sidebarToggle.querySelector("i");


                if (
                    sidebar.classList.contains(
                        "collapsed"
                    )
                ) {

                    icon.className =
                        "fa-solid fa-chevron-right";

                } else {

                    icon.className =
                        "fa-solid fa-chevron-left";
                }

            }
        );


        // ================= LOGOUT =================

        document.getElementById(
            "logoutBtn"
        ).addEventListener(
            "click",
            function () {

                RiskIQStorage.logout();

            }
        );


        // ================= LOAD DATA =================

        const applications =
            RiskIQStorage.getApplications();


        const rules =
            RiskIQStorage.getRules();


        // ================= TOTAL =================

        const total =
            applications.length;


        document.getElementById(
            "totalApplications"
        ).textContent = total;


        // ================= RISK COUNTS =================

        let lowCount = 0;

        let mediumCount = 0;

        let highCount = 0;

        let approvedCount = 0;

        let totalScore = 0;


        applications.forEach(
            function (application) {


                const score =
                    Number(
                        application.riskScore
                    ) || 0;


                totalScore += score;


                // LOW RISK

                if (score >= 75) {

                    lowCount++;

                }


                // MEDIUM RISK

                else if (score >= 50) {

                    mediumCount++;

                }


                // HIGH RISK

                else {

                    highCount++;

                }


                // APPROVED

                if (
                    application.decision ===
                    "APPROVED"
                ) {

                    approvedCount++;

                }

            }
        );


        // ================= DISPLAY COUNTS =================

        document.getElementById(
            "approvedApplications"
        ).textContent = approvedCount;


        document.getElementById(
            "mediumApplications"
        ).textContent = mediumCount;


        document.getElementById(
            "highApplications"
        ).textContent = highCount;


        // ================= AVERAGE SCORE =================

        let averageScore = 0;


        if (total > 0) {

            averageScore =
                Math.round(
                    totalScore / total
                );

        }


        document.getElementById(
            "averageScore"
        ).textContent = averageScore;


        // ================= PERCENTAGES =================

        let lowPercent = 0;

        let mediumPercent = 0;

        let highPercent = 0;


        if (total > 0) {

            lowPercent =
                Math.round(
                    (lowCount / total) * 100
                );


            mediumPercent =
                Math.round(
                    (mediumCount / total) * 100
                );


            highPercent =
                Math.round(
                    (highCount / total) * 100
                );

        }


        // ================= DISPLAY PERCENTAGES =================

        document.getElementById(
            "lowPercent"
        ).textContent =
            lowPercent + "%";


        document.getElementById(
            "mediumPercent"
        ).textContent =
            mediumPercent + "%";


        document.getElementById(
            "highPercent"
        ).textContent =
            highPercent + "%";


        // ================= PROGRESS BARS =================

        document.getElementById(
            "lowBar"
        ).style.width =
            lowPercent + "%";


        document.getElementById(
            "mediumBar"
        ).style.width =
            mediumPercent + "%";


        document.getElementById(
            "highBar"
        ).style.width =
            highPercent + "%";


        // ================= RULE COUNT =================

        document.getElementById(
            "ruleCount"
        ).textContent =
            rules.length + " active rules";


        // ================= RECENT APPLICATIONS =================

        loadRecentApplications(
            applications
        );


    }
);


// ================================================
// LOAD RECENT APPLICATIONS
// ================================================

function loadRecentApplications(
    applications
) {


    const container =
        document.getElementById(
            "recentApplications"
        );


    // Clear current content

    container.innerHTML = "";


    // ============================================
    // EMPTY STATE
    // ============================================

    if (applications.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-file-circle-plus"></i>

                <h4>
                    No assessments yet
                </h4>

                <p>
                    Run your first borrower risk assessment
                    to see results here.
                </p>

            </div>

        `;

        return;

    }


    // ============================================
    // SHOW ONLY LAST 5
    // ============================================

    const recentApplications =
        applications.slice(0, 5);


    recentApplications.forEach(
        function (application) {


            const score =
                Number(
                    application.riskScore
                ) || 0;


            let riskLevel = "";
            let badgeClass = "";


            // ================= RISK LEVEL =================

            if (score >= 75) {

                riskLevel = "LOW RISK";

                badgeClass = "low-risk";

            }

            else if (score >= 50) {

                riskLevel = "MEDIUM RISK";

                badgeClass = "medium-risk";

            }

            else {

                riskLevel = "HIGH RISK";

                badgeClass = "high-risk";

            }


            // ================= DATE =================

            let dateText =
                "Recently assessed";


            if (application.createdAt) {

                const date =
                    new Date(
                        application.createdAt
                    );


                dateText =
                    date.toLocaleDateString();

            }


            // ================= NAME =================

            const name =
                application.fullName ||
                "Unknown Borrower";


            // ================= CREATE ROW =================

            const row =
                document.createElement("div");


            row.className =
                "application-row";


            row.innerHTML = `

                <div class="borrower-name">

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <small>
                        ${dateText}
                    </small>

                </div>


                <div class="score-box">

                    <strong>
                        ${score}/100
                    </strong>

                    <small>
                        RISK SCORE
                    </small>

                </div>


                <span
                    class="risk-badge ${badgeClass}"
                >
                    ${riskLevel}
                </span>

            `;


            container.appendChild(row);

        }
    );

}


// ================================================
// SAFE HTML DISPLAY
// ================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}
