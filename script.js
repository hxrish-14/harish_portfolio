/* ============================================
   script.js — Updated for your Google Apps Script
   Web App URL and full portfolio behaviors.
   ============================================ */

/* small selectors */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* global timers */
window.idleHideTimer = null;
window.postSubmitHideTimer = null;

/* ========== CONFIG ========== */
// Updated Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwJW2vSYzmwwtD7--KF7-ShkGRbp6xYWjrp-VE31Mc14fwOEsIdSWjavgGO9-tCe-Sy/exec';

/* init on load */
window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');
  initObservers();
  animateSkillBars();
  initNav();
  initLangHover();
  initContactFlow();
  initBlobMotion();
  initMobileMenuToggle();
  initThemeToggle();
  initSourceDeterrents();
});

/* IntersectionObserver to reveal sections */
function initObservers(){
  const sections = $$('.section');
  if(!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.12 });
  sections.forEach(s => obs.observe(s));
}

/* animate skill bars */
function animateSkillBars(){
  $$('.progress .fill').forEach(f => {
    const w = getComputedStyle(f).getPropertyValue('--w') || '0%';
    f.style.width = '0%';
    setTimeout(()=> f.style.width = w, 420);
  });
}

/* language icon hover visuals */
function initLangHover(){
  $$('.lang-icon').forEach(icon => {
    icon.addEventListener('mouseenter', ()=> icon.classList.add('hovered'));
    icon.addEventListener('mouseleave', ()=> icon.classList.remove('hovered'));
  });
}

/* mobile nav toggle */
function initMobileMenuToggle(){
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', (e) => {
    if(e.target.tagName === 'A' && window.innerWidth <= 720){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

/* nav smooth scroll + header pulse */
function initNav(){
  $$('.nav-link, .action-btn, .see-projects').forEach(el => {
    el.addEventListener('click', (ev) => {
      const href = el.getAttribute('href');
      if(!href) return;
      if(href.startsWith('http')) return;
      ev.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      headerPulse();
      const nav = document.querySelector('.main-nav');
      if(nav && nav.classList.contains('open')) { nav.classList.remove('open'); document.querySelector('.menu-toggle').setAttribute('aria-expanded','false'); }
    });
  });
}
function headerPulse(){
  const header = $('#siteHeader');
  if(!header) return;
  header.style.transform = 'translateY(-6px)';
  setTimeout(()=> header.style.transform = '', 260);
}

/* subtle blob motion */
function initBlobMotion(){
  const b1 = document.querySelector('.blob.b1');
  const b2 = document.querySelector('.blob.b2');
  if(!b1 || !b2) return;
  let t = 0;
  function anim(){
    t += 0.006;
    b1.style.transform = `translate(${Math.sin(t*1.1)*16}px, ${Math.cos(t)*10}px) rotate(${t*12}deg)`;
    b2.style.transform = `translate(${Math.cos(t*0.9)*12}px, ${Math.sin(t*1.05)*8}px) rotate(${t*9}deg)`;
    requestAnimationFrame(anim);
  }
  anim();
}

/* ========= CONTACT FLOW: send to Apps Script Web App ========= */
function initContactFlow(){
  const contactLink = $('.contact-cta');
  const contactSection = $('#contact');
  const contactForm = $('#contactForm');
  const formResponse = $('#formResponse');

  if(!contactSection || !contactLink){
    console.warn('Contact section or CTA not found.');
  }

  if(contactLink){
    contactLink.addEventListener('click', (e) => {
      e.preventDefault();
      openContact();
    });
  }

  function openContact(){
    clearTimers();
    contactSection.classList.remove('hidden');
    contactSection.classList.add('show-form');
    if(contactForm) contactForm.classList.remove('hidden-form');
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resetIdleHideTimer();
    contactSection.addEventListener('mousemove', resetIdleHideTimer, { passive: true });
    contactSection.addEventListener('focusin', resetIdleHideTimer, { passive: true });
  }

  function hideContact(){
    contactSection.classList.add('hidden');
    contactSection.classList.remove('show-form');
    if(contactForm) contactForm.classList.add('hidden-form');
    clearTimers();
  }

  function resetIdleHideTimer(){
    if(window.idleHideTimer) clearTimeout(window.idleHideTimer);
    window.idleHideTimer = setTimeout(()=> {
      hideContact();
      window.idleHideTimer = null;
    }, 15000); // 15s idle
  }

  function clearTimers(){
    if(window.idleHideTimer) { clearTimeout(window.idleHideTimer); window.idleHideTimer = null; }
    if(window.postSubmitHideTimer) { clearTimeout(window.postSubmitHideTimer); window.postSubmitHideTimer = null; }
  }

  function showMessage(msg, isError=false){
    if(!formResponse) return;
    formResponse.textContent = msg;
    formResponse.style.color = isError ? '#ffd1d1' : '';
  }

  function setSubmitting(on){
    const btn = contactForm ? contactForm.querySelector('button[type="submit"]') : null;
    if(btn){ btn.disabled = on; btn.setAttribute('aria-busy', on ? 'true' : 'false'); btn.textContent = on ? 'Sending...' : 'Send'; }
  }

  if(contactForm){
    contactForm.addEventListener('submit', async function(ev){
      ev.preventDefault();
      const name = (document.getElementById('cname') || {}).value?.trim();
      const email = (document.getElementById('cemail') || {}).value?.trim();
      const message = (document.getElementById('cmessage') || {}).value?.trim();

      if(!name || !email || !message){
        showMessage('Please fill all fields.', true);
        return;
      }

      setSubmitting(true);
      showMessage('Sending...');

      const payload = {
        name, email, message,
        page: window.location.href,
        userAgent: navigator.userAgent
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(()=> controller.abort(), 8000);

        const res = await fetch(WEB_APP_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        let data = null;
        try { data = await res.json(); } catch(e){ data = null; }

        if(res.ok || (data && data.ok) ){
          contactForm.reset();
          showMessage("Thanks for contacting! I'll catch up to you soon!");
          if(formResponse) formResponse.classList.add('sent');

          if(window.idleHideTimer){ clearTimeout(window.idleHideTimer); window.idleHideTimer = null; }
          if(window.postSubmitHideTimer){ clearTimeout(window.postSubmitHideTimer); window.postSubmitHideTimer = null; }

          window.postSubmitHideTimer = setTimeout(()=> {
            hideContact();
          }, 10000); // hide after 10s

        } else {
          showMessage('Submission failed. Try again or email harishramesh004@gmail.com', true);
          console.warn('Submission response:', res.status, data);
        }
      } catch (err){
        console.error('Submit error:', err);
        showMessage('Submission failed (network). Try again or email harishramesh004@gmail.com', true);
      } finally {
        setSubmitting(false);
      }
    }, { passive: false });
  }
}

/* ========== Theme toggle (persist) ========== */
function initThemeToggle(){
  const toggle = $('#themeToggle');
  const track = document.querySelector('.toggle-track');
  const thumb = document.getElementById('toggleThumb');
  const icon = document.getElementById('toggleIcon');
  if(!toggle || !track || !thumb || !icon) return;

  function setMode(mode){
    if(mode === 'light'){
      document.documentElement.classList.add('light');
      track.setAttribute('data-mode','light');
      thumb.style.transform = 'translateX(30px)';
      icon.className = 'fa-solid fa-sun';
      toggle.setAttribute('aria-pressed','true');
      localStorage.setItem('harish_theme','light');
    } else {
      document.documentElement.classList.remove('light');
      track.setAttribute('data-mode','dark');
      thumb.style.transform = 'translateX(0)';
      icon.className = 'fa-solid fa-moon';
      toggle.setAttribute('aria-pressed','false');
      localStorage.setItem('harish_theme','dark');
    }
  }

  const saved = localStorage.getItem('harish_theme');
  if(saved) setMode(saved);
  else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    setMode(prefersLight ? 'light' : 'dark');
  }

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.contains('light');
    setMode(isLight ? 'dark' : 'light');
  });
}

/* source-deterrent */
function initSourceDeterrents(){
  document.addEventListener('contextmenu', (e)=> e.preventDefault());
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'F12') e.preventDefault();
    if(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if(e.ctrlKey && (e.key === 'U' || e.key === 'u')) e.preventDefault();
  });
}

/* keyboard resume shortcut: Shift + R */
window.addEventListener('keydown', (e) => {
  if(e.key === 'R' && e.shiftKey){
    const resume = document.querySelector('.resume-link');
    if(resume && resume.href) window.open(resume.href, '_blank');
  }
});

/* respect reduced motion */
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if(mq.matches) document.documentElement.style.scrollBehavior = 'auto';
