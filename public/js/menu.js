// Portfolio projects data for arc.html
const portfolioProjects = [
    {
        image: "img/project-1.jpg",
        title: "Interior Design",
        category: "mural"
    },
    {
        image: "img/project-2.jpg",
        title: "Interior Design",
        category: "mural"
    },
    {
        image: "img/project-3.jpg",
        title: "Interior Design",
        category: "live-art"
    },
    {
        image: "img/project-4.jpg",
        title: "House Design",
        category: "conceptual"
    },
    {
        image: "img/project-5.jpg",
        title: "Arc",
        category: "wall-art"
    },
    {
        image: "img/project-6.jpg",
        title: "Architectural",
        category: "conceptual"
    },
    {
        image: "img/portfolio.png",
        title: "Building",
        category: "live-art"
    },
    {
        image: "img/about-2.jpg",
        title: "House Design",
        category: "mural"
    },
    {
        image: "img/portfolio.png",
        title: "House Design",
        category: "conceptual"
    },
    {
        image: "images/sq-6.jpg",
        title: "House Design",
        category: "wall-art"
    },
    {
        image: "images/sq-4.jpg",
        title: "House Design",
        category: "live-art"
    },
    {
        image: "images/sq-1.jpg",
        title: "House Design",
        category: "wall-art"
    }
];

// Function to render portfolio items
function renderPortfolio() {
    const portfolioContainer = document.querySelector('.grid');
    if (!portfolioContainer) return;

    // Clear existing content
    portfolioContainer.innerHTML = '';

    // Render each project
    portfolioProjects.forEach(project => {
        const projectHTML = `
          <div class="isotope-card col-sm-4 all ${project.category}">
            <a href="${project.image}" data-fancybox="gal">
              <img src="${project.image}" alt="Image" class="img-fluid">
              <div class="contents">
                <h3>${project.title}</h3>
                <div class="cat">${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</div>
              </div>
            </a>
          </div>
        `;
        portfolioContainer.innerHTML += projectHTML;
    });
}

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

  // Smooth back to top
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Show/hide button on scroll
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopBtn.style.display = 'flex';
      } else {
        backToTopBtn.style.display = 'none';
      }
    });
  }

  // Render portfolio if on arc page
  const currentPath = window.location.pathname;
  if (currentPath.includes('arc.html')) {
    // Render portfolio items, then wait a bit for Isotope to initialize
    renderPortfolio();
    
    // Reinitialize Isotope after rendering (needed because arc.js initializes before items exist)
    setTimeout(() => {
      if (typeof $ !== 'undefined' && $.fn.isotope && document.querySelector('.grid')) {
        const $grid = $(".grid").isotope({
          itemSelector: ".all",
          percentPosition: true,
          masonry: {
            columnWidth: ".all"
          }
        });

        $grid.imagesLoaded().progress(function() {
          $grid.isotope('layout');
        });

        // Re-attach filter click handlers
        $('.filters ul li').off('click').on('click', function(){
          $('.filters ul li').removeClass('active');
          $(this).addClass('active');
          
          const data = $(this).attr('data-filter');
          $grid.isotope({
            filter: data
          });
        });
      }
    }, 100);
  }
});