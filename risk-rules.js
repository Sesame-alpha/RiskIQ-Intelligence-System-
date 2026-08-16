const rulesContainer = document.getElementById("rulesContainer");
const ruleFormPanel = document.getElementById("ruleFormPanel");
const ruleForm = document.getElementById("ruleForm");


// ===============================
// LOAD RULES
// ===============================

function loadRules() {

    const rules = RiskIQStorage.getRules();

    rulesContainer.innerHTML = "";

    document.getElementById("ruleCount").textContent =
        rules.length;

    const totalPoints = rules.reduce(
        (total, rule) => total + Number(rule.points),
        0
    );

    document.getElementById("totalPoints").textContent =
        totalPoints;


    if (rules.length === 0) {

        rulesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-sliders"></i>
                <h3>No risk rules</h3>
                <p>Create your first risk rule.</p>
            </div>
        `;

        return;
    }


    rules.forEach(rule => {

        const card = document.createElement("div");

        card.className = "rule-card";

        card.innerHTML = `

            <div class="rule-icon">
                <i class="fa-solid fa-shield-halved"></i>
            </div>

            <div class="rule-info">

                <div class="rule-title">

                    <h3>${escapeHTML(rule.name)}</h3>

                    <span class="rule-points">
                        +${rule.points} points
                    </span>

                </div>

                <p>
                    ${escapeHTML(rule.description || "Risk assessment rule")}
                </p>

                <div class="rule-meta">

                    <span>
                        <strong>Field:</strong>
                        ${escapeHTML(rule.field)}
                    </span>

                    <span>
                        <strong>Condition:</strong>
                        ${escapeHTML(rule.condition)}
                    </span>

                </div>

            </div>


            <button
                class="delete-button"
                onclick="deleteRule(${rule.id})"
            >

                <i class="fa-solid fa-trash"></i>

            </button>

        `;

        rulesContainer.appendChild(card);

    });

}


// ===============================
// OPEN FORM
// ===============================

function openRuleForm() {

    ruleFormPanel.classList.add("show");

}


// ===============================
// CLOSE FORM
// ===============================

function closeRuleForm() {

    ruleFormPanel.classList.remove("show");

    ruleForm.reset();

}


// ===============================
// ADD RULE
// ===============================

ruleForm.addEventListener("submit", function(event) {

    event.preventDefault();


    const rules = RiskIQStorage.getRules();


    const newRule = {

        id: Date.now(),

        name: document.getElementById("ruleName").value,

        field: document.getElementById("ruleField").value,

        condition: document.getElementById("ruleCondition").value,

        points: Number(
            document.getElementById("rulePoints").value
        ),

        description:
            document.getElementById("ruleDescription").value

    };


    rules.push(newRule);

    RiskIQStorage.saveRules(rules);


    closeRuleForm();

    loadRules();

});


// ===============================
// DELETE RULE
// ===============================

function deleteRule(id) {

    const confirmed =
        confirm("Delete this risk rule?");

    if (!confirmed) return;


    let rules = RiskIQStorage.getRules();

    rules = rules.filter(
        rule => rule.id !== id
    );


    RiskIQStorage.saveRules(rules);

    loadRules();

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


// ===============================
// BASIC SECURITY
// ===============================

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ===============================
// START
// ===============================

RiskIQStorage.protectPage();

loadRules();
