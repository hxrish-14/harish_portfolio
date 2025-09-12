/* Small utility selectors */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* Timers for contact show/hide */
let idleHideTimer = null;
let postSubmitHideTimer = null;

/* Init on load */
window.addEventListener('load', () => {
  document.body.classList.add('page-loaded'); // triggers header intro
  initObservers();
  animateSkillBars();
  initNav();
  initLangHover();
  initContactFlow();
  initBlobMotion();
});

/* Section reveal */
function initObservers(){
  const sections = $$('.section');
  if(!sections.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });
  sections.forEach(s => obs.observe(s));
}

/* Progress bars animate */
function animateSkillBars(){
  $$('.progress .fill').forEach(f => {
    const w = getComputedStyle(f).getPropertyValue('--w') || '0%';
    f.style.width = '0%';
    setTimeout(()=> f.style.width = w, 420);
  });
}

/* Language icon hover labels: CSS handles label visibility; add small class for extra glow */
function initLangHover(){
  $$('.lang-icon').forEach(icon => {
    icon.addEventListener('mouseenter', ()=> icon.classList.add('hovered'));
    icon.addEventListener('mouseleave', ()=> icon.classList.remove('hovered'));
  });
}

/* Navigation behavior (smooth scroll), ensure sections not hidden by header (scroll-margin-top in CSS) */
function initNav(){
  $$('.nav-link, .action-btn, .see-projects').forEach(el => {
    el.addEventListener('click', (ev) => {
      const href = el.getAttribute('href');
      if(!href) return;
      if(href.startsWith('http')) return; // external links should open normally
      ev.preventDefault();
      const target = document.querySelector(href);
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      headerPulse();
    });
  });
}

/* header micro animation */
function headerPulse(){
  const header = $('#siteHeader');
  if(!header) return;
  header.style.transform = 'translateY(-6px)';
  setTimeout(()=> header.style.transform = '', 260);
}

/* Blob gentle motion */
function initBlobMotion(){
  const b1 = document.querySelector('.blob.b1');
  const b2 = document.querySelector('.blob.b2');
  if(!b1 || !b2) return;
  let t = 0;
  function anim(){
    t += 0.006;
    b1.style.transform = `translate(${Math.sin(t*1.1)*18}px, ${Math.cos(t)*10}px) rotate(${t*12}deg)`;
    b2.style.transform = `translate(${Math.cos(t*0.9)*14}px, ${Math.sin(t*1.05)*8}px) rotate(${t*9}deg)`;
    requestAnimationFrame(anim);
  }
  anim();
}

/* CONTACT flow:
   - contact section hidden by default (class 'hidden')
   - clicking header Contact shows contact section and reveals form
   - idle hide after 15s (if no interaction)
   - after successful submit hide after 10s
*/
function initContactFlow(){
  const contactLink = $('.contact-cta');
  const contactSection = $('#contact');
  const contactForm = $('#contactForm');
  const formResponse = $('#formResponse');

  if(!contactLink || !contactSection) return;

  // open contact on header click
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    openContact();
  });

  function openContact(){
    clearTimers();
    contactSection.classList.remove('hidden');
    contactSection.classList.add('show-form');
    if(contactForm) contactForm.classList.remove('hidden-form');
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // idle hide timer (15s)
    idleHideTimer = setTimeout(() => hideContact(), 15000);

    // reset idle on interaction
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

  function clearTimers(){
    if(idleHideTimer){ clearTimeout(idleHideTimer); idleHideTimer = null; }
    if(postSubmitHideTimer){ clearTimeout(postSubmitHideTimer); postSubmitHideTimer = null; }
  }

  // form submit
  if(contactForm){
    contactForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const name = $('#cname') ? $('#cname').value.trim() : '';
      const email = $('#cemail') ? $('#cemail').value.trim() : '';
      const message = $('#cmessage') ? $('#cmessage').value.trim() : '';
      if(!name || !email || !message){
        formResponse.textContent = 'Please fill all fields.';
        return;
      }
      formResponse.textContent = 'Sending...';
      setTimeout(()=> {
        contactForm.reset();
        formResponse.innerHTML = "<strong>Thanks for contacting! I'll catch up to you soon!</strong>";
        formResponse.classList.add('sent');
        if(idleHideTimer){ clearTimeout(idleHideTimer); idleHideTimer = null; }
        postSubmitHideTimer = setTimeout(()=> hideContact(), 10000);
      }, 900);
    });
  }

  // clicking outside quietly starts a short hide timer
  document.addEventListener('click', (ev) => {
    if(contactSection.classList.contains('hidden')) return;
    const within = contactSection.contains(ev.target) || ev.target.classList.contains('contact-cta');
    if(!within && !idleHideTimer){
      idleHideTimer = setTimeout(()=> hideContact(), 5000);
    }
  });
}

/* keyboard 'r' opens resume if set */
window.addEventListener('keydown', (e) => {
  if(e.key.toLowerCase() === 'r'){
    const resume = document.querySelector('.resume-link');
    if(resume && resume.href && !resume.href.includes('RESUME_LINK')) window.open(resume.href, '_blank');
  }
});

/* Respect reduced motion preference */
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
if(mq.matches) document.documentElement.style.scrollBehavior = 'auto';
