document.addEventListener('DOMContentLoaded', () => {
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');
    const body = document.body;
    const html = document.documentElement;
  
    if (burgerMenu && nav) {
      burgerMenu.addEventListener('click', () => {
        // Toggle active classes
        nav.classList.toggle('active');
        burgerMenu.classList.toggle('active');
        
        // Prevent body scroll when nav is active
        if (nav.classList.contains('active')) {
        console.log("fit");
  
          body.classList.add('no-scroll');
          html.classList.add('no-scroll');
        } else {
        console.log("zero");
  
          body.classList.remove('no-scroll');
          html.classList.remove('no-scroll');
        }
  
        const isExpanded = nav.classList.contains('active');
        burgerMenu.setAttribute('aria-expanded', isExpanded);
      });
    }
      // Hide spinner after full page load
      window.addEventListener('load', function () {
        var spinnerEl = document.getElementById('spinner');
        if (spinnerEl) {
          setTimeout(function () {
            spinnerEl.classList.remove('show');
          }, 1);
        }
      });
  });