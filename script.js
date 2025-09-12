/* helpers */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

let idleHideTimer = null;
let postSubmitHideTimer = null;

/* on load */
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

/* intersection observer */
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
  $$('.progress .fill').forEach(f=>{
    const w = getComputedStyle(f).getPropertyValue('--w') || '0%';
    f.style.width = '0%';
    setTimeout(()=> f.style.width = w, 420);
  });
}

/* language hover */
function initLangHover(){
  $$('.lang-icon').forEach(icon=>{
    icon.addEventListener('mouseenter', ()=> icon.classList.add('hovered'));
    icon.addEventListener('mouseleave', ()=> icon.classList.remove('hovered'));
  });
}

/* mobile menu toggle */
function initMobileMenuToggle(){
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', (e)=>{
    if(e.target.tagName === 'A' && window.innerWidth <= 720){
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }
  });
}

/* smooth nav */
function initNav(){
  $$('.nav-link, .action-btn, .see-projects').forEach(el=>{
    el.addEventListener('click', (ev)=>{
      const href = el.getAttribute('href');
      if(!href) return;
      if(href.startsWith('http')) return;
      ev.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      headerPulse();
      const nav = document.querySelector('.main-nav');
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

/* blob motion */
function initBlobMotion(){
  const b1 = document.querySelector('.blob.b1');
  const b2 = document.querySelector('.blob.b2');
  if(!b1||!b2) return;
  let t = 0;
  function anim(){
    t += 0.0055;
    b1.style.transform = `translate(${Math.sin(t*1.1)*16}px, ${Math.cos(t)*10}px) rotate(${t*12}deg)`;
    b2.style.transform = `translate(${Math.cos(t*0.9)*12}px, ${Math.sin(t*1.05)*8}px) rotate(${t*9}deg)`;
    requestAnimationFrame(anim);
  }
  anim();
}

/* CONTACT flow */
function initContactFlow(){
  const contactLink = $('.contact-cta');
  const contactSection = $('#contact');
  const contactForm = $('#contactForm');
  const formResponse = $('#formResponse');
  if(!contactLink || !contactSection) return;

  contactLink.addEventListener('click', (e)=>{ e.preventDefault(); openContact(); });

  function openContact(){
    clearTimers();
    contactSection.classList.remove('hidden');
    contactSection.classList.add('show-form');
    if(contactForm) contactForm.classList.remove('hidden-form');
    contactSection.scrollIntoView({behavior:'smooth', block:'start'});
    idleHideTimer = setTimeout(()=> hideContact(), 15000);
    contactSection.addEventListener('mousemove', resetIdleTimer, { once:false });
    contactSection.addEventListener('focusin', resetIdleTimer, { once:false });
  }

  function hideContact(){
    contactSection.classList.add('hidden');
    contactSection.classList.remove('show-form');
    if(contactForm) contactForm.classList.add('hidden-form');
    clearTimers();
  }

  function resetIdleTimer(){
    if(idleHideTimer) clearTimeout(idleHideTimer);
    idleHideTimer = setTimeout(()=> hideContact(), 15000);
  }

  function clearTimers(){ if(idleHideTimer){ clearTimeout(idleHideTimer); idleHideTimer=null } if(postSubmitHideTimer){ clearTimeout(postSubmitHideTimer); postSubmitHideTimer=null } }

  if(contactForm){
    contactForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const name = $('#cname') ? $('#cname').value.trim() : '';
      const email = $('#cemail') ? $('#cemail').value.trim() : '';
      const message = $('#cmessage') ? $('#cmessage').value.trim() : '';
      if(!name || !email || !message){ formResponse.textContent = 'Please fill all fields.'; return; }
      formResponse.textContent = 'Sending...';
      setTimeout(()=>{
        contactForm.reset();
        formResponse.innerHTML = "<strong>Thanks for contacting! I'll catch up to you soon!</strong>";
        formResponse.classList.add('sent');
        if(idleHideTimer){ clearTimeout(idleHideTimer); idleHideTimer=null; }
        postSubmitHideTimer = setTimeout(()=> hideContact(), 10000);
      }, 900);
    });
  }

  document.addEventListener('click', (ev)=>{
    if(contactSection.classList.contains('hidden')) return;
    const within = contactSection.contains(ev.target) || ev.target.classList.contains('contact-cta');
    if(!within && !idleHideTimer){
      idleHideTimer = setTimeout(()=> hideContact(), 5000);
    }
  });
}

/* theme toggle */
function initThemeToggle(){
  const toggle = $('#themeToggle');
  const track = document.querySelector('.toggle-track');
  const thumb = document.getElementById('toggleThumb');
  const icon = document.getElementById('toggleIcon');
  if(!toggle||!track||!thumb||!icon) return;

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

  toggle.addEventListener('click', ()=>{
    const isLight = document.documentElement.classList.contains('light');
    setMode(isLight ? 'dark' : 'light');
  });
}

/* superficial deterrents */
function initSourceDeterrents(){
  document.addEventListener('contextmenu', (e)=> e.preventDefault());
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'F12') e.preventDefault();
    if(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) e.preventDefault();
    if(e.ctrlKey && (e.key === 'U' || e.key === 'u')) e.preventDefault();
  });
}

/* keyboard resume open */
window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase() === 'r'){
    const resume = document.querySelector('.resume-link');
    if(resume && resume.href && !resume.href.includes('RESUME_LINK')) window.open(resume.href, '_blank');
  }
});

/* respect reduced motion */
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if(mq.matches) document.documentElement.style.scrollBehavior = 'auto';
