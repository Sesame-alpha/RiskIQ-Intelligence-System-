const RiskIQStorage = {

    // ================= APPLICATIONS =================

    getApplications() {
        return JSON.parse(
            localStorage.getItem("riskIQApplications") || "[]"
        );
    },

    saveApplication(application) {

        const applications = this.getApplications();

        applications.push(application);

        localStorage.setItem(
            "riskIQApplications",
            JSON.stringify(applications)
        );
    },


    // ================= RISK RULES =================

    getRules() {

        return JSON.parse(
            localStorage.getItem("riskIQRiskRules") || "[]"
        );

    },

    saveRules(rules) {

        localStorage.setItem(
            "riskIQRiskRules",
            JSON.stringify(rules)
        );

    },


    // ================= LOGIN =================

    isLoggedIn() {

        return localStorage.getItem(
            "riskIQLoggedIn"
        ) === "true";

    },


    login(user) {

        localStorage.setItem(
            "riskIQLoggedIn",
            "true"
        );

        localStorage.setItem(
            "riskiq_user",
            JSON.stringify(user)
        );

    },


    logout() {

        localStorage.removeItem(
            "riskIQLoggedIn"
        );

        localStorage.removeItem(
            "riskiq_user"
        );

        window.location.href =
            "login.html";

    },


    // ================= PAGE PROTECTION =================

    protectPage() {

        if (!this.isLoggedIn()) {

            window.location.href =
                "login.html";

        }

    },


    // ================= VERIFICATION DATA =================

    getVerificationData() {

        const existing =
            localStorage.getItem(
                "riskIQVerificationData"
            );

        if (existing) {

            return JSON.parse(existing);

        }


        // Demo borrower

        const demoData = [

            {
                idNumber: "123456789",
                fullName: "John Molefe",
                employmentStatus: "employed",
                monthlyIncome: 15000,
                monthlyDebt: 2000
            }

        ];


        localStorage.setItem(
            "riskIQVerificationData",
            JSON.stringify(demoData)
        );


        return demoData;

    }

};
