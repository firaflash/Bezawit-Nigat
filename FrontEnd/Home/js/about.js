
 // Handle Experience/Education tabs
 document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const targetId = this.getAttribute('href');
            const targetPane = document.querySelector(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });
});

// Project descriptions data
const projectDescriptions = {
    1: {
        title: "Architectural Visualization",
        image: "img/project-1.jpg",
        description: "A detailed architectural visualization project showcasing modern residential design. This piece combines technical precision with artistic flair to create compelling visual representations of architectural concepts.",
        details: "• Medium: Digital Rendering<br>• Duration: 2 weeks<br>• Client: Private Residential<br>• Tools: AutoCAD, 3ds Max, Photoshop"
    },
    2: {
        title: "Watercolor Portrait",
        image: "img/project-2.jpg", 
        description: "An intimate watercolor portrait capturing the essence of human emotion through delicate brushwork and careful color composition. This piece demonstrates the artist's mastery of traditional painting techniques.",
        details: "• Medium: Watercolor on Paper<br>• Duration: 1 week<br>• Client: Personal Commission<br>• Size: 16x20 inches"
    },
    3: {
        title: "3D Architectural Model",
        image: "img/project-3.jpg",
        description: "A comprehensive 3D architectural model created for client presentation. This project showcases the integration of architectural knowledge with digital modeling skills to produce realistic visualizations.",
        details: "• Medium: 3D Digital Model<br>• Duration: 3 weeks<br>• Client: Commercial Development<br>• Tools: Revit, Lumion, SketchUp"
    },
    4: {
        title: "Digital Art Commission",
        image: "img/project-4.jpg",
        description: "A contemporary digital artwork commissioned for a corporate client. This piece represents the fusion of traditional artistic principles with modern digital techniques.",
        details: "• Medium: Digital Art<br>• Duration: 1.5 weeks<br>• Client: Corporate Branding<br>• Tools: Adobe Creative Suite, Procreate"
    },
    5: {
        title: "Concept Design",
        image: "img/project-5.jpg",
        description: "An innovative concept design exploring new possibilities in architectural form and function. This project demonstrates creative problem-solving and forward-thinking design approaches.",
        details: "• Medium: Mixed Media<br>• Duration: 2.5 weeks<br>• Client: Design Competition<br>• Tools: Hand Drawing, Digital Enhancement"
    },
    6: {
        title: "Artistic Illustration",
        image: "img/project-6.jpg",
        description: "A creative illustration that blends architectural elements with artistic expression. This piece showcases the unique ability to merge technical drawing skills with creative vision.",
        details: "• Medium: Mixed Media<br>• Duration: 1 week<br>• Client: Art Gallery<br>• Tools: Watercolor, Digital Enhancement"
    }
};

// Function to show project description
function showProjectDescription(projectId) {
    const modal = document.getElementById('projectModal');
    const project = projectDescriptions[projectId];
    
    if (project) {
        document.getElementById('projectTitle').textContent = project.title;
        document.getElementById('projectImage').innerHTML = `<img src="${project.image}" alt="${project.title}">`;
        document.getElementById('projectDescription').textContent = project.description;
        document.getElementById('projectDetails').innerHTML = project.details;
        modal.style.display = 'block';
    }
}

// Close modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    // Smooth back to top
    document.querySelector('.back-to-top').addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Handle Experience/Education tabs
    const tabButtons = document.querySelectorAll('[data-bs-toggle="pill"]');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab pane
            const targetId = this.getAttribute('href');
            const targetPane = document.querySelector(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
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
  });