/* =========================================================
   RISK IQ - STORAGE ENGINE
   ========================================================= */

const RiskIQStorage = {

    /* =====================================================
       APPLICATIONS
       ===================================================== */

    getApplications() {

        return JSON.parse(
            localStorage.getItem("riskIQApplications") || "[]"
        );

    },


    saveApplication(application) {

        const applications =
            this.getApplications();

        applications.push(application);

        localStorage.setItem(
            "riskIQApplications",
            JSON.stringify(applications)
        );

    },


    /* =====================================================
       RISK RULES
       ===================================================== */

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


    /* =====================================================
       VERIFICATION DATA
       ===================================================== */

    getVerificationData() {

        const stored =
            localStorage.getItem("riskIQVerificationData");

        if (stored) {

            return JSON.parse(stored);

        }


        /*
         * DEMO VERIFICATION RECORD
         *
         * This is only for demonstrating the prototype.
         */

        const demoData = [

            {
                idNumber: "123456789",
                fullName: "John Molefe",
                employmentStatus: "employed",
                monthlyIncome: 15000,
                monthlyDebt: 2500
            },

            {
                idNumber: "987654321",
                fullName: "Thato Motsamai",
                employmentStatus: "self-employed",
                monthlyIncome: 12000,
                monthlyDebt: 1500
            },

            {
                idNumber: "456789123",
                fullName: "Naledi Kgosidintsi",
                employmentStatus: "business-owner",
                monthlyIncome: 20000,
                monthlyDebt: 3000
            }

        ];


        localStorage.setItem(
            "riskIQVerificationData",
            JSON.stringify(demoData)
        );


        return demoData;

    },


    /* =====================================================
       LOGIN
       ===================================================== */

    isLoggedIn() {

        /*
         * Demo mode.
         *
         * If no login system has been created yet,
         * allow the application to work.
         */

        return true;

    },


    /* =====================================================
       PAGE PROTECTION
       ===================================================== */

    protectPage() {

        /*
         * Login protection can be added later.
         */

        return true;

    },


    /* =====================================================
       LOGOUT
       ===================================================== */

    logout() {

        localStorage.removeItem(
            "riskIQLoggedIn"
        );

        window.location.href =
            "login.html";

    }

};
