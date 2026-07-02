/* =========================================================
   hffenglan.com — Core behaviours
   ========================================================= */
(function(){
  'use strict';

  /* ---- Nav scroll state ---- */
  const nav = document.querySelector('.nav');
  const setNavState = () => {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  setNavState();
  window.addEventListener('scroll', setNavState, { passive: true });

  /* ---- Mobile menu toggle ---- */
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.nav__menu');
  if (toggle && menu){
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    }));
  }

  /* ---- Set active nav link based on current URL ---- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav__menu a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href && (href === path || (path === '' && href === 'index.html'))) a.classList.add('active');
  });

  /* ---- Reveal on scroll (Intersection Observer) ---- */
  const reveals = document.querySelectorAll('.reveal');
  const staggers = document.querySelectorAll('[data-stagger]');
  if ('IntersectionObserver' in window && (reveals.length || staggers.length)){
    // Mark off-screen stagger containers as pending so their children animate in.
    staggers.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top > (window.innerHeight || document.documentElement.clientHeight) - 60){
        el.classList.add('pending');
      }
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('in');
          e.target.classList.remove('pending');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
    staggers.forEach(el => io.observe(el));
    // Safety net: if any pending stagger is still hidden after 2s, reveal it.
    setTimeout(() => {
      document.querySelectorAll('[data-stagger].pending').forEach(el => {
        el.classList.remove('pending');
        el.classList.add('in');
      });
    }, 2000);
  } else {
    reveals.forEach(el => el.classList.add('in'));
    staggers.forEach(el => el.classList.add('in'));
  }

  /* ---- Animated counters (stat numbers) ---- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length){
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = Number(el.getAttribute('data-count') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const dur = Number(el.getAttribute('data-dur') || '1600');
        const start = performance.now();
        const fmt = (n) => {
          if (target >= 1000) return Math.round(n).toLocaleString();
          if (Number.isInteger(target)) return Math.round(n).toString();
          return n.toFixed(1);
        };
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = fmt(target) + suffix;
        };
        requestAnimationFrame(tick);
        io2.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => io2.observe(c));
  }

  /* ---- Smooth in-page anchor scroll (with sticky nav offset) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (ev) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- News filters ---- */
  const filterButtons = document.querySelectorAll('.filters [data-filter]');
  const newsItems = document.querySelectorAll('[data-cat]');
  if (filterButtons.length && newsItems.length){
    filterButtons.forEach(b => b.addEventListener('click', () => {
      filterButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const f = b.getAttribute('data-filter');
      newsItems.forEach(item => {
        const cat = item.getAttribute('data-cat');
        const show = (f === 'all' || f === cat);
        item.style.display = show ? '' : 'none';
      });
    }));
  }

  /* ---- Parallax for hero blobs ---- */
  const blobs = document.querySelectorAll('.hero__bg::before, .hero__bg::after');
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg){
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        heroBg.style.transform = `translate3d(0, ${y * -0.06}px, 0)`;
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Animated typing for hero (optional data-typed) ---- */
  document.querySelectorAll('[data-typed]').forEach(el => {
    const items = (el.getAttribute('data-typed') || '').split('|').filter(Boolean);
    if (!items.length) return;
    let i = 0, j = 0, dir = 1, cur = '';
    const tick = () => {
      cur = items[i].slice(0, j);
      el.textContent = cur;
      j += dir;
      if (j > items[i].length + 6) { dir = -1; }
      if (j < 0) { dir = 1; i = (i + 1) % items.length; j = 0; }
      setTimeout(tick, j === items[i].length ? 1200 : 50);
    };
    tick();
  });

  /* ---- Magnetic buttons (subtle) ---- */
  document.querySelectorAll('.btn--primary, .nav__cta').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.18;
      const y = (e.clientY - r.top - r.height / 2) * 0.18;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });

  /* ---- Form: prevent default, simulate submit ---- */
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const out = form.querySelector('[data-ok]');
      const submit = form.querySelector('button[type="submit"]');
      if (submit){ submit.setAttribute('disabled','disabled'); submit.textContent = 'Sending…'; }
      await new Promise(r => setTimeout(r, 900));
      if (out){
        out.innerHTML = '<div class="success">Thank you. Your message has been received. Our team will get back to you within 1-2 business days.</div>';
        out.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      if (submit){ submit.removeAttribute('disabled'); submit.textContent = submit.getAttribute('data-label') || 'Send message'; }
    });
  });

  /* ---- Current year ---- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = String(new Date().getFullYear()));

  /* ---- Page enter fade ---- */
  document.documentElement.classList.add('ready');
})();
