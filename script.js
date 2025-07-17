document.querySelectorAll('.gallery-item').forEach(item => {
  const desc = item.querySelector('.image-description');

  // Show on hover
  item.addEventListener('mouseenter', () => {
    desc.style.opacity = '1';
  });

  item.addEventListener('mouseleave', () => {
    desc.style.opacity = '0';
  });

  item.addEventListener('click', () => {
    desc.classList.toggle('active');
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const title = document.querySelector(".title-section");
  const content = document.querySelector(".content-wrapper");
  // Show title first
  setTimeout(() => {
    title.classList.add("show");
  }, 300); // delay in ms
  // Show gallery/content second
  setTimeout(() => {
    content.classList.add("show");
  }, 600);
});

window.addEventListener('scroll', () => {
  const aboutImage = document.querySelector('.about-image .background-image');
  const scrollPosition = window.scrollY;

  aboutImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
});

document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.querySelector('.about-section');
  const aboutText = document.querySelector('.about-text');
  const resumeBtn = document.querySelector('.resume-button');
  const aboutImage = document.querySelector('.about-image');
  const imageElements = document.querySelectorAll('.about-image img, .about-image .rating-box');

  const animateOnScroll = () => {
    const sectionTop = aboutSection.getBoundingClientRect().top;
    const screenBottom = window.innerHeight;

    if (sectionTop < screenBottom - 100) {
      aboutText.classList.add('animate-slide-left');
      resumeBtn.classList.add('animate-fade-up');
      aboutImage.classList.add('animate-slide-right');

      // Stagger image elements inside about-image
      imageElements.forEach((el, index) => {
        setTimeout(() => el.classList.add('animate-scale'), index * 150);
      });

      // Unobserve after animation triggers
      observer.unobserve(aboutSection);
    }
  };

  const observer = new IntersectionObserver(animateOnScroll, {
    threshold: 0.2,
  });

  observer.observe(aboutSection);
});

document.addEventListener("DOMContentLoaded", () => {
  const archWorksSection = document.querySelector(".arch-works");
  const bottomItem = document.querySelector(".bottom-animation");
  const leftItem = document.querySelector(".left-animation");
  const rightItem = document.querySelector(".right-animation");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Animate bottom item
        setTimeout(() => {
          bottomItem.style.opacity = "1";
          bottomItem.style.transform = "translateY(0)";
        }, 200);

        // Animate left item
        setTimeout(() => {
          leftItem.style.opacity = "1";
          leftItem.style.transform = "translateX(0)";
        }, 400);

        // Animate right item
        setTimeout(() => {
          rightItem.style.opacity = "1";
          rightItem.style.transform = "translateX(0)";
        }, 600);

        // Stop observing once animations are triggered
        observer.unobserve(entry.target);
      }
    });
  });

  // Observe the .arch-works section
  observer.observe(archWorksSection);
});

document.addEventListener('scroll', function() {
  const animatedElements = document.querySelectorAll('.left-animation, .bottom-animation, .right-animation');
  const windowHeight = window.innerHeight;

  animatedElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;
    if (elementTop < windowHeight - 100) { // Adjust threshold as needed
      element.style.opacity = '1';
      element.style.transform = 'translate(0, 0)';
    }
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
      
      if (socialLinks) {
        if (nav.classList.contains('active')) {
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
        body.classList.add('no-scroll');
        html.classList.add('no-scroll');
      } else {
        body.classList.remove('no-scroll');
        html.classList.remove('no-scroll');
      }

      const isExpanded = nav.classList.contains('active');
      burgerMenu.setAttribute('aria-expanded', isExpanded);
    });
  }
});