document.addEventListener('DOMContentLoaded', () => {

  // Carousel images array with descriptions
  const carouselItems = [
    {
      image: 'img/cosmo.jpg',
      title: 'Crossing Realms: A Journey Between Worlds',
      subtitle: 'Symbolic Painting',
      description: 'The painting depicts a man emerging from a cosmic portal, transitioning from a dark, starry sky into a bright, golden field of flowers. His body appears to stretch between two contrasting worlds—one of vast space, the other of earthly beauty—symbolizing a journey between the unknown and the familiar. The artwork highlights the tension and connection between the cosmos and human experience.'
    },
    {
      image: 'img/bez1.jpg',
      title: 'Burden of the Mind: The Cracking Point',
      subtitle: 'Conceptual Art',
      description: 'In a realm where thoughts manifest as tangible matter, a man burdened by the weight of his own mind finally shatters. The egg, a symbol of potential and creation, cracks open, not birthing life, but drowning him in the very ideas he failed to control. As the golden yolk engulfs him, he kneels—caught between transformation and defeat—his identity dissolving into the vast unknown. Is this the death of the self or the messy birth of something new? Only time will tell.'
    },
    {
      image: 'img/bez2.jpg',
      title: 'Luminous Legacy: The Cycle of Light and Wisdom',
      subtitle: 'Ancestral Tribute',
      description: 'The hands, emerging from different directions and casting golden dust, symbolize the diverse influences and blessings that nourish the young girl in the center. This golden dust represents wisdom, knowledge, and love being passed down through generations, embodying the essence of ancestral guidance and community support. The girl\'s candle represents hope and potential, a light passed down through generations. And the vibrant background of swirling reds and greens reflects the struggles and growth inherent in life\'s journey. Together, these elements weave a tale of continuity, community, and the enduring power of legacy and guidance.'
    },
    {
      image: 'img/bez3.jpg',
      title: 'Eclipse of the Soul',
      subtitle: 'Transcendental Art',
      description: 'Moment of transcendence where the individual spirit merges with the cosmic forces, symbolizing a profound connection between the physical and ethereal realms. The arching figure, bathed in radiant hues, reflects the soul\'s journey through enlightenment and the dissolution of boundaries between self and universe. The journey of self-discovery and the transcendental nature of human existence. It reflects on how individuals can transform through their interactions with the world, blending their essence with the broader tapestry of life.'
    },
    {
      image: 'img/bez4.jpg',
      title: 'Rebirth of the Cosmic Dreamer',
      subtitle: 'Visionary Art',
      description: 'A woman emerging from a cracked shell, symbolizing rebirth and new beginnings. She reaches towards a glowing orb in the sky, representing her aspirations and dreams. The vibrant, star-filled background signifies the boundless possibilities and the universe\'s infinite potential. The golden thread she holds connects her to the orb, illustrating the power of ambition and hope that guides her journey. This artwork speaks to the transformative power of breaking free from one\'s constraints and reaching for the stars, embracing the beauty and wonder of the unknown.'
    }
  ];

  // Function to generate carousel HTML
  function generateCarousel() {
    const carouselContainer = document.getElementById('carouselExampleCaptions');
    if (!carouselContainer) return;

    // Generate indicators
    const indicatorsContainer = carouselContainer.querySelector('.carousel-indicators');
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
      carouselItems.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.setAttribute('data-bs-target', '#carouselExampleCaptions');
        button.setAttribute('data-bs-slide-to', index.toString());
        button.setAttribute('aria-label', `Slide ${index + 1}`);
        if (index === 0) {
          button.classList.add('active');
          button.setAttribute('aria-current', 'true');
        }
        indicatorsContainer.appendChild(button);
      });
    }

    // Generate carousel items
    const carouselInner = carouselContainer.querySelector('.carousel-inner');
    if (carouselInner) {
      carouselInner.innerHTML = '';
      carouselItems.forEach((item, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item';
        if (index === 0) {
          carouselItem.classList.add('active');
        }
        carouselItem.innerHTML = `
          <img src="${item.image}" class="d-block w-100" alt="${item.title}">
          <div class="carousel-caption d-md-block text-center">
            <h1 class="text-white font_60">${item.title}</h1>
            <h4 class="text-white mt-3">${item.subtitle}</h4>
            <p class="text-white mt-4 text-center">${item.description}</p>
          </div>
        `;
        carouselInner.appendChild(carouselItem);
      });
    }
  }

  // Generate carousel on page load
  generateCarousel();

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