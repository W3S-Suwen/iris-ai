(() => {
  'use strict';

  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const menuToggle = document.getElementById('menuToggle');
  const links = [...document.querySelectorAll('.nav-links a')];

  const closeMenu = () => {
    if (!navLinks || !menuToggle) return;
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 16);
  };

  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  links.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Prevent jumping to top on placeholder (#) links
  document.querySelectorAll('a[href="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
    });
  });

  // Active navigation link observer
  const sections = [...document.querySelectorAll('main section[id]')];
  if ('IntersectionObserver' in window && sections.length > 0) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => {
              link.classList.toggle('active', link.hash === `#${entry.target.id}`);
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55%' },
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Scroll-reveal observer
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    reveals.forEach((element) => revealObserver.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('visible'));
  }

  // Interactive feature console
  const featureConsole = document.querySelector('[data-feature-console]');
  const featureCards = [...document.querySelectorAll('[data-feature-card]')];

  if (featureConsole && featureCards.length > 0) {
    const titleEl = featureConsole.querySelector('[data-feature-title]');
    const summaryEl = featureConsole.querySelector('[data-feature-summary]');
    const progressEl = featureConsole.querySelector('[data-feature-progress]');
    const stateEl = featureConsole.querySelector('[data-feature-state]');

    const activateFeature = (card) => {
      if (!card) return;

      featureCards.forEach((item) => item.classList.toggle('is-active', item === card));
      if (titleEl) titleEl.textContent = card.dataset.title || '';
      if (summaryEl) summaryEl.textContent = card.dataset.summary || '';
      if (progressEl) progressEl.textContent = card.dataset.progress || '';
      if (stateEl) stateEl.textContent = card.dataset.state || '';
    };

    featureCards.forEach((card) => {
      card.addEventListener('mouseenter', () => activateFeature(card));
      card.addEventListener('focus', () => activateFeature(card));
      card.addEventListener('click', () => activateFeature(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activateFeature(card);
        }
      });
    });
  }

  // Scroll-linked workflow card deck
  const workflow = document.querySelector('[data-workflow]');
  const workflowCards = [...document.querySelectorAll('[data-workflow-step]')];
  const workflowDots = [...document.querySelectorAll('.workflow-dots i')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let workflowFrame = null;

  const resetWorkflowCards = () => {
    workflowCards.forEach((card) => {
      card.style.transform = '';
      card.style.opacity = '';
      card.style.filter = '';
      card.style.zIndex = '';
      card.removeAttribute('aria-hidden');
    });
  };

  const updateWorkflow = () => {
    workflowFrame = null;

    if (!workflow || workflowCards.length === 0) return;

    const bounds = workflow.getBoundingClientRect();
    const workflowIsPinned = !reducedMotion.matches
      && bounds.top <= 0
      && bounds.bottom > window.innerHeight;

    if (nav) {
      nav.classList.toggle('workflow-hidden', workflowIsPinned);
    }

    if (reducedMotion.matches) {
      resetWorkflowCards();
      return;
    }

    const scrollRange = Math.max(workflow.offsetHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(-bounds.top / scrollRange, 0), 1);
    const cardPosition = progress * (workflowCards.length - 1);
    const activeIndex = Math.round(cardPosition);
    const cardGap = Math.min(window.innerWidth * 0.34, 500);

    workflowCards.forEach((card, index) => {
      const distance = index - cardPosition;
      const absoluteDistance = Math.abs(distance);
      const offsetX = distance * cardGap;
      const offsetY = Math.min(absoluteDistance * 13, 38);
      const scale = Math.max(0.72, 1 - absoluteDistance * 0.12);
      const rotation = Math.max(-11, Math.min(11, distance * 4.8));
      const opacity = absoluteDistance > 2.7 ? 0 : Math.max(0.16, 1 - absoluteDistance * 0.3);
      const blur = Math.max(0, absoluteDistance - 1) * 1.4;

      card.style.transform = `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), 0) rotate(${rotation}deg) scale(${scale})`;
      card.style.opacity = String(opacity);
      card.style.filter = `blur(${blur}px)`;
      card.style.zIndex = String(Math.round(100 - absoluteDistance * 10));
      card.classList.toggle('is-active', index === activeIndex);
      card.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
    });

    workflowDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === activeIndex);
    });
  };

  const requestWorkflowUpdate = () => {
    if (!workflowFrame) {
      workflowFrame = window.requestAnimationFrame(updateWorkflow);
    }
  };

  updateWorkflow();
  window.addEventListener('scroll', requestWorkflowUpdate, { passive: true });
  window.addEventListener('resize', requestWorkflowUpdate);
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', requestWorkflowUpdate);
  }

  // Inquiry form validation
  const form = document.getElementById('inquiryForm');
  const formMessage = document.getElementById('formMessage');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (form && formMessage) {
    const requiredInputs = [...form.querySelectorAll('[required]')];

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let isFormValid = true;
      let firstInvalidInput = null;

      requiredInputs.forEach((input) => {
        const value = input.value.trim();
        const isInvalid = !value || (input.type === 'email' && !emailPattern.test(value));
        const field = input.closest('.field');

        if (field) {
          field.classList.toggle('invalid', isInvalid);
        }
        input.setAttribute('aria-invalid', String(isInvalid));

        if (isInvalid) {
          isFormValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = input;
          }
        }
      });

      formMessage.className = `form-message ${isFormValid ? 'success' : 'fail'}`;
      formMessage.textContent = isFormValid
        ? 'Thanks — your inquiry is ready. Connect this form to your preferred service to enable delivery.'
        : 'Please review the highlighted fields and try again.';

      if (firstInvalidInput) {
        firstInvalidInput.focus();
      }
    });

    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', () => {
        const field = input.closest('.field');
        if (field) {
          field.classList.remove('invalid');
        }
        input.removeAttribute('aria-invalid');
      });
    });
  }
})();
