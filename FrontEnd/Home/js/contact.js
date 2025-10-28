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
    const burgerMenu = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav');
    const body = document.body;
    const html = document.documentElement;
    const socialLinks = document.querySelector('.social-links');
  
    if (burgerMenu && nav) {
      burgerMenu.addEventListener('click', () => {
        // Toggle active classes
        nav.classList.toggle('active');
        burgerMenu.classList.toggle('active');
        console.log("first");
        if (socialLinks) {
          if (nav.classList.contains('active')) {
            console.log("ft");
            setTimeout(() => {
              if (nav.classList.contains('active')) {
                socialLinks.classList.add('active');
              }
            }, 350);
          } else {
            socialLinks.classList.remove('active');
          }
        }
        
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