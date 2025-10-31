document.addEventListener('DOMContentLoaded', () => {

  // Hide spinner after full page load
  window.addEventListener('load', function () {
    var spinnerEl = document.getElementById('spinner');
    if (spinnerEl) {
      setTimeout(function () {
        spinnerEl.classList.remove('show');
      }, 1);
    }
  });
  
  // Splash Nav Toggle and A11y
  const splashNav = document.querySelector('#nav');
  const splashMenu = document.querySelector('#menu');
  const splashToggle = document.querySelector('.nav__toggle');
  let splashOpen = false;

  if (splashNav && splashMenu && splashToggle) {
    splashToggle.addEventListener('click', (e) => {
      e.preventDefault();
      // Open
      if (!splashOpen) {
        splashOpen = true;
        splashToggle.setAttribute('aria-expanded', 'true');
        splashNav.classList.add('nav--open');
        // Reveal the list after splash expands (~500ms)
        setTimeout(() => {
          splashMenu.hidden = false;
        }, 500);
      } else {
        // Close
        splashOpen = false;
        splashToggle.setAttribute('aria-expanded', 'false');
        splashMenu.hidden = true;
        splashNav.classList.remove('nav--open');
      }
    });

    // Trap Tab inside menu when open
    splashNav.addEventListener('keydown', (e) => {
      if (!splashOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      const menuLinks = splashMenu.querySelectorAll('.nav__link');
      if (!menuLinks.length) return;
      if (e.key === 'Tab' || e.keyCode === 9) {
        if (e.shiftKey) {
          if (document.activeElement === menuLinks[0]) {
            splashToggle.focus();
            e.preventDefault();
          }
        } else if (document.activeElement === splashToggle) {
          menuLinks[0].focus();
          e.preventDefault();
        }
      }
    });
  }
  });