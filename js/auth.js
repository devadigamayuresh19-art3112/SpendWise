/* =========================================================
   SPENDWISE — AUTHENTICATION
   Demo browser-based authentication
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");


    /* =====================================================
       HELPERS
       ===================================================== */

    function getUsers() {
        return JSON.parse(
            localStorage.getItem("spendwiseUsers")
        ) || [];
    }


    function saveUsers(users) {
        localStorage.setItem(
            "spendwiseUsers",
            JSON.stringify(users)
        );
    }


    function setCurrentUser(user) {

        localStorage.setItem(
            "spendwiseCurrentUser",
            JSON.stringify({
                name: user.name,
                email: user.email
            })
        );
    }


    function showError(element, message) {

        if (!element) return;

        element.textContent = message;
        element.classList.add("show");

    }


    function clearError(element) {

        if (!element) return;

        element.textContent = "";
        element.classList.remove("show");

    }


    /* =====================================================
       PASSWORD TOGGLE
       ===================================================== */

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const targetId =
                button.dataset.target;

            const input =
                document.getElementById(targetId);

            if (!input) return;

            if (input.type === "password") {

                input.type = "text";
                button.textContent = "Hide";

            } else {

                input.type = "password";
                button.textContent = "Show";

            }

        });

    });


    /* =====================================================
       SIGNUP
       ===================================================== */

    if (signupForm) {

        signupForm.addEventListener("submit", event => {

            event.preventDefault();


            const name =
                document.getElementById("signupName")
                    .value
                    .trim();

            const email =
                document.getElementById("signupEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("signupPassword")
                    .value;

            const confirmPassword =
                document.getElementById("signupConfirmPassword")
                    .value;


            const error =
                document.getElementById("signupError");

            const success =
                document.getElementById("signupSuccess");


            clearError(error);

            if (success) {
                success.classList.remove("show");
            }


            /* Validation */

            if (name.length < 2) {

                showError(
                    error,
                    "Please enter your full name."
                );

                return;
            }


            if (password.length < 6) {

                showError(
                    error,
                    "Password must contain at least 6 characters."
                );

                return;
            }


            if (password !== confirmPassword) {

                showError(
                    error,
                    "Passwords do not match."
                );

                return;
            }


            const users = getUsers();


            const existingUser =
                users.find(user => user.email === email);


            if (existingUser) {

                showError(
                    error,
                    "An account with this email already exists."
                );

                return;
            }


            /* Create user */

            const newUser = {
                id: Date.now(),
                name,
                email,
                password
            };


            users.push(newUser);

            saveUsers(users);

            setCurrentUser(newUser);


            /* Success */

            if (success) {

                success.textContent =
                    "Account created! Opening your dashboard...";

                success.classList.add("show");

            }


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);

        });

    }


    /* =====================================================
       LOGIN
       ===================================================== */

    if (loginForm) {

        loginForm.addEventListener("submit", event => {

            event.preventDefault();


            const email =
                document.getElementById("loginEmail")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document.getElementById("loginPassword")
                    .value;


            const error =
                document.getElementById("loginError");


            clearError(error);


            const users = getUsers();


            const user =
                users.find(
                    item =>
                        item.email === email &&
                        item.password === password
                );


            if (!user) {

                showError(
                    error,
                    "Invalid email or password. Please try again."
                );

                return;
            }


            setCurrentUser(user);


            window.location.href =
                "dashboard.html";

        });

    }

});
