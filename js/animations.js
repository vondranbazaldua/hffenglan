/* =========================================================
   hffenglan.com — animations.js — rich motion layer
   - Parallax on scroll (rAF-throttled)
   - Tilt on hover (mouse-driven) for .tilt elements
   - Magnetic buttons with .magnetic class
   - Ripple on click for .ripple buttons
   - Reading progress bar
   - Cursor follower for [data-cursor] elements
   - Blob-field generation in .blob-field containers
   ========================================================= */
(function(){
  'use strict';

  // -------- Reduced motion guard --------
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------- Inject aurora & noise once --------
  if (!reduce && !document.querySelector('.aurora')){
    const a = document.createElement('div');
    a.className = 'aurora';
    document.body.appendChild(a);
    const n = document.createElement('div');
    n.className = 'noise-overlay';
    document.body.appendChild(n);
  }

  // -------- Inject blob fields --------
  document.querySelectorAll('.blob-field').forEach(host => {
    if (host.dataset.populated) return;
    host.dataset.populated = '1';
    ['b1','b2','b3'].forEach(cls => {
      const s = document.createElement('span');
      s.className = cls;
      host.appendChild(s);
    });
  });

  // -------- Parallax --------
  const parallaxes = document.querySelectorAll('[data-parallax]');
  if (parallaxes.length && !reduce){
    let raf = null;
    const update = () => {
      const y = window.scrollY;
      parallaxes.forEach(el => {
        const speed = Number(el.dataset.parallax || '0.18');
        el.style.transform = `translate3d(0, ${(-y * speed).toFixed(2)}px, 0)`;
      });
      raf = null;
    };
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    update();
  }

  // -------- Tilt --------
  if (!reduce){
    document.querySelectorAll('.tilt').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateZ(6px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // -------- Magnetic buttons --------
  if (!reduce){
    document.querySelectorAll('.magnetic').forEach(el => {
      const strength = Number(el.dataset.strength || '0.25');
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // -------- Ripple --------
  document.querySelectorAll('.ripple').forEach(el => {
    el.addEventListener('click', e => {
      const rect = el.getBoundingClientRect();
      const d = Math.max(rect.width, rect.height);
      const r = document.createElement('span');
      r.className = 'r';
      r.style.width = r.style.height = `${d}px`;
      r.style.left = `${e.clientX - rect.left - d / 2}px`;
      r.style.top = `${e.clientY - rect.top - d / 2}px`;
      el.appendChild(r);
      setTimeout(() => r.remove(), 700);
    });
  });

  // -------- Reading progress bar --------
  if (!document.getElementById('progress')){
    const bar = document.createElement('div');
    bar.id = 'progress';
    bar.style.cssText = 'position:fixed;top:var(--nav-h);left:0;right:0;height:2px;background:transparent;z-index:200;pointer-events:none;';
    bar.innerHTML = '<div style="height:100%;width:0;background:linear-gradient(90deg,#00d4ff,#7c5cff,#ff3ea5);transition:width .12s linear;box-shadow:0 0 16px rgba(0,212,255,.6);"></div>';
    document.body.appendChild(bar);
    const inner = bar.firstElementChild;
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
      inner.style.width = isFinite(pct) ? `${Math.min(100, Math.max(0, pct))}%` : '0';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // -------- Smooth in-page scroll with nav offset --------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    if (a.__smooth) return;
    a.__smooth = true;
    a.addEventListener('click', ev => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // -------- Section "in view" class for blobs / hero glow --------
  const watch = document.querySelectorAll('[data-watch]');
  if ('IntersectionObserver' in window && watch.length){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting){
          e.target.classList.add('watching');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    watch.forEach(el => io.observe(el));
  }

  // -------- Number counters (delegation to existing handler in main.js if present) --------
  // Already covered in main.js — left here intentionally empty to avoid duplication.

  // -------- Refresh-on-resize --------
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      // Reset tilt/magnetic transforms so cards re-anchor correctly
      document.querySelectorAll('.tilt, .magnetic').forEach(el => { el.style.transform = ''; });
    }, 120);
  });

})();
