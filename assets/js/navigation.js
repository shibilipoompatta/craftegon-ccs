document.addEventListener("DOMContentLoaded", function () {
  // Inject Navbar
  fetch('/components/navbar.html')
    .then(res => res.text())
    .then(data => {
      const navContainer = document.getElementById('global-navbar');
      if (navContainer) navContainer.innerHTML = data;
    });

  // Inject Footer
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(data => {
      const footerContainer = document.getElementById('global-footer');
      if (footerContainer) footerContainer.innerHTML = data;
    });
});
