const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const siteHeader = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const savedTheme = localStorage.getItem('portfolio-theme');
const systemTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

function setTheme(theme) {
  const dark = theme === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
}

setTheme(savedTheme || systemTheme);

themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  localStorage.setItem('portfolio-theme', theme);
});

document.querySelector('#year').textContent = new Date().getFullYear();

navToggle.addEventListener('click', () => {
  const isOpen = siteHeader.classList.toggle('menu-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

document.querySelectorAll('#site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  });
});

const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(contactForm));

  submitButton.disabled = true;
  formStatus.textContent = 'Sending…';
  formStatus.className = '';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');

    contactForm.reset();
    formStatus.textContent = 'Message sent. I’ll get back to you soon.';
    formStatus.className = 'success';
  } catch (error) {
    formStatus.textContent = error.message || 'Something went wrong. Please email me directly.';
    formStatus.className = 'error';
  } finally {
    submitButton.disabled = false;
  }
});
