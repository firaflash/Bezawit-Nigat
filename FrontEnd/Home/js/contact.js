        // Initialize Feather icons
        feather.replace();

        // Initialize Typed header
        if (window.Typed) {
            new Typed('#typed-hero', {
                strings: ['Buy Now', 'Get in Touch', 'Say Hello', 'Shop Help'],
                typeSpeed: 60,
                backSpeed: 35,
                backDelay: 1200,
                loop: true,
                smartBackspace: true,
                showCursor: true
            });
        }

        // Form submission handling
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('formName').value;
            const email = document.getElementById('formEmail').value;
            const message = document.getElementById('formMessage').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Simulate form submission
            alert('Thank you for your message! We\'ll get back to you soon.');
            
            // Reset form
            this.reset();
        });

        // Add smooth scrolling and hover effects
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.1)';
            });
            
            icon.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });

        
document.addEventListener('DOMContentLoaded', () => {
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