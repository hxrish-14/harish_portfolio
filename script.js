/* ===========================================================================
  script.js — Final merged version with Apps Script endpoint, keyboard shortcuts,
  contact show/hide timers, animations, and other site behaviors.

  Important:
  - Ensure your HTML contains:
    - contact form with id="contactForm", inputs: #cname, #cemail, #cmessage
    - response container: #formResponse
    - header contact trigger either .contact-cta or #contactBtn
    - resume link anchor with class .resume-link
    - theme toggle elements: #themeToggle, .toggle-track, #toggleThumb, #toggleIcon
    - section elements with class .section (for IntersectionObserver)
    - progress fill elements with style --w for widths
    - blob elements .blob.b1 and .blob.b2
    - mobile menu toggle .menu-toggle and .main-nav
  - Replace WEB_APP_URL only if you redeploy Apps Script.
  ========================================================================= */

/* ---------- Config ---------- */
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzVf9dAe9si4HICrDj3ZveMmhmWRxYL8y6dMnH1jkyEHBtd2_CXbMKEttZXlFJ_Io-o/exec";
const IDLE_HIDE_MS = 15000;      // hide after 15s inactivity
const POST_SUBMIT_HIDE_MS = 10000; // hide 10s after submit
const OUTSIDE_CLICK_HIDE_MS = 5000; // when clicked outside, hide after 5s
const SUBMIT_TIMEOUT_MS = 8000;  // fetch timeout

/* ---------- Small helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
function safe(fn){ try{ fn(); } catch(e){ console.error(e); } }

/* ---------- Global timers (accessible globally) ---------- */
window.idleHideTimer = null;
window.postSubmitHideTimer = null;
window.outsideHideTimer = null;

/* ========== Init on load ========== */
window.addEventListener('load', () => {
  document.body.classList.add('page-loaded'); // page enter animation
  initObservers();
  animateSkillBars();
  initNav();
  initLangHover();
  initBlobMotion();
  initMobileMenuToggle();
  initThemeToggle();
  initSourceDeterrents();
  initContactFlow(); // must be last because it hooks contact-related elements
});

/* ================= IntersectionObserver: reveal sections ================= */
function initObservers(){
  const sections = $$('.section');
  if(!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  sections.forEach(s => obs.observe(s));
}

/* ================= Skill bar animation ================= */
function animateSkillBars(){
  $$('.progress .fill').forEach(fill => {
    const w = getComputedStyle(fill).getPropertyValue('--w') || '0%';
    fill.style.width = '0%';
    // animate shortly after load for smoothness
    setTimeout(()=> { fill.style.width = w; }, 420);
  });
}

/* ================= Language icon hover ================= */
function initLangHover(){
  $$('.lang-icon').forEach(icon => {
    icon.addEventListener('mouseenter', ()=> icon.classList.add('hovered'));
    icon.addEventListener('mouseleave', ()=> icon.classList.remove('hovered'));
  });
}

/* ================= Blob motion ================= */
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

/* ================= Mobile nav toggle ================= */
function initMobileMenuToggle(){
  const toggle = $('.menu-toggle');
  const nav = $('.main-nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    const opened = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
  // Close on link click (mobile)
  nav.addEventListener('click', (e)=>{
    if(e.target.tagName === 'A' && window.innerWidth <= 720){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

/* ================= Navigation smooth scroll + header pulse ================= */
function initNav(){
  const navTriggers = $$('.nav-link, .action-btn, .see-projects');
  navTriggers.forEach(el => {
    el.addEventListener('click', (ev)=>{
      const href = el.getAttribute('href');
      if(!href) return;
      if(href.startsWith('http')) return; // external
      ev.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      headerPulse();
      // close mobile nav if open
      const nav = $('.main-nav');
      if(nav && nav.classList.contains('open')) nav.classList.remove('open');
    });
  });
}
function headerPulse(){
  const header = $('#siteHeader');
  if(!header) return;
  header.style.transform = 'translateY(-6px)';
  setTimeout(()=> header.style.transform = '', 260);
}

/* ================= Theme toggle (persistent) ================= */
function initThemeToggle(){
  const toggle = $('#themeToggle');
  const track = document.querySelector('.toggle-track');
  const thumb = document.getElementById('toggleThumb');
  const icon = document.getElementById('toggleIcon');
  if(!toggle || !track || !thumb || !icon) return;

  function applyMode(mode){
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
  if(saved) applyMode(saved);
  else {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyMode(prefersLight ? 'light' : 'dark');
  }

  toggle.addEventListener('click', ()=> {
    const isLight = document.documentElement.classList.contains('light');
    applyMode(isLight ? 'dark' : 'light');
  });

  // Keep title color updated on resize (defensive)
  window.addEventListener('resize', ()=>{
    const accent = document.querySelector('.accent');
    if(accent){
      accent.style.color = getComputedStyle(document.documentElement).getPropertyValue('--title-name').trim() || '';
    }
  });
}

/* ================= Source deterrents (NOT secure) ================= */
function initSourceDeterrents(){
  document.addEventListener('contextmenu', (e)=> e.preventDefault());
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'F12') e.preventDefault();
    if(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if(e.ctrlKey && (e.key === 'U' || e.key === 'u')) e.preventDefault();
  });
}

/* ================= Contact flow (open/hide/submit) ================= */
function initContactFlow(){
  const contactSection = $('#contact');        // section element
  const contactForm = $('#contactForm');       // <form>
  const formResponse = $('#formResponse');     // response container
  const headerContact = document.querySelector('.contact-cta') || $('#contactBtn'); // header triggers
  const contactButtonFallback = $('#contactBtn');

  // Defensive checks
  if(!contactSection) {
    console.warn('Contact section (#contact) not found.');
    return;
  }
  // make sure form exists; if not, still wire open/close behavior to show contact section
  if(!contactForm) {
    console.warn('Contact form (#contactForm) not found — contact section will still open/close.');
  }

  // Open contact UI
  function openContact(){
    clearAllTimers();
    contactSection.classList.remove('hidden');
    contactSection.classList.add('show-form'); // CSS should show form when this is present
    if(contactForm) contactForm.classList.remove('hidden-form');
    contactSection.scrollIntoView({behavior:'smooth', block:'start'});
    resetIdleTimer();
  }

  // Hide contact UI
  function hideContact(){
    contactSection.classList.add('hidden');
    contactSection.classList.remove('show-form');
    if(contactForm) contactForm.classList.add('hidden-form');
    clearAllTimers();
  }

  // Idle hide handling (15s)
  function resetIdleTimer(){
    if(window.idleHideTimer) clearTimeout(window.idleHideTimer);
    window.idleHideTimer = setTimeout(()=> {
      hideContact();
      window.idleHideTimer = null;
    }, IDLE_HIDE_MS);
  }

  // clicking outside contact starts short hide (5s)
  document.addEventListener('click', (ev) => {
    if(contactSection.classList.contains('hidden')) return;
    const within = contactSection.contains(ev.target) || ev.target.classList.contains('contact-cta') || ev.target.id === 'contactBtn';
    if(!within){
      if(window.outsideHideTimer) clearTimeout(window.outsideHideTimer);
      window.outsideHideTimer = setTimeout(()=> hideContact(), OUTSIDE_CLICK_HIDE_MS);
    }
  });

  // Clear all timers helper
  function clearAllTimers(){
    if(window.idleHideTimer) { clearTimeout(window.idleHideTimer); window.idleHideTimer = null; }
    if(window.postSubmitHideTimer) { clearTimeout(window.postSubmitHideTimer); window.postSubmitHideTimer = null; }
    if(window.outsideHideTimer) { clearTimeout(window.outsideHideTimer); window.outsideHideTimer = null; }
  }

  // Attach header click to open
  if(headerContact){
    headerContact.addEventListener('click', (e)=>{
      e.preventDefault();
      openContact();
    });
  }
  if(contactButtonFallback && !headerContact){
    contactButtonFallback.addEventListener('click', (e)=>{
      e.preventDefault();
      openContact();
    });
  }

  // Keyboard shortcuts:
  // Shift + C -> open contact
  // Alt + Enter -> submit if form visible
  // Shift + R -> open resume (handled globally below)
  document.addEventListener('keydown', (e)=>{
    // Shift + C
    if(e.shiftKey && !e.ctrlKey && !e.altKey && e.code === 'KeyC'){
      e.preventDefault();
      openContact();
    }
    // Alt + Enter (submit)
    if(e.altKey && !e.ctrlKey && e.code === 'Enter'){
      if(contactSection && !contactSection.classList.contains('hidden')){
        e.preventDefault();
        if(contactForm) submitContactForm();
      }
    }
  });

  // CLICK: submit handler wiring
  if(contactForm){
    contactForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      submitContactForm();
    });
  }

  // Submit logic (JSON fetch to Apps Script)
  async function submitContactForm(){
    if(!contactForm){
      console.warn('Contact form not present to submit.');
      return;
    }
    const nameEl = $('#cname');
    const emailEl = $('#cemail');
    const messageEl = $('#cmessage');
    const submitBtn = contactForm.querySelector('button[type="submit"]') || contactForm.querySelector('button');

    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';

    if(!name || !email || !message){
      if(formResponse) { formResponse.textContent = 'Please fill all fields.'; formResponse.style.color = '#ff6b6b'; }
      return;
    }

    // UI: submitting
    if(submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute('aria-busy','true'); submitBtn.textContent = 'Sending...'; }
    if(formResponse){ formResponse.textContent = 'Sending...'; formResponse.style.color = ''; }

    // prepare payload
    const payload = {
      name, email, message,
      page: window.location.href,
      userAgent: navigator.userAgent
    };

    // fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(()=> controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
      const res = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Try parse JSON safely
      let data = null;
      try { data = await res.json(); } catch(_){ data = null; }

      if(res.ok && (data && (data.ok === true || data.status === 'success')) ){
        // success UX
        if(formResponse) { formResponse.textContent = "Thanks for contacting! I'll catch up to you soon!"; formResponse.style.color = '#10b981'; }
        if(contactForm) contactForm.reset();

        // clear idle timers
        if(window.idleHideTimer){ clearTimeout(window.idleHideTimer); window.idleHideTimer = null; }
        if(window.postSubmitHideTimer){ clearTimeout(window.postSubmitHideTimer); window.postSubmitHideTimer = null; }

        // auto-hide after POST_SUBMIT_HIDE_MS
        window.postSubmitHideTimer = setTimeout(()=> { hideContact(); }, POST_SUBMIT_HIDE_MS);

      } else {
        // treat as failure
        console.warn('Submit response', res.status, data);
        if(formResponse) { formResponse.textContent = 'Submission failed. Try again or email harishramesh004@gmail.com'; formResponse.style.color = '#ff6b6b'; }
      }
    } catch (err){
      console.error('Submit error', err);
      if(formResponse) { formResponse.textContent = 'Network error. Try again later.'; formResponse.style.color = '#ff6b6b'; }
    } finally {
      if(submitBtn){ submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy'); submitBtn.textContent = 'Send'; }
      clearTimeout(timeoutId);
    }
  }

  // expose helper to attach idle handlers from other code (optional)
  window.attachIdleHideHandlers = resetIdleTimer;
}

/* ================= Keyboard resume shortcut: Shift + R ================= */
window.addEventListener('keydown', (e)=>{
  if(e.key === 'R' && e.shiftKey){
    const resume = document.querySelector('.resume-link');
    if(resume && resume.href) window.open(resume.href, '_blank');
  }
});

/* ================= Reduced motion respect ================= */
(function respectReducedMotion(){
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(mq.matches) {
    document.documentElement.style.scrollBehavior = 'auto';
    // optional: reduce or disable heavy animations via a CSS class
    document.documentElement.classList.add('reduce-motion');
  }
})();

/* ================= Final defensive log ================= */
console.info('script.js initialized — contact endpoint:', WEB_APP_URL);

