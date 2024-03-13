document.addEventListener('DOMContentLoaded', () => {
    // Get current page URL
    const currentPage = window.location.pathname.split('/').pop();

    // Find all navigation links
    const navLinks = document.querySelectorAll('nav ul li a');

    // Loop through nav links and add 'active-link' class to the link of the current page
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active-link');
        }
    });
});
