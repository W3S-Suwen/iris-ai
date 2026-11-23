const nav = document.getElementById('nav');
const links = [...document.querySelectorAll('.nav-links a')];
const menu = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

const updateNav = () => nav.classList.toggle('scrolled', scrollY > 16);

updateNav();
addEventListener('scroll', updateNav, { passive: true });

menu.onclick = () => {
  const open = navLinks.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
};

links.forEach((link) => {
  link.onclick = () => navLinks.classList.remove('open');
});

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      links.forEach((link) => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`);
      });
    }
  }),
  { rootMargin: '-35% 0px -55%' },
);

sections.forEach((section) => sectionObserver.observe(section));

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.1 },
);

reveals.forEach((element) => revealObserver.observe(element));

const featureConsole = document.querySelector('[data-feature-console]');
const featureCards = [...document.querySelectorAll('[data-feature-card]')];

const activateFeature = (card) => {
  if (!featureConsole || !card) return;

  featureCards.forEach((item) => item.classList.toggle('is-active', item === card));
  featureConsole.querySelector('[data-feature-title]').textContent = card.dataset.title;
  featureConsole.querySelector('[data-feature-summary]').textContent = card.dataset.summary;
  featureConsole.querySelector('[data-feature-progress]').textContent = card.dataset.progress;
  featureConsole.querySelector('[data-feature-state]').textContent = card.dataset.state;
};

featureCards.forEach((card) => {
  card.addEventListener('mouseenter', () => activateFeature(card));
  card.addEventListener('focus', () => activateFeature(card));
  card.addEventListener('click', () => activateFeature(card));
});

const workflow = document.querySelector('[data-workflow]');
const workflowCards = [...document.querySelectorAll('[data-workflow-step]')];
const workflowDots = [...document.querySelectorAll('.workflow-dots i')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let workflowFrame;

const updateWorkflow = () => {
  workflowFrame = null;

  if (!workflow) return;

  const bounds = workflow.getBoundingClientRect();
  const workflowIsPinned = !reducedMotion.matches
    && bounds.top <= 0
    && bounds.bottom > innerHeight;

  nav.classList.toggle('workflow-hidden', workflowIsPinned);

  if (reducedMotion.matches) return;

  const scrollRange = Math.max(workflow.offsetHeight - innerHeight, 1);
  const progress = Math.min(Math.max(-bounds.top / scrollRange, 0), 1);
  const cardPosition = progress * (workflowCards.length - 1);
  const activeIndex = Math.round(cardPosition);
  const cardGap = Math.min(innerWidth * 0.34, 500);

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
    card.style.opacity = opacity;
    card.style.filter = `blur(${blur}px)`;
    card.style.zIndex = Math.round(100 - absoluteDistance * 10);
    card.classList.toggle('is-active', index === activeIndex);
    card.setAttribute('aria-hidden', index === activeIndex ? 'false' : 'true');
  });

  workflowDots.forEach((dot, index) => {
    dot.classList.toggle('is-active', index === activeIndex);
  });
};

const requestWorkflowUpdate = () => {
  if (!workflowFrame) workflowFrame = requestAnimationFrame(updateWorkflow);
};

updateWorkflow();
addEventListener('scroll', requestWorkflowUpdate, { passive: true });
addEventListener('resize', requestWorkflowUpdate);

const form = document.getElementById('inquiryForm');
const message = document.getElementById('formMessage');

form.onsubmit = (event) => {
  event.preventDefault();
  let valid = true;

  form.querySelectorAll('[required]').forEach((input) => {
    const invalid = !input.value.trim()
      || (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value));

    input.closest('.field').classList.toggle('invalid', invalid);
    valid = valid && !invalid;
  });

  message.className = `form-message ${valid ? 'success' : 'fail'}`;
  message.textContent = valid
    ? 'Thanks — your inquiry is ready. Connect this form to your preferred service to enable delivery.'
    : 'Please review the highlighted fields and try again.';
};

form.querySelectorAll('input, textarea').forEach((input) => {
  input.oninput = () => input.closest('.field').classList.remove('invalid');
});
