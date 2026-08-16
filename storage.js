const RiskIQStorage = {

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

    protectPage() {
        // Leave empty if you are not using login protection.
    },

    logout() {
        localStorage.removeItem("riskIQLoggedIn");
        window.location.href = "login.html";
    }
};
