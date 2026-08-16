/* =========================================
   RISK IQ - RISK RULES
========================================= */


let editingRuleId = null;


/* =========================================
   DEFAULT RULES
========================================= */

const defaultRules = [

    {
        id: 1,
        name: "Good Repayment Behaviour",
        field: "repaymentBehaviour",
        condition: "good",
        points: 25
    },

    {
        id: 2,
        name: "Stable Income",
        field: "incomeStability",
        condition: "stable",
        points: 20
    },

    {
        id: 3,
        name: "No Previous Defaults",
        field: "previousDefaults",
        condition: "zero",
        points: 25
    },

    {
        id: 4,
        name: "Low Debt Ratio",
        field: "debtRatio",
        condition: "low",
        points: 15
    },

    {
        id: 5,
        name: "Good Affordability",
        field: "affordability",
        condition: "good",
        points: 15
    }

];


/* =========================================
   LOAD PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        let rules =
            RiskIQStorage.getRules();


        /*
         * Add the five rules automatically
         * the first time the page is opened.
         */

        if (rules.length === 0) {

            rules = defaultRules;

            RiskIQStorage.saveRules(
                rules
            );

        }


        displayRules();

    }
);


/* =========================================
   DISPLAY RULES
========================================= */

function displayRules() {

    const container =
        document.getElementById(
            "rulesContainer"
        );


    const rules =
        RiskIQStorage.getRules();


    container.innerHTML = "";


    document.getElementById(
        "ruleCount"
    ).textContent =
        rules.length;


    const total =
        rules.reduce(
            function (sum, rule) {

                return sum +
                    Number(rule.points || 0);

            },
            0
        );


    document.getElementById(
        "totalPoints"
    ).textContent =
        total;


    if (rules.length === 0) {

        container.innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-sliders"></i>

                <h3>No risk rules</h3>

                <p>
                    Add a rule to configure the Risk IQ engine.
                </p>

            </div>

        `;

        return;

    }


    rules.forEach(
        function (rule) {

            const card =
                document.createElement("div");


            card.className =
                "rule-card";


            card.innerHTML = `

                <div class="rule-left">

                    <div class="rule-icon">

                        <i class="fa-solid fa-shield-halved"></i>

                    </div>


                    <div class="rule-info">

                        <h3>
                            ${escapeHtml(rule.name)}
                        </h3>

                        <p>
                            ${formatField(rule.field)}
                            • Condition:
                            ${escapeHtml(rule.condition)}
                        </p>

                        <span class="points">
                            +${rule.points} risk points
                        </span>

                    </div>

                </div>


                <div class="rule-actions">

                    <button
                        class="edit-btn"
                        title="Edit"
                        onclick="editRule(${rule.id})"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="delete-btn"
                        title="Delete"
                        onclick="deleteRule(${rule.id})"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================
   ADD RULE
========================================= */

function openAddRule() {

    editingRuleId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Risk Rule";


    document.getElementById(
        "ruleName"
    ).value = "";


    document.getElementById(
        "ruleCondition"
    ).value = "";


    document.getElementById(
        "rulePoints"
    ).value = "";


    document.getElementById(
        "ruleModal"
    ).classList.add("show");

}


/* =========================================
   EDIT RULE
========================================= */

function editRule(id) {

    const rules =
        RiskIQStorage.getRules();


    const rule =
        rules.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!rule) return;


    editingRuleId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Risk Rule";


    document.getElementById(
        "ruleName"
    ).value =
        rule.name;


    document.getElementById(
        "ruleField"
    ).value =
        rule.field;


    document.getElementById(
        "ruleCondition"
    ).value =
        rule.condition;


    document.getElementById(
        "rulePoints"
    ).value =
        rule.points;


    document.getElementById(
        "ruleModal"
    ).classList.add("show");

}


/* =========================================
   SAVE RULE
========================================= */

function saveRule() {

    const name =
        document.getElementById(
            "ruleName"
        ).value.trim();


    const field =
        document.getElementById(
            "ruleField"
        ).value;


    const condition =
        document.getElementById(
            "ruleCondition"
        ).value.trim();


    const points =
        Number(
            document.getElementById(
                "rulePoints"
            ).value
        );


    if (
        !name ||
        !condition ||
        points <= 0
    ) {

        alert(
            "Please complete all fields."
        );

        return;

    }


    const rules =
        RiskIQStorage.getRules();


    /* EDIT */

    if (editingRuleId !== null) {

        const index =
            rules.findIndex(
                function (rule) {

                    return rule.id ===
                        editingRuleId;

                }
            );


        if (index !== -1) {

            rules[index] = {

                id:
                    editingRuleId,

                name,

                field,

                condition,

                points

            };

        }

    }


    /* ADD */

    else {

        rules.push({

            id:
                Date.now(),

            name,

            field,

            condition,

            points

        });

    }


    RiskIQStorage.saveRules(
        rules
    );


    closeRuleModal();


    displayRules();

}


/* =========================================
   DELETE RULE
========================================= */

function deleteRule(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this risk rule?"
        );


    if (!confirmed) return;


    let rules =
        RiskIQStorage.getRules();


    rules =
        rules.filter(
            function (rule) {

                return rule.id !== id;

            }
        );


    RiskIQStorage.saveRules(
        rules
    );


    displayRules();

}


/* =========================================
   CLOSE MODAL
========================================= */

function closeRuleModal() {

    document.getElementById(
        "ruleModal"
    ).classList.remove("show");

}


/* =========================================
   FORMAT FIELD
========================================= */

function formatField(field) {

    const names = {

        repaymentBehaviour:
            "Repayment Behaviour",

        incomeStability:
            "Income Stability",

        previousDefaults:
            "Previous Defaults",

        debtRatio:
            "Debt Ratio",

        affordability:
            "Affordability"

    };


    return names[field] || field;

}


/* =========================================
   SAFE HTML
========================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}
