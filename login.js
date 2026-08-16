document.addEventListener("DOMContentLoaded", function () {

    const loginForm =
        document.getElementById("loginForm");


    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                document.getElementById("username")
                    .value
                    .trim();

            const password =
                document.getElementById("password")
                    .value
                    .trim();


            // DEMO LOGIN

            if (
                username === "codecatalysts" &&
                password === "1111"
            ) {

                RiskIQStorage.login({
                    name: "Admin",
                    role: "Risk Manager",
                    username: username
                });


                window.location.href =
                    "index.html";

            } else {

                alert(
                    "Invalid username or password."
                );

            }

        }
    );

});
