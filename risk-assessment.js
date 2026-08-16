/* =========================================================
   RISK IQ - RISK ASSESSMENT ENGINE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // Protect page
    if (
        window.RiskIQStorage &&
        !RiskIQStorage.isLoggedIn()
    ) {
        window.location.href = "login.html";
        return;
    }


    const form =
        document.getElementById("riskAssessmentForm");

    const verificationStatus =
        document.getElementById("verificationStatus");

    const riskResult =
        document.getElementById("riskResult");

    const riskScore =
        document.getElementById("riskScore");

    const riskLevel =
        document.getElementById("riskLevel");

    const scoreProgress =
        document.getElementById("scoreProgress");

    const reasoningList =
        document.getElementById("reasoningList");

    const reviewButton =
        document.getElementById("reviewButton");


    /* =====================================================
       FORM SUBMISSION
       ===================================================== */

    form.addEventListener("submit", function(event) {

        event.preventDefault();


        const borrower = getBorrowerData();


        // STEP 1
        updateStep(2);


        // STEP 2
        const verification =
            verifyBorrower(borrower);


        showVerification(verification);


        /*
         * We do NOT automatically approve a borrower
         * when verification fails.
         *
         * Human review is required.
         */

        if (!verification.verified) {

            const assessment = {
                score: 0,
                level: "REQUIRES REVIEW",
                reasons: [
                    "The supplied borrower information could not be fully matched with stored records.",
                    "Risk calculation has been paused.",
                    "A human reviewer should verify the information before making a lending decision."
                ]
            };

            showRiskResult(
                assessment.score,
                assessment.level,
                assessment.reasons
            );

            saveAssessment(
                borrower,
                assessment,
                verification
            );

            return;
        }


        // VERIFIED
        updateStep(3);


        // Calculate derived values
        borrower.debtRatio =
            calculateDebtRatio(borrower);

        borrower.affordability =
            calculateAffordability(borrower);


        // Run lender-defined rules
        const assessment =
            calculateRiskScore(borrower);


        // Show result
        showRiskResult(
            assessment.score,
            assessment.level,
            assessment.reasons
        );


        updateStep(4);


        // Save application
        saveAssessment(
            borrower,
            assessment,
            verification
        );

    });


    /* =====================================================
       GET FORM DATA
       ===================================================== */

    function getBorrowerData() {

        return {

            id: Date.now(),

            fullName:
                document.getElementById("fullName").value.trim(),

            idNumber:
                document.getElementById("idNumber").value.trim(),

            employmentStatus:
                document.getElementById("employmentStatus").value,

            yearsEmployed:
                Number(
                    document.getElementById("yearsEmployed").value
                ) || 0,

            monthlyIncome:
                Number(
                    document.getElementById("monthlyIncome").value
                ) || 0,

            monthlyExpenses:
                Number(
                    document.getElementById("monthlyExpenses").value
                ) || 0,

            monthlyDebt:
                Number(
                    document.getElementById("monthlyDebt").value
                ) || 0,

            incomeStability:
                document.getElementById("incomeStability").value,

            loanAmount:
                Number(
                    document.getElementById("loanAmount").value
                ) || 0,

            loanTerm:
                Number(
                    document.getElementById("loanTerm").value
                ) || 0,

            previousLoans:
                Number(
                    document.getElementById("previousLoans").value
                ) || 0,

            latePayments:
                Number(
                    document.getElementById("latePayments").value
                ) || 0,

            previousDefaults:
                Number(
                    document.getElementById("previousDefaults").value
                ) || 0,

            repaymentBehaviour:
                document.getElementById("repaymentBehaviour").value

        };

    }


    /* =====================================================
       DATA VERIFICATION
       ===================================================== */

    function verifyBorrower(borrower) {

        const database =
            RiskIQStorage.getVerificationData();


        /*
         * Demo verification:
         *
         * Match the supplied ID against the locally
         * stored verification records.
         */

        const match =
            database.find(record =>
                String(record.idNumber).trim() ===
                String(borrower.idNumber).trim()
            );


        if (!match) {

            return {

                verified: false,

                reason:
                    "No matching identity record was found."

            };

        }


        const nameMatches =
            normalise(match.fullName) ===
            normalise(borrower.fullName);


        const employmentMatches =
            match.employmentStatus ===
            borrower.employmentStatus;


        const incomeMatches =
            Number(match.monthlyIncome) ===
            Number(borrower.monthlyIncome);


        const debtMatches =
            Number(match.monthlyDebt) ===
            Number(borrower.monthlyDebt);


        const checks = [

            {
                name: "Identity",
                passed: true
            },

            {
                name: "Name",
                passed: nameMatches
            },

            {
                name: "Employment",
                passed: employmentMatches
            },

            {
                name: "Income",
                passed: incomeMatches
            },

            {
                name: "Debt information",
                passed: debtMatches
            }

        ];


        const failed =
            checks.filter(check => !check.passed);


        if (failed.length === 0) {

            return {

                verified: true,

                match: match,

                checks: checks

            };

        }


        return {

            verified: false,

            match: match,

            checks: checks,

            reason:
                failed.map(item => item.name)
                    .join(", ") +
                " information does not match stored data."

        };

    }


    function normalise(value) {

        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    }


    /* =====================================================
       DERIVED RISK VALUES
       ===================================================== */

    function calculateDebtRatio(borrower) {

        if (borrower.monthlyIncome <= 0) {
            return 1;
        }

        return (
            borrower.monthlyDebt /
            borrower.monthlyIncome
        );

    }


    function calculateAffordability(borrower) {

        if (borrower.monthlyIncome <= 0) {
            return 0;
        }

        return (
            borrower.monthlyIncome -
            borrower.monthlyExpenses -
            borrower.monthlyDebt
        );

    }


    /* =====================================================
       RISK ENGINE
       ===================================================== */

    function calculateRiskScore(borrower) {

        const rules =
            RiskIQStorage.getRules();


        let score = 0;

        const reasons = [];


        /*
         * Every rule stored by the lender is evaluated here.
         *
         * Maximum score is normalised to 100.
         */

        let maximumPoints = 0;


        rules.forEach(rule => {

            const points =
                Number(rule.points) || 0;


            maximumPoints += points;


            const result =
                evaluateRule(
                    rule,
                    borrower
                );


            if (result.passed) {

                score += points;

                reasons.push(
                    `${rule.name}: ${result.reason}`
                );

            } else {

                reasons.push(
                    `${rule.name}: ${result.reason}`
                );

            }

        });


        /*
         * If no rules exist, don't pretend the system
         * produced a meaningful score.
         */

        if (maximumPoints <= 0) {

            return {

                score: 0,

                level: "REQUIRES REVIEW",

                reasons: [
                    "No active risk rules are configured."
                ]

            };

        }


        // Convert lender's rule points to 0-100.
        score =
            Math.round(
                (score / maximumPoints) * 100
            );


        // Never allow values outside 0-100.
        score =
            Math.max(
                0,
                Math.min(100, score)
            );


        let level;


        if (score >= 75) {

            level = "LOW RISK";

        } else if (score >= 50) {

            level = "MEDIUM RISK";

        } else {

            level = "HIGH RISK";

        }


        return {

            score,

            level,

            reasons

        };

    }


    /* =====================================================
       RULE EVALUATION
       ===================================================== */

    function evaluateRule(rule, borrower) {

        const field =
            rule.field;

        const condition =
            rule.condition;


        const value =
            borrower[field];


        /* REPAYMENT BEHAVIOUR */

        if (field === "repaymentBehaviour") {

            const order = {
                poor: 1,
                average: 2,
                good: 3,
                excellent: 4
            };


            const actual =
                order[value] || 0;

            const required =
                order[condition] || 0;


            if (actual >= required) {

                return {

                    passed: true,

                    reason:
                        `Repayment behaviour meets the ${condition} threshold.`

                };

            }


            return {

                passed: false,

                reason:
                    `Repayment behaviour is below the ${condition} threshold.`

            };

        }


        /* INCOME STABILITY */

        if (field === "incomeStability") {

            if (value === condition) {

                return {

                    passed: true,

                    reason:
                        `Income stability is ${value}.`

                };

            }


            return {

                passed: false,

                reason:
                    `Income stability is ${value || "not provided"}.`

            };

        }


        /* PREVIOUS DEFAULTS */

        if (field === "previousDefaults") {

            if (
                condition === "zero" &&
                Number(value) === 0
            ) {

                return {

                    passed: true,

                    reason:
                        "No previous defaults were recorded."

                };

            }


            if (
                condition === "positive" &&
                Number(value) > 0
            ) {

                return {

                    passed: true,

                    reason:
                        "Previous default history meets the configured condition."

                };

            }


            return {

                passed: false,

                reason:
                    `${Number(value)} previous default(s) recorded.`

            };

        }


        /* DEBT RATIO */

        if (field === "debtRatio") {

            const ratio =
                Number(value) || 0;


            if (condition === "low") {

                if (ratio <= 0.30) {

                    return {

                        passed: true,

                        reason:
                            `Debt-to-income ratio is ${(ratio * 100).toFixed(1)}%, within the low-risk range.`

                    };

                }

                return {

                    passed: false,

                    reason:
                        `Debt-to-income ratio is ${(ratio * 100).toFixed(1)}%.`

                };

            }


            if (condition === "moderate") {

                if (
                    ratio > 0.30 &&
                    ratio <= 0.50
                ) {

                    return {

                        passed: true,

                        reason:
                            `Debt-to-income ratio is ${(ratio * 100).toFixed(1)}%, within the configured range.`

                    };

                }

                return {

                    passed: false,

                    reason:
                        `Debt-to-income ratio is ${(ratio * 100).toFixed(1)}%.`

                };

            }

        }


        /* AFFORDABILITY */

        if (field === "affordability") {

            const disposable =
                Number(value) || 0;


            if (condition === "good") {

                if (disposable > 0) {

                    return {

                        passed: true,

                        reason:
                            `Borrower has P${disposable.toLocaleString()} disposable income after expenses and existing debt.`

                    };

                }

                return {

                    passed: false,

                    reason:
                        "Borrower has insufficient disposable income."

                };

            }

        }


        /*
         * GENERIC RULE
         *
         * This lets future lender-created rules work
         * with simple equality conditions.
         */

        if (
            String(value).toLowerCase() ===
            String(condition).toLowerCase()
        ) {

            return {

                passed: true,

                reason:
                    `${field} meets the configured rule.`

            };

        }


        return {

            passed: false,

            reason:
                `${field} does not meet the configured condition.`

        };

    }


    /* =====================================================
       SHOW VERIFICATION
       ===================================================== */

    function showVerification(result) {

        if (result.verified) {

            verificationStatus.className =
                "verification-success";


            verificationStatus.innerHTML = `

                <div class="verification-title">
                    <i class="fa-solid fa-circle-check"></i>
                    Data Verified
                </div>

                <div class="verification-text">
                    Borrower information successfully matched
                    the stored verification record.
                </div>

                <div class="verification-text">
                    Identity, name, employment, income and debt
                    information passed the verification check.
                </div>

            `;

        } else {

            verificationStatus.className =
                "verification-failed";


            verificationStatus.innerHTML = `

                <div class="verification-title">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Verification Failed
                </div>

                <div class="verification-text">
                    ${result.reason}
                </div>

                <div class="review-warning">
                    <i class="fa-solid fa-user-check"></i>
                    Human review required before relying on this assessment.
                </div>

            `;

        }

    }


    /* =====================================================
       SHOW RISK RESULT
       ===================================================== */

    function showRiskResult(
        score,
        level,
        reasons
    ) {

        riskResult.classList.remove("hidden");


        riskScore.textContent =
            score;


        riskLevel.textContent =
            level;


        scoreProgress.style.width =
            `${score}%`;


        // Risk colours
        riskLevel.classList.remove(
            "level-low",
            "level-medium",
            "level-high"
        );

        if (level === "LOW RISK") {

            riskLevel.classList.add("level-low");

        } else if (level === "MEDIUM RISK") {

            riskLevel.classList.add("level-medium");

        } else {

            riskLevel.classList.add("level-high");

        }


        reasoningList.innerHTML = "";


        reasons.forEach(reason => {

            const li =
                document.createElement("li");

            li.textContent =
                reason;

            reasoningList.appendChild(li);

        });


        riskResult.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    /* =====================================================
       DECISION LOGIC

       Turns a risk assessment into an actual lending
       decision so the dashboard and loan applications
       pages have real APPROVED / DECLINED / HUMAN REVIEW
       data to display, instead of everything sitting as
       "PENDING" forever.
       ===================================================== */

    function decideOutcome(assessment, verification) {

        if (!verification.verified) {

            return "HUMAN REVIEW";

        }

        if (assessment.score >= 75) {

            return "APPROVED";

        }

        if (assessment.score < 50) {

            return "DECLINED";

        }

        return "HUMAN REVIEW";

    }


    /* =====================================================
       SAVE APPLICATION
       ===================================================== */

    function saveAssessment(
        borrower,
        assessment,
        verification
    ) {

        const decision =
            decideOutcome(assessment, verification);

        const application = {

            id:
                borrower.id,

            createdAt:
                new Date().toISOString(),

            fullName:
                borrower.fullName,

            idNumber:
                borrower.idNumber,

            employmentStatus:
                borrower.employmentStatus,

            monthlyIncome:
                borrower.monthlyIncome,

            monthlyDebt:
                borrower.monthlyDebt,

            loanAmount:
                borrower.loanAmount,

            loanTerm:
                borrower.loanTerm,

            previousLoans:
                borrower.previousLoans,

            latePayments:
                borrower.latePayments,

            previousDefaults:
                borrower.previousDefaults,

            repaymentBehaviour:
                borrower.repaymentBehaviour,

            debtRatio:
                borrower.debtRatio,

            affordability:
                borrower.affordability,

            riskScore:
                assessment.score,

            riskLevel:
                assessment.level,

            reasoning:
                assessment.reasons,

            verificationStatus:
                verification.verified
                    ? "VERIFIED"
                    : "REQUIRES REVIEW",

            decision,

            humanReview:
                decision === "HUMAN REVIEW"

        };


        RiskIQStorage.saveApplication(
            application
        );

    }


    /* =====================================================
       HUMAN REVIEW
       ===================================================== */

    reviewButton.addEventListener(
        "click",
        () => {

            alert(
                "Human Review Required\n\n" +
                "This borrower has been flagged for manual review."
            );

        }
    );


    /* =====================================================
       STEP UI
       ===================================================== */

    function updateStep(number) {

        const steps =
            document.querySelectorAll(".step");


        steps.forEach(
            (step, index) => {

                if (index < number) {

                    step.classList.add("active");

                }

            }
        );

    }

});


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

    document
        .querySelector(".sidebar")
        .classList.toggle("collapsed");


    document
        .querySelector(".main")
        .classList.toggle("collapsed");

}
