/* ============================================================
   Eesh Chitrarth Sharma — Galaxy Portfolio interactions
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ------------------------------------------------------------
   1. Starfield canvas — parallax layers, constellation lines
      near the cursor, and occasional shooting stars.
   ------------------------------------------------------------ */
(() => {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  let stars = [];
  let shooting = [];
  let planets = [];
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

  const LAYERS = [
    { count: 0.00012, size: [0.4, 0.9], speed: 0.008, parallax: 8 },
    { count: 0.00008, size: [0.8, 1.5], speed: 0.015, parallax: 20 },
    { count: 0.00004, size: [1.4, 2.2], speed: 0.025, parallax: 38 },
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const base = Math.min(w, h);
    planets = [
      { fx: 0.09, fy: 0.20, r: base * 0.05 + 16, c: [139, 92, 246], ring: true,  parallax: 26, phase: 0 },
      { fx: 0.90, fy: 0.12, r: base * 0.02 + 8,  c: [34, 211, 238], ring: false, parallax: 14, phase: 2 },
      { fx: 0.84, fy: 0.70, r: base * 0.03 + 12, c: [217, 70, 239], ring: false, parallax: 34, phase: 4, moon: true },
    ];

    stars = [];
    const area = w * h;
    LAYERS.forEach((layer, li) => {
      const n = Math.max(20, Math.floor(area * layer.count));
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
          layer: li,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
          drift: layer.speed * (0.5 + Math.random()),
        });
      }
    });
  }

  function spawnShootingStar() {
    if (prefersReducedMotion) return;
    shooting.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.35,
      vx: 7 + Math.random() * 6,
      vy: 3 + Math.random() * 3,
      life: 1,
    });
  }

  function drawPlanet(p, nx, ny) {
    const bob = prefersReducedMotion ? 0 : Math.sin(tick * 0.005 + p.phase) * 5;
    const px = p.fx * w - nx * p.parallax;
    const py = p.fy * h - ny * p.parallax + bob;

    const g = ctx.createRadialGradient(px - p.r * 0.35, py - p.r * 0.35, p.r * 0.1, px, py, p.r);
    g.addColorStop(0, `rgba(${p.c[0]}, ${p.c[1]}, ${p.c[2]}, 0.5)`);
    g.addColorStop(0.7, `rgba(${p.c[0]}, ${p.c[1]}, ${p.c[2]}, 0.2)`);
    g.addColorStop(1, 'rgba(10, 13, 32, 0)');
    ctx.beginPath();
    ctx.arc(px, py, p.r, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    if (p.ring) {
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.7, p.r * 0.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${p.c[0]}, ${p.c[1]}, ${p.c[2]}, 0.35)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 1.45, p.r * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(205, 214, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    if (p.moon) {
      const a = (prefersReducedMotion ? 0 : tick * 0.008) + p.phase;
      const mx = px + Math.cos(a) * p.r * 1.9;
      const my = py + Math.sin(a) * p.r * 0.6;
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(205, 214, 255, 0.8)';
      ctx.fill();
    }
  }

  function drawGalaxy(nx, ny) {
    const gx = 0.16 * w - nx * 10;
    const gy = 0.80 * h - ny * 10;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(0.6 + (prefersReducedMotion ? 0 : tick * 0.0004));
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, 46 - i * 12, 16 - i * 4, i * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(217, 70, 239, ${0.09 + i * 0.05})`;
      ctx.lineWidth = 4 - i;
      ctx.stroke();
    }
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
    cg.addColorStop(0, 'rgba(232, 234, 246, 0.45)');
    cg.addColorStop(1, 'rgba(232, 234, 246, 0)');
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  }

  let tick = 0;
  function frame() {
    tick++;
    ctx.clearRect(0, 0, w, h);

    // ease mouse for silky parallax
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const cx = w / 2, cy = h / 2;
    const nx = mouse.tx > -999 ? (mouse.x - cx) / cx : 0;
    const ny = mouse.ty > -999 ? (mouse.y - cy) / cy : 0;

    drawGalaxy(nx, ny);
    for (const p of planets) drawPlanet(p, nx, ny);

    const near = [];

    for (const s of stars) {
      const layer = LAYERS[s.layer];

      if (!prefersReducedMotion) {
        s.y += s.drift;                       // slow downward drift
        if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
        s.twinkle += s.twinkleSpeed;
      }

      const px = s.x - nx * layer.parallax;   // parallax toward cursor
      const py = s.y - ny * layer.parallax;

      const alpha = 0.45 + 0.55 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(205, 214, 255, ${alpha})`;
      ctx.fill();

      if (s.layer > 0 && mouse.tx > -999) {
        const dx = px - mouse.x, dy = py - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160) near.push({ x: px, y: py, d2 });
      }
    }

    // constellation lines between stars near the cursor
    if (near.length > 1 && isFinePointer) {
      near.sort((a, b) => a.d2 - b.d2);
      const pts = near.slice(0, 8);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.5 * (1 - d / 130)})`;
            ctx.stroke();
          }
        }
      }
    }

    // shooting stars
    for (let i = shooting.length - 1; i >= 0; i--) {
      const st = shooting[i];
      st.x += st.vx;
      st.y += st.vy;
      st.life -= 0.014;
      if (st.life <= 0 || st.x > w + 100 || st.y > h + 100) {
        shooting.splice(i, 1);
        continue;
      }
      const tail = 14;
      const grad = ctx.createLinearGradient(st.x, st.y, st.x - st.vx * tail, st.y - st.vy * tail);
      grad.addColorStop(0, `rgba(34, 211, 238, ${0.9 * st.life})`);
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x - st.vx * tail, st.y - st.vy * tail);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    if (tick % 240 === 0 && Math.random() < 0.65) spawnShootingStar();

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
  });

  resize();
  requestAnimationFrame(frame);
})();

/* ------------------------------------------------------------
   2. Nebula blobs — subtle counter-parallax to the mouse
   ------------------------------------------------------------ */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const blobs = document.querySelectorAll('.blob');
  const strengths = [24, -32, 18];
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    blobs.forEach((b, i) => {
      b.style.translate = `${nx * strengths[i]}px ${ny * strengths[i]}px`;
    });
  }, { passive: true });
})();

/* ------------------------------------------------------------
   3. Custom cursor — glowing dot + trailing ring
   ------------------------------------------------------------ */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  document.body.classList.add('has-cursor');

  let dx = 0, dy = 0, rx = 0, ry = 0, shown = false;

  window.addEventListener('pointermove', (e) => {
    dx = e.clientX; dy = e.clientY;
    if (!shown) {
      shown = true;
      dot.style.opacity = ring.style.opacity = 1;
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    shown = false;
    dot.style.opacity = ring.style.opacity = 0;
  });

  (function loop() {
    rx += (dx - rx) * 0.38;
    ry += (dy - ry) * 0.38;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .tilt').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
})();

/* ------------------------------------------------------------
   4. 3D tilt cards + spotlight tracking
   ------------------------------------------------------------ */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  document.querySelectorAll('.tilt').forEach((card) => {
    const max = parseFloat(card.dataset.tiltMax) || 8;
    card.addEventListener('pointermove', (e) => {
      if (window.innerWidth <= 820) return; // deck/carousel owns transforms on small screens
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(900px) rotateY(${(px - 0.5) * 2 * max}deg) rotateX(${(0.5 - py) * 2 * max}deg) translateZ(6px)`;
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
    });
  });
})();

/* ------------------------------------------------------------
   5. Magnetic elements — buttons & social icons lean
      toward the cursor
   ------------------------------------------------------------ */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      el.style.transform = 'translate(0, 0)';
      setTimeout(() => (el.style.transition = ''), 400);
    });
  });
})();

/* ------------------------------------------------------------
   6. Hero parallax shift
   ------------------------------------------------------------ */
(() => {
  if (!isFinePointer || prefersReducedMotion) return;
  const el = document.querySelector('[data-parallax]');
  if (!el) return;
  const depth = parseFloat(el.dataset.parallax) || 0.03;
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    el.style.transform = `translate(${-nx * depth * 100}px, ${-ny * depth * 60}px)`;
  }, { passive: true });
})();

/* ------------------------------------------------------------
   7. Typewriter
   ------------------------------------------------------------ */
(() => {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const phrases = [
    'full-stack web apps.',
    'React + Node.js portals.',
    'responsive interfaces.',
    'SQL & MongoDB data pipelines.',
    'fast, accessible UIs.',
  ];
  if (prefersReducedMotion) {
    el.textContent = phrases[0];
    return;
  }
  let pi = 0, ci = 0, deleting = false;
  (function type() {
    const phrase = phrases[pi];
    el.textContent = phrase.slice(0, ci);
    let delay = deleting ? 34 : 72;
    if (!deleting && ci === phrase.length) { delay = 1700; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
    ci += deleting ? -1 : 1;
    setTimeout(type, delay);
  })();
})();

/* ------------------------------------------------------------
   8. Scroll reveal + stat counters
   ------------------------------------------------------------ */
(() => {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObs.unobserve(el);
      const target = parseInt(el.dataset.count, 10);
      if (prefersReducedMotion) { el.textContent = target; return; }
      const dur = 1400;
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach((el) => countObs.observe(el));
})();

/* ------------------------------------------------------------
   9. Nav — hide on scroll down, mobile menu, active section
   ------------------------------------------------------------ */
(() => {
  const wrap = document.querySelector('.nav-wrap');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    wrap.classList.toggle('hidden', y > lastY && y > 140 && !links.classList.contains('open'));
    lastY = y;
  }, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  const sections = document.querySelectorAll('section[id], footer[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => activeObs.observe(s));
})();

/* ------------------------------------------------------------
   10. Skills deck — on small screens the cards overlap and the
       centered card rises above its neighbours while swiping
   ------------------------------------------------------------ */
(() => {
  const grid = document.querySelector('.skills-grid');
  if (!grid) return;
  const cards = [...grid.children];
  const mq = window.matchMedia('(max-width: 820px)');

  function update() {
    if (!mq.matches) {
      cards.forEach((c) => { c.style.transform = ''; c.style.zIndex = ''; });
      return;
    }
    const rect = grid.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs((r.left + r.width / 2 - center) / rect.width);
      const scale = 1 - Math.min(d * 0.35, 0.18);
      c.style.transform = `scale(${scale})`;
      c.style.zIndex = String(100 - Math.round(d * 100));
    });
  }

  grid.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (mq.addEventListener) mq.addEventListener('change', update);
  update();
})();

/* ------------------------------------------------------------
   11. Project media sliders — code snippet ⇄ live screenshot
       via arrows, dots, or swipe
   ------------------------------------------------------------ */
(() => {
  document.querySelectorAll('.code-window').forEach((win) => {
    const slides = win.querySelector('.slides');
    if (!slides) return;
    const dots = [...win.querySelectorAll('.slide-dot')];
    const label = win.querySelector('.code-file');
    let labels = [];
    try { labels = JSON.parse(label.dataset.labels || '[]'); } catch (e) { /* keep static label */ }
    const n = slides.children.length;
    let i = 0;

    function go(idx) {
      i = ((idx % n) + n) % n;
      slides.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach((d, k) => d.classList.toggle('active', k === i));
      if (labels[i]) label.textContent = labels[i];
    }

    win.querySelector('.slide-prev').addEventListener('click', () => go(i - 1));
    win.querySelector('.slide-next').addEventListener('click', () => go(i + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));

    let x0 = null, y0 = null;
    slides.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; }, { passive: true });
    slides.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(i + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    }, { passive: true });
  });
})();
