/**
 * Portfolio.jsx — modern React port of the vanilla portfolio.
 *
 * Behaves exactly like index.html + js/main.js: same markup, same class
 * names (so css/style.css applies unchanged), same effects — starfield with
 * constellation lines, planets & galaxy, custom cursor, tilt, magnetic
 * buttons, typewriter, scroll reveals, stat counters, skills deck, and the
 * code ⇄ live-preview sliders.
 *
 * To run it:
 *   1. npm create vite@latest my-portfolio -- --template react
 *   2. copy this file plus the css/ and assets/ folders into src/
 *   3. render <Portfolio /> from main.jsx
 *   4. add the Google Fonts <link> from index.html to the Vite index.html
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './css/style.css';

/* ============================================================
   Shared helpers
   ============================================================ */

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Tracks a media query as React state (used for the mobile skills deck). */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* ============================================================
   Background: starfield, constellation lines, planets, galaxy
   ============================================================ */

function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prm = reducedMotion();
    const fine = finePointer();

    let w, h, raf;
    let stars = [];
    let shooting = [];
    let planets = [];
    let tick = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const LAYERS = [
      { count: 0.00012, size: [0.4, 0.9], speed: 0.008, parallax: 8 },
      { count: 0.00008, size: [0.8, 1.5], speed: 0.015, parallax: 20 },
      { count: 0.00004, size: [1.4, 2.2], speed: 0.025, parallax: 38 },
    ];

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

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function spawnShootingStar() {
      if (prm) return;
      shooting.push({
        x: Math.random() * w * 0.8,
        y: Math.random() * h * 0.35,
        vx: 7 + Math.random() * 6,
        vy: 3 + Math.random() * 3,
        life: 1,
      });
    }

    function drawPlanet(p, nx, ny) {
      const bob = prm ? 0 : Math.sin(tick * 0.005 + p.phase) * 5;
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
        const a = (prm ? 0 : tick * 0.008) + p.phase;
        ctx.beginPath();
        ctx.arc(px + Math.cos(a) * p.r * 1.9, py + Math.sin(a) * p.r * 0.6, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(205, 214, 255, 0.8)';
        ctx.fill();
      }
    }

    function drawGalaxy(nx, ny) {
      const gx = 0.16 * w - nx * 10;
      const gy = 0.80 * h - ny * 10;
      ctx.save();
      ctx.translate(gx, gy);
      ctx.rotate(0.6 + (prm ? 0 : tick * 0.0004));
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

    function frame() {
      tick++;
      ctx.clearRect(0, 0, w, h);

      // ease the mouse for silky parallax
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
        if (!prm) {
          s.y += s.drift;
          if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
          s.twinkle += s.twinkleSpeed;
        }
        const px = s.x - nx * layer.parallax;
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

      // constellation lines between the stars nearest the cursor
      if (near.length > 1 && fine) {
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
        if (st.life <= 0 || st.x > w + 100 || st.y > h + 100) { shooting.splice(i, 1); continue; }
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

      raf = requestAnimationFrame(frame);
    }

    const onMove = (e) => { mouse.tx = e.clientX; mouse.ty = e.clientY; };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    resize();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas id="stars" ref={canvasRef} aria-hidden="true" />;
}

function Nebula() {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const blobs = wrapRef.current.querySelectorAll('.blob');
    const strengths = [24, -32, 18];
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach((b, i) => {
        b.style.translate = `${nx * strengths[i]}px ${ny * strengths[i]}px`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="nebula" ref={wrapRef} aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

/* ============================================================
   Custom cursor — glowing dot + trailing ring
   ============================================================ */

function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    document.body.classList.add('has-cursor');

    let dx = 0, dy = 0, rx = 0, ry = 0, shown = false, raf;

    const onMove = (e) => {
      dx = e.clientX; dy = e.clientY;
      if (!shown) { shown = true; dot.style.opacity = ring.style.opacity = 1; }
    };
    const onLeave = () => { shown = false; dot.style.opacity = ring.style.opacity = 0; };

    const loop = () => {
      rx += (dx - rx) * 0.38;
      ry += (dy - ry) * 0.38;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onOver = (e) => {
      if (e.target.closest('a, button, .tilt')) ring.classList.add('is-hover');
    };
    const onOut = (e) => {
      if (e.target.closest('a, button, .tilt')) ring.classList.remove('is-hover');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}

/* ============================================================
   Global interaction hooks (tilt, magnetic, reveals)
   ============================================================ */

/** 3D tilt + spotlight tracking for every .tilt card. */
function useTilt() {
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const cards = [...document.querySelectorAll('.tilt')];
    const cleanups = cards.map((card) => {
      const max = parseFloat(card.dataset.tiltMax) || 8;
      const onMove = (e) => {
        if (window.innerWidth <= 820) return; // deck owns transforms on small screens
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform =
          `perspective(900px) rotateY(${(px - 0.5) * 2 * max}deg) rotateX(${(0.5 - py) * 2 * max}deg) translateZ(6px)`;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      };
      const onLeave = () => {
        if (window.innerWidth <= 820) return;
        card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
      };
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      return () => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

/** Magnetic elements lean toward the cursor. */
function useMagnetic() {
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const els = [...document.querySelectorAll('[data-magnetic]')];
    const strength = 0.35;
    const cleanups = els.map((el) => {
      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      };
      const onLeave = () => {
        el.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        el.style.transform = 'translate(0, 0)';
        setTimeout(() => (el.style.transition = ''), 400);
      };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

/** Fade-and-rise reveal for every .reveal element. */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ============================================================
   Hero
   ============================================================ */

const PHRASES = [
  'full-stack web apps.',
  'React + Node.js portals.',
  'responsive interfaces.',
  'SQL & MongoDB data pipelines.',
  'fast, accessible UIs.',
];

function useTypewriter(phrases) {
  const [text, setText] = useState(() => (reducedMotion() ? phrases[0] : ''));

  useEffect(() => {
    if (reducedMotion()) return;
    let pi = 0, ci = 0, deleting = false, timer;
    const type = () => {
      const phrase = phrases[pi];
      setText(phrase.slice(0, ci));
      let delay = deleting ? 34 : 72;
      if (!deleting && ci === phrase.length) { delay = 1700; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      ci += deleting ? -1 : 1;
      timer = setTimeout(type, delay);
    };
    type();
    return () => clearTimeout(timer);
  }, [phrases]);

  return text;
}

function Hero() {
  const innerRef = useRef(null);
  const typed = useTypewriter(PHRASES);

  // hero drifts gently against the cursor
  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const el = innerRef.current;
    const depth = 0.03;
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `translate(${-nx * depth * 100}px, ${-ny * depth * 60}px)`;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className="hero">
      <div className="hero-inner" ref={innerRef}>
        <p className="hero-hello reveal">Transmission from Delhi, India 🛰️</p>
        <h1 className="hero-name reveal">
          <span className="line">Eesh Chitrarth</span>
          <span className="line grad">Sharma</span>
        </h1>
        <p className="hero-type reveal">
          I build <span id="typewriter">{typed}</span><span className="caret">|</span>
        </p>
        <p className="hero-sub reveal">
          Versatile full-stack developer crafting responsive, accessible interfaces with
          React &amp; Node.js — currently shipping insurance-tech at scale for 100+ corporate clients.
        </p>
        <div className="hero-cta reveal">
          <a href="#projects" className="btn btn-primary" data-magnetic>Explore Projects</a>
          <a href="#contact" className="btn btn-ghost" data-magnetic>Get in Touch</a>
        </div>
      </div>
      <a href="#about" className="scroll-hint" aria-label="Scroll down">
        <span className="chev" />
        <span className="chev" />
      </a>
    </section>
  );
}

/* ============================================================
   About + animated stat counters
   ============================================================ */

function StatCard({ target, suffix, label }) {
  const numRef = useRef(null);

  useEffect(() => {
    const el = numRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(el);
        if (reducedMotion()) { el.textContent = target; return; }
        const dur = 1400;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <div className="stat-card tilt reveal">
      <span className="stat-num" ref={numRef}>0</span>
      <span className="stat-plus">{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="section">
      <h2 className="section-title reveal"><span className="section-num">01</span> Mission Briefing</h2>
      <div className="about-grid">
        <div className="about-text reveal">
          <p>
            I'm a versatile web developer skilled in building responsive and accessible interfaces
            with <strong>HTML, CSS, JavaScript and React</strong>. Comfortable across the full stack
            with <strong>Node.js, MongoDB, PHP and SQL</strong>, experienced with Git-based workflows
            and modern development tools.
          </p>
          <p>
            Focused on writing clean, maintainable code and collaborating effectively to create
            fast, user-friendly web applications.
          </p>
          <div className="about-langs">
            <span className="chip">🇮🇳 Hindi</span>
            <span className="chip">🇬🇧 English</span>
            <span className="chip">🇯🇵 Japanese</span>
          </div>
        </div>
        <div className="about-stats">
          <StatCard target={100} suffix="+" label="Corporate clients served" />
          <StatCard target={50} suffix="%" label="Faster response times shipped" />
          <StatCard target={1000} suffix="s" label="Employee transactions integrated" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Skills — grid on desktop, swipeable stacked deck on mobile
   ============================================================ */

const SKILL_GROUPS = [
  { title: 'Frontend', tags: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS', 'Bootstrap'] },
  { title: 'Backend', tags: ['Node.js', 'Express.js', 'RESTful APIs', 'PHP'] },
  { title: 'Databases', tags: ['MongoDB', 'Mongoose ODM', 'MySQL', 'SQL'] },
  { title: 'Languages', tags: ['JavaScript', 'PHP', 'Java (Basic)'] },
  { title: 'Site Builders', tags: ['WordPress', 'Shopify'] },
  { title: 'Tools', tags: ['Git', 'GitHub', 'yarn / npm', 'Chrome DevTools', 'VS Code'] },
];

const SOFT_SKILLS = [
  'Communication', 'Collaborative Teamwork', 'Adaptability', 'Time Management',
  'Flexibility', 'Leadership', 'Attention to Detail',
];

const PEEK = 13; // px of bottom-right offset per card depth

function Skills() {
  const isMobile = useMediaQuery('(max-width: 820px)');
  const gridRef = useRef(null);
  const [cur, setCur] = useState(0);
  const drag = useRef({ x0: null, y0: null, dragging: false });
  const n = SKILL_GROUPS.length;

  const deckStyle = (k) => {
    if (!isMobile) return undefined;
    const q = (k - cur + n) % n; // 0 = top of deck
    const depth = Math.min(q, 2);
    return {
      transform: `translate(${depth * PEEK}px, ${depth * PEEK}px) scale(${1 - depth * 0.035})`,
      zIndex: n - q,
      opacity: q > 2 ? 0 : undefined,
    };
  };

  const onPointerDown = (e) => {
    if (!isMobile) return;
    drag.current = { x0: e.clientX, y0: e.clientY, dragging: false };
    if (gridRef.current.setPointerCapture) {
      try { gridRef.current.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (d.x0 === null || !isMobile) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) d.dragging = true;
    if (d.dragging) {
      const top = gridRef.current.children[cur];
      top.style.transition = 'none';
      top.style.transform = `translate(${dx}px, 0) rotate(${dx * 0.04}deg)`;
    }
  };

  const onPointerUp = (e) => {
    const d = drag.current;
    if (d.x0 === null || !isMobile) return;
    const dx = e.clientX - d.x0;
    const top = gridRef.current.children[cur];
    top.style.transition = '';
    top.style.transform = ''; // React re-applies the deck style on re-render
    if (d.dragging && Math.abs(dx) > 60) {
      setCur((c) => (c + (dx < 0 ? 1 : n - 1)) % n); // left → next, right → previous
    }
    drag.current = { x0: null, y0: null, dragging: false };
  };

  return (
    <section id="skills" className="section">
      <h2 className="section-title reveal"><span className="section-num">02</span> Tech Constellation</h2>
      <div
        className="skills-grid"
        ref={gridRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {SKILL_GROUPS.map((group, k) => (
          <div key={group.title} className="skill-card tilt spotlight reveal" style={deckStyle(k)}>
            <h3>{group.title}</h3>
            <div className="tags">
              {group.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="soft-marquee reveal" aria-label="Soft skills">
        <div className="soft-track">
          {/* rendered twice so the -50% translate loops seamlessly */}
          {[0, 1].map((half) =>
            SOFT_SKILLS.map((skill) => (
              <span key={`${half}-${skill}`}>
                <span>{skill}</span><span className="star"> ✦</span>
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Experience timeline
   ============================================================ */

const EXPERIENCE = [
  {
    role: 'Fullstack Developer',
    when: 'Jun 2026 — Present',
    org: 'Visit Health Private Limited · Noida, India',
    pulse: true,
    bullets: [
      <>Continuing full-stack development on the multi-tenant React + Node.js insurance
        enrollment portal, taking ownership of feature development, architecture decisions,
        and code reviews.</>,
    ],
    tags: ['React', 'Node.js', 'Architecture', 'Code Review'],
  },
  {
    role: 'Software Developer Intern',
    when: 'Jul 2025 — Jun 2026',
    org: 'Visit Health Private Limited · Noida, India',
    bullets: [
      <>Built and maintained a multi-tenant React + Node.js insurance enrollment portal
        serving <strong>100+ corporate clients</strong> including Oracle, Carrier, and Genpact.</>,
      <>Reduced response times by <strong>50%</strong> by implementing Redis caching and Elasticsearch.</>,
      <>Integrated Razorpay and Juspay payment gateways with Aadhaar KYC verification
        for <strong>1000s of employee transactions</strong>.</>,
    ],
    tags: ['React', 'Node.js', 'Redis', 'Elasticsearch', 'Razorpay', 'Juspay'],
  },
  {
    role: 'Community Service Volunteer',
    when: 'Jun 2024 — Jul 2024',
    org: 'Kshitiksha Foundation · Remote',
    bullets: [
      <>Planted trees, fed the underprivileged, organized awareness drives on community
        health and cared for animals as part of social welfare initiatives.</>,
      <>Promoted sustainability and responsibility through environmental action.</>,
      <>Participated in <strong>5 community events</strong>, engaging with over
        <strong> 50 community members</strong>.</>,
    ],
    tags: ['Community', 'Sustainability', 'Leadership'],
  },
];

function Experience() {
  return (
    <section id="experience" className="section">
      <h2 className="section-title reveal"><span className="section-num">03</span> Flight Log</h2>
      <div className="timeline">
        {EXPERIENCE.map((job) => (
          <article key={job.role} className="tl-item reveal">
            <div className={job.pulse ? 'tl-dot pulse' : 'tl-dot'} />
            <div className="tl-card tilt spotlight">
              <div className="tl-head">
                <h3>{job.role}</h3>
                <span className="tl-when">{job.when}</span>
              </div>
              <p className="tl-org">{job.org}</p>
              <ul>
                {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <div className="tags">
                {job.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Projects — info panel + code ⇄ live-preview slider
   ============================================================ */

/* The snippets are pre-highlighted HTML (same as index.html). They're
   injected with dangerouslySetInnerHTML because JSX would treat all the
   braces in real code as expressions. The strings are ours, not user
   input, so this is safe here. */
const PROJECTS = [
  {
    title: 'SanBrew — Best Cafe in the Town',
    desc: `Responsive, visually engaging cafe website with an interactive menu and smooth
      animations, built for optimal cross-device experience.`,
    points: [
      'Mobile-friendly layouts using CSS flexbox and media queries',
      'Interactive elements with vanilla JavaScript',
      '95% responsiveness across desktop, tablet and mobile',
    ],
    tags: ['HTML', 'CSS', 'JavaScript'],
    live: 'https://chitrarth11.github.io/SanBrewCafe/',
    repo: 'https://github.com/chitrarth11/SanBrewCafe',
    labels: ['SanBrewCafe / index.html', 'SanBrewCafe — live preview'],
    img: 'assets/sanbrew.jpg',
    alt: 'SanBrew cafe website — live homepage',
    code: `<span class="c">&lt;!-- device-adaptive stylesheets --&gt;</span>
&lt;<span class="t">link</span> <span class="a">rel</span>=<span class="s">"stylesheet"</span> <span class="a">href</span>=<span class="s">"Style.css"</span>&gt;
&lt;<span class="t">link</span> <span class="a">rel</span>=<span class="s">"stylesheet"</span> <span class="a">href</span>=<span class="s">"phonestyle.css"</span>
      <span class="a">media</span>=<span class="s">"screen and (max-width: 1256px)"</span>&gt;

&lt;<span class="t">nav</span> <span class="a">class</span>=<span class="s">"navbar"</span>&gt;
  &lt;<span class="t">div</span> <span class="a">class</span>=<span class="s">"logo_main"</span>&gt;
    &lt;<span class="t">img</span> <span class="a">src</span>=<span class="s">"./Images/Logo/logo4.png"</span>&gt;
  &lt;/<span class="t">div</span>&gt;
  &lt;<span class="t">ul</span> <span class="a">class</span>=<span class="s">"navlist"</span>&gt;
    &lt;<span class="t">li</span>&gt;&lt;<span class="t">a</span> <span class="a">href</span>=<span class="s">"#menu-cont"</span>&gt;Our Menu&lt;/<span class="t">a</span>&gt;&lt;/<span class="t">li</span>&gt;
    &lt;<span class="t">li</span>&gt;&lt;<span class="t">a</span> <span class="a">href</span>=<span class="s">"#contact_section"</span>&gt;Contact Us&lt;/<span class="t">a</span>&gt;&lt;/<span class="t">li</span>&gt;
  &lt;/<span class="t">ul</span>&gt;
&lt;/<span class="t">nav</span>&gt;`,
  },
  {
    title: 'Chitrarth Dance Academy — Dance. Eat. Sleep. Repeat',
    desc: `Modern, expressive website for a dance academy with server-side rendering and a
      MongoDB-backed contact pipeline.`,
    points: [
      'Contact form wired to MongoDB for user submissions',
      'Server-side rendering with the Pug templating engine',
      'Form submission errors reduced 25% via client-side validation',
    ],
    tags: ['HTML', 'CSS', 'Node.js', 'MongoDB', 'Pug'],
    live: 'https://chitrarth11.github.io/Chitrarth-Dance-Academy/',
    repo: 'https://github.com/chitrarth11/Chitrarth-Dance-Academy',
    labels: ['Chitrarth-Dance-Academy / app.js', 'Chitrarth-Dance-Academy — live preview'],
    img: 'assets/dance.jpg',
    alt: 'Chitrarth Dance Academy website — live homepage',
    code: `<span class="c">// Mongoose schema for contact submissions</span>
<span class="k">const</span> contactSchema = <span class="k">new</span> mongoose.<span class="f">Schema</span>({
  name: String,
  phone: String,
  email: String,
  query: String
});
<span class="k">const</span> Contact = mongoose.<span class="f">model</span>(<span class="s">'Contact'</span>, contactSchema);

<span class="c">// Pug server-side rendering</span>
appli.<span class="f">set</span>(<span class="s">'view engine'</span>, <span class="s">'pug'</span>);
appli.<span class="f">set</span>(<span class="s">'views'</span>, path.<span class="f">join</span>(__dirname, <span class="s">'views'</span>));`,
  },
  {
    title: 'Chitrarth Athletics — Best Gym in the Town',
    desc: `Clean, visually appealing gym website showcasing facilities, training programs and
      membership details.`,
    points: [
      'Structured layout ensuring easy navigation across sections',
      'Contact form for membership inquiries',
      'Streamlined signup — form completion time reduced by 30%',
    ],
    tags: ['HTML', 'CSS'],
    live: 'https://chitrarth11.github.io/ChitrarthAthletics/',
    repo: 'https://github.com/chitrarth11/ChitrarthAthletics',
    labels: ['ChitrarthAthletics / index.html', 'ChitrarthAthletics — live preview'],
    img: 'assets/gym.jpg',
    alt: 'Chitrarth Athletics gym website — live homepage',
    code: `<span class="c">/* hero backdrop + glass navbar */</span>
<span class="t">body</span> {
  <span class="a">margin</span>: <span class="s">0</span>;
  <span class="a">background</span>: <span class="s">url('Images/machines-dark.jpg') no-repeat</span>;
  <span class="a">background-size</span>: <span class="s">cover</span>;
}
<span class="t">.mid</span> {
  <span class="a">background-color</span>: <span class="s">rgb(98 214 197 / 80%)</span>;
  <span class="a">border</span>: <span class="s">3px solid rgb(15, 89, 78)</span>;
  <span class="a">border-radius</span>: <span class="s">50px</span>;
  <span class="a">width</span>: <span class="s">51%</span>;
}
<span class="t">.logo</span> {
  <span class="a">width</span>: <span class="s">95px</span>;
  <span class="a">filter</span>: <span class="s">invert(100%)</span>;
}`,
  },
];

function MediaWindow({ project }) {
  const [idx, setIdx] = useState(0);
  const [height, setHeight] = useState('auto');
  const slidesRef = useRef(null);
  const swipe = useRef({ x0: null, y0: null });
  const count = 2;

  // window height follows the active slide so screenshots show uncropped
  const measure = () => {
    const slide = slidesRef.current?.children[idx];
    if (slide) setHeight(slide.offsetHeight);
  };
  useLayoutEffect(measure, [idx]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  });

  const go = (i) => setIdx(((i % count) + count) % count);

  const onPointerDown = (e) => { swipe.current = { x0: e.clientX, y0: e.clientY }; };
  const onPointerUp = (e) => {
    const { x0, y0 } = swipe.current;
    if (x0 === null) return;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
    swipe.current = { x0: null, y0: null };
  };

  return (
    <div className="code-window tilt" data-tilt-max="6">
      <div className="code-bar">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <span className="code-file">{project.labels[idx]}</span>
      </div>
      <div className="slider" style={{ height }}>
        <div
          className="slides"
          ref={slidesRef}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="slide slide-code">
            <pre><code dangerouslySetInnerHTML={{ __html: project.code }} /></pre>
          </div>
          <div className="slide slide-shot">
            <img src={project.img} alt={project.alt} loading="lazy" onLoad={measure} />
          </div>
        </div>
      </div>
      <div className="slide-controls">
        <button className="slide-arrow slide-prev" aria-label="Previous view" onClick={() => go(idx - 1)}>‹</button>
        {[0, 1].map((i) => (
          <button
            key={i}
            className={idx === i ? 'slide-dot active' : 'slide-dot'}
            aria-label={i === 0 ? 'Show code snippet' : 'Show live preview'}
            onClick={() => go(i)}
          />
        ))}
        <button className="slide-arrow slide-next" aria-label="Next view" onClick={() => go(idx + 1)}>›</button>
      </div>
    </div>
  );
}

function Projects() {
  return (
    <section id="projects" className="section">
      <h2 className="section-title reveal"><span className="section-num">04</span> Launched Missions</h2>
      <p className="section-sub reveal">Live code pulled straight from my public GitHub repositories.</p>
      <div className="projects">
        {PROJECTS.map((project) => (
          <article key={project.title} className="project reveal">
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <ul className="project-points">
                {project.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
              <div className="tags">
                {project.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
              <div className="project-links">
                <a className="btn btn-primary live-btn" href={project.live} target="_blank" rel="noopener noreferrer" data-magnetic>
                  View Live Website
                </a>
                <a className="repo-link" href={project.repo} target="_blank" rel="noopener noreferrer" data-magnetic>
                  View repository <span className="arrow">→</span>
                </a>
              </div>
            </div>
            <MediaWindow project={project} />
          </article>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Education
   ============================================================ */

function Education() {
  return (
    <section id="education" className="section">
      <h2 className="section-title reveal"><span className="section-num">05</span> Training Grounds</h2>
      <div className="edu-grid">
        <div className="edu-card tilt spotlight reveal">
          <p className="edu-when">2022 — 2026</p>
          <h3>SRM Institute of Science and Technology</h3>
          <p className="edu-what">B.Tech — Computer Science &amp; Engineering</p>
          <p className="edu-where">Delhi NCR, India</p>
          <span className="edu-score">CGPA 8.01</span>
        </div>
        <div className="edu-card tilt spotlight reveal">
          <p className="edu-when">2019 — 2022</p>
          <h3>Him Academy Public School</h3>
          <p className="edu-where">Hamirpur, Himachal Pradesh</p>
          <div className="edu-row">
            <span className="edu-what">12th Grade · 2021 — 2022</span>
            <span className="edu-score">86.8%</span>
          </div>
          <div className="edu-row">
            <span className="edu-what">10th Grade · 2019 — 2020</span>
            <span className="edu-score">89.7%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Navigation
   ============================================================ */

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact', cta: true },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('');
  const lastY = useRef(0);
  const openRef = useRef(open);
  openRef.current = open;

  // hide the bar while scrolling down, show it on the way up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 140 && !openRef.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // highlight the section currently in view
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(`#${entry.target.id}`);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('section[id], footer[id]').forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <header className={hidden ? 'nav-wrap hidden' : 'nav-wrap'}>
      <nav className="nav" aria-label="Primary">
        <a href="#top" className="nav-logo" data-magnetic>eesh<span>.dev</span></a>
        <button
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>
        <ul className={open ? 'nav-links open' : 'nav-links'}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={[link.cta ? 'nav-cta' : '', active === link.href ? 'active' : ''].join(' ').trim() || undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

/* ============================================================
   Footer
   ============================================================ */

function Footer() {
  return (
    <footer id="contact" className="footer">
      <h2 className="footer-title reveal">Let's build something <span className="grad">stellar</span>.</h2>
      <p className="footer-sub reveal">Open to full-stack roles, freelance missions and cosmic collaborations.</p>
      <a href="mailto:eeshchitrarth03@gmail.com" className="mail-btn reveal">✉&nbsp; eeshchitrarth03@gmail.com</a>
      <p className="footer-meta reveal">Delhi, India</p>

      <div className="socials reveal">
        <a
          href="https://github.com/chitrarth11"
          target="_blank"
          rel="noopener noreferrer"
          className="social"
          aria-label="GitHub — chitrarth11"
          data-magnetic
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
        <a
          href="https://linkedin.com/in/chitrarth11"
          target="_blank"
          rel="noopener noreferrer"
          className="social"
          aria-label="LinkedIn — chitrarth11"
          data-magnetic
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2.5" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
      </div>

      <p className="copyright">© 2026 Eesh Chitrarth Sharma · Crafted among the stars 🌌</p>
    </footer>
  );
}

/* ============================================================
   Root component
   ============================================================ */

export default function Portfolio() {
  useTilt();
  useMagnetic();
  useReveal();

  return (
    <>
      <Starfield />
      <Nebula />
      <CustomCursor />
      <Nav />
      <main id="top">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Footer />
      </main>
    </>
  );
}
