/* =========================================================
   SPENDWISE — LANDING PAGE JS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.getElementById("navbar");
    const menuButton = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    /* Navbar shadow on scroll */
    const updateNavbar = () => {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    updateNavbar();

    window.addEventListener("scroll", updateNavbar);


    /* Mobile menu */
    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {
            mobileMenu.classList.toggle("active");
        });


        mobileMenu.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                mobileMenu.classList.remove("active");
            });

        });


        document.addEventListener("click", event => {

            const clickedInsideMenu =
                mobileMenu.contains(event.target);

            const clickedButton =
                menuButton.contains(event.target);

            if (!clickedInsideMenu && !clickedButton) {
                mobileMenu.classList.remove("active");
            }

        });
    }


    /* Smooth anchor navigation */
    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId =
                link.getAttribute("href");

            const target =
                document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });

});
