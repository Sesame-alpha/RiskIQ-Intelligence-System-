/* =========================================================
   RISK IQ - STORAGE
   ========================================================= */

const RiskIQStorage = {

    /* ================= APPLICATIONS ================= */

    getApplications() {
        return JSON.parse(
            localStorage.getItem("riskIQApplications") || "[]"
        );
    },

    saveApplication(application) {

        const applications = this.getApplications();

        applications.unshift(application);

        localStorage.setItem(
            "riskIQApplications",
            JSON.stringify(applications)
        );
    },


    /* ================= RISK RULES ================= */

    getRules() {

        let rules = JSON.parse(
            localStorage.getItem("riskIQRiskRules") || "[]"
        );

        // Create the 5 default rules if none exist
        if (rules.length === 0) {

            rules = [

                {
                    id: 1,
                    name: "Good Repayment Behaviour",
                    field: "repaymentBehaviour",
                    condition: "good",
                    points: 25,
                    status: "Active"
                },

                {
                    id: 2,
                    name: "Stable Income",
                    field: "incomeStability",
                    condition: "stable",
                    points: 20,
                    status: "Active"
                },

                {
                    id: 3,
                    name: "No Previous Defaults",
                    field: "previousDefaults",
                    condition: "zero",
                    points: 20,
                    status: "Active"
                },

                {
                    id: 4,
                    name: "Low Debt Ratio",
                    field: "debtRatio",
                    condition: "low",
                    points: 20,
                    status: "Active"
                },

                {
                    id: 5,
                    name: "Affordable Loan",
                    field: "affordability",
                    condition: "good",
                    points: 15,
                    status: "Active"
                }

            ];

            this.saveRules(rules);
        }

        return rules;
    },


    saveRules(rules) {

        localStorage.setItem(
            "riskIQRiskRules",
            JSON.stringify(rules)
        );
    },


    addRule(rule) {

        const rules = this.getRules();

        rule.id = Date.now();

        rules.push(rule);

        this.saveRules(rules);
    },


    updateRule(id, updatedRule) {

        const rules = this.getRules();

        const index =
            rules.findIndex(
                rule => Number(rule.id) === Number(id)
            );

        if (index !== -1) {

            rules[index] = {
                ...rules[index],
                ...updatedRule
            };

            this.saveRules(rules);
        }
    },


    deleteRule(id) {

        const rules = this.getRules();

        const updatedRules =
            rules.filter(
                rule => Number(rule.id) !== Number(id)
            );

        this.saveRules(updatedRules);
    },


    /* ================= VERIFICATION DATA ================= */

    getVerificationData() {

        const saved =
            localStorage.getItem("riskIQVerificationData");

        if (saved) {
            return JSON.parse(saved);
        }


        // Demo borrower
        const demoData = [

            {
                idNumber: "123456789",
                fullName: "Sesame Dithupa",
                employmentStatus: "employed",
                monthlyIncome: 10000,
                monthlyDebt: 2500
            }

        ];


        localStorage.setItem(
            "riskIQVerificationData",
            JSON.stringify(demoData)
        );

        return demoData;
    },


    /* ================= LOGIN ================= */

    isLoggedIn() {

        return (
            localStorage.getItem("riskIQLoggedIn") === "true"
        );
    },


    protectPage() {

        if (!this.isLoggedIn()) {

            window.location.href = "login.html";
        }
    },


    logout() {

        localStorage.removeItem("riskIQLoggedIn");

        window.location.href = "login.html";
    }

};
