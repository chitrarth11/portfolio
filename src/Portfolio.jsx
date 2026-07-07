/**
 * Portfolio.jsx — modern React port of the vanilla portfolio, styled with
 * styled-components (see Portfolio.styles.js — all visuals live there).
 *
 * Behaves exactly like index.html + js/main.js: starfield with constellation
 * lines, planets & galaxy, custom cursor, tilt, magnetic buttons, typewriter,
 * scroll reveals, stat counters, the mobile skills deck, and the
 * code ⇄ live-preview sliders.
 *
 * To run it:
 *   1. npm create vite@latest my-portfolio -- --template react
 *   2. npm i styled-components
 *   3. copy this file, Portfolio.styles.js and the assets/ folder into src/
 *   4. render <Portfolio /> from main.jsx
 *   5. add the Google Fonts <link> from index.html to the Vite index.html
 */

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  GlobalStyle, StarsCanvas, NebulaWrap, Blob, CursorDot, CursorRing,
  NavWrap, NavBar, NavLogo, NavToggle, NavLinks,
  Btn, LiveBtn, HeroSection, HeroInner, HeroHello, HeroName, NameLine,
  GradText, HeroType, Caret, HeroSub, HeroCta, ScrollHint, Chev,
  Section, SectionTitle, SectionNum, SectionSub,
  AboutText, AboutLangs, Chip, AboutStats, StatCardBox, StatNum, StatLabel,
  Tags, SkillsGrid, SkillCard, SoftMarquee, SoftTrack, SoftStar,
  Timeline, TlItem, TlDot, TlCard, TlHead, TlWhen, TlOrg,
  ProjectsWrap, ProjectCard, ProjectInfo, ProjectPoints, ProjectLinks, RepoLink,
  CodeWindow, CodeBar, WinDot, CodeFile, Slider, Slides, Slide, SlideShot,
  CodePre, Tok, SlideControls, SlideArrow, SlideDot,
  EduGrid, EduCard, EduWhen, EduWhat, EduWhere, EduScore, EduRow,
  FooterWrap, FooterTitle, FooterSub, MailBtn, FooterMeta, Socials, SocialLink, Copyright,
} from './Portfolio.styles';

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

      // moon depth: sin(a) < 0 is the far side of the orbit, so the moon is
      // drawn BEFORE the planet body there (planet paints over it), and
      // shrinks/dims with distance for a 3D feel
      let drawMoon = null;
      let moonInFront = false;
      if (p.moon) {
        const a = (prm ? 0 : tick * 0.008) + p.phase;
        const depth = (Math.sin(a) + 1) / 2; // 0 = fully behind, 1 = fully in front
        const mx = px + Math.cos(a) * p.r * 1.35;
        const my = py + Math.sin(a) * p.r * 0.45;
        moonInFront = depth >= 0.5;
        drawMoon = () => {
          // behind the planet: clip away the planet's disc so the moon is
          // fully hidden while passing behind it (halo stays translucent)
          if (!moonInFront) {
            ctx.save();
            const clip = new Path2D();
            clip.rect(0, 0, w, h);
            clip.arc(px, py, p.r * 0.92, 0, Math.PI * 2);
            ctx.clip(clip, 'evenodd');
          }
          ctx.beginPath();
          ctx.arc(mx, my, 1.8 + depth * 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(205, 214, 255, ${0.35 + depth * 0.5})`;
          ctx.fill();
          if (!moonInFront) ctx.restore();
        };
        if (!moonInFront) drawMoon();
      }

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

      if (drawMoon && moonInFront) drawMoon();
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

  return <StarsCanvas ref={canvasRef} aria-hidden="true" />;
}

function Nebula() {
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const blobs = [...wrapRef.current.children];
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
    <NebulaWrap ref={wrapRef} aria-hidden="true">
      <Blob $v={1} />
      <Blob $v={2} />
      <Blob $v={3} />
    </NebulaWrap>
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
      <CursorDot ref={dotRef} aria-hidden="true" />
      <CursorRing ref={ringRef} aria-hidden="true" />
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
    <HeroSection>
      <HeroInner ref={innerRef}>
        <HeroHello className="reveal">Transmission from Delhi, India 🛰️</HeroHello>
        <HeroName className="reveal">
          <NameLine>Eesh Chitrarth</NameLine>
          <NameLine $grad>Sharma</NameLine>
        </HeroName>
        <HeroType className="reveal">
          I build <strong>{typed}</strong><Caret>|</Caret>
        </HeroType>
        <HeroSub className="reveal">
          Versatile full-stack developer crafting responsive, accessible interfaces with
          React &amp; Node.js — currently shipping insurance-tech at scale for 100+ corporate clients.
        </HeroSub>
        <HeroCta className="reveal">
          <Btn href="#projects" data-magnetic>Explore Projects</Btn>
          <Btn href="#contact" $ghost data-magnetic>Get in Touch</Btn>
        </HeroCta>
      </HeroInner>
      <ScrollHint href="#about" aria-label="Scroll down">
        <Chev />
        <Chev />
      </ScrollHint>
    </HeroSection>
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
    <StatCardBox className="tilt reveal">
      <StatNum ref={numRef}>0</StatNum>
      <StatNum>{suffix}</StatNum>
      <StatLabel>{label}</StatLabel>
    </StatCardBox>
  );
}

function About() {
  return (
    <Section id="about">
      <SectionTitle className="reveal"><SectionNum>01</SectionNum> Mission Briefing</SectionTitle>
      <AboutText className="reveal">
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
        <AboutLangs>
          <Chip>🇮🇳 Hindi</Chip>
          <Chip>🇬🇧 English</Chip>
          <Chip>🇯🇵 Japanese</Chip>
        </AboutLangs>
      </AboutText>
      <AboutStats>
        <StatCard target={100} suffix="+" label="Corporate clients served" />
        <StatCard target={50} suffix="%" label="Faster response times shipped" />
        <StatCard target={1000} suffix="s" label="Employee transactions integrated" />
      </AboutStats>
    </Section>
  );
}

/* ============================================================
   Skills — grid on desktop, swipeable stacked deck on mobile
   ============================================================ */

const SKILL_GROUPS = [
  { title: 'Frontend', tags: ['HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript', 'Tailwind', 'Bootstrap'] },
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
    <Section id="skills">
      <SectionTitle className="reveal"><SectionNum>02</SectionNum> Tech Constellation</SectionTitle>
      <SkillsGrid
        ref={gridRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {SKILL_GROUPS.map((group, k) => (
          <SkillCard key={group.title} className="tilt spotlight reveal" style={deckStyle(k)}>
            <h3>{group.title}</h3>
            <Tags>
              {group.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </Tags>
          </SkillCard>
        ))}
      </SkillsGrid>
      <SoftMarquee className="reveal" aria-label="Soft skills">
        <SoftTrack>
          {/* rendered twice so the -50% translate loops seamlessly */}
          {[0, 1].map((half) =>
            SOFT_SKILLS.map((skill) => (
              <Fragment key={`${half}-${skill}`}>
                <span>{skill}</span>
                <SoftStar>✦</SoftStar>
              </Fragment>
            ))
          )}
        </SoftTrack>
      </SoftMarquee>
    </Section>
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
    <Section id="experience">
      <SectionTitle className="reveal"><SectionNum>03</SectionNum> Flight Log</SectionTitle>
      <Timeline>
        {EXPERIENCE.map((job) => (
          <TlItem key={job.role} className="reveal">
            <TlDot $pulse={job.pulse} />
            <TlCard className="tilt spotlight">
              <TlHead>
                <h3>{job.role}</h3>
                <TlWhen>{job.when}</TlWhen>
              </TlHead>
              <TlOrg>{job.org}</TlOrg>
              <ul>
                {job.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <Tags>
                {job.tags.map((t) => <span key={t}>{t}</span>)}
              </Tags>
            </TlCard>
          </TlItem>
        ))}
      </Timeline>
    </Section>
  );
}

/* ============================================================
   Projects — code snippets as typed token data (no raw HTML),
   rendered through the styled Tok.* spans
   ============================================================ */

const c = (text) => ({ type: 'C', text }); // comment
const t = (text) => ({ type: 'T', text }); // tag / selector
const a = (text) => ({ type: 'A', text }); // attribute / property
const s = (text) => ({ type: 'S', text }); // string / value
const k = (text) => ({ type: 'K', text }); // keyword
const f = (text) => ({ type: 'F', text }); // function

const SANBREW_CODE = [
  [c('<!-- device-adaptive stylesheets -->')],
  ['<', t('link'), ' ', a('rel'), '=', s('"stylesheet"'), ' ', a('href'), '=', s('"Style.css"'), '>'],
  ['<', t('link'), ' ', a('rel'), '=', s('"stylesheet"'), ' ', a('href'), '=', s('"phonestyle.css"')],
  ['      ', a('media'), '=', s('"screen and (max-width: 1256px)"'), '>'],
  [''],
  ['<', t('nav'), ' ', a('class'), '=', s('"navbar"'), '>'],
  ['  <', t('div'), ' ', a('class'), '=', s('"logo_main"'), '>'],
  ['    <', t('img'), ' ', a('src'), '=', s('"./Images/Logo/logo4.png"'), '>'],
  ['  </', t('div'), '>'],
  ['  <', t('ul'), ' ', a('class'), '=', s('"navlist"'), '>'],
  ['    <', t('li'), '><', t('a'), ' ', a('href'), '=', s('"#menu-cont"'), '>Our Menu</', t('a'), '></', t('li'), '>'],
  ['    <', t('li'), '><', t('a'), ' ', a('href'), '=', s('"#contact_section"'), '>Contact Us</', t('a'), '></', t('li'), '>'],
  ['  </', t('ul'), '>'],
  ['</', t('nav'), '>'],
];

const DANCE_CODE = [
  [c('// Mongoose schema for contact submissions')],
  [k('const'), ' contactSchema = ', k('new'), ' mongoose.', f('Schema'), '({'],
  ['  name: String,'],
  ['  phone: String,'],
  ['  email: String,'],
  ['  query: String'],
  ['});'],
  [k('const'), ' Contact = mongoose.', f('model'), '(', s("'Contact'"), ', contactSchema);'],
  [''],
  [c('// Pug server-side rendering')],
  ['appli.', f('set'), '(', s("'view engine'"), ', ', s("'pug'"), ');'],
  ['appli.', f('set'), '(', s("'views'"), ', path.', f('join'), '(__dirname, ', s("'views'"), '));'],
];

const GYM_CODE = [
  [c('/* hero backdrop + glass navbar */')],
  [t('body'), ' {'],
  ['  ', a('margin'), ': ', s('0'), ';'],
  ['  ', a('background'), ': ', s("url('Images/machines-dark.jpg') no-repeat"), ';'],
  ['  ', a('background-size'), ': ', s('cover'), ';'],
  ['}'],
  [t('.mid'), ' {'],
  ['  ', a('background-color'), ': ', s('rgb(98 214 197 / 80%)'), ';'],
  ['  ', a('border'), ': ', s('3px solid rgb(15, 89, 78)'), ';'],
  ['  ', a('border-radius'), ': ', s('50px'), ';'],
  ['  ', a('width'), ': ', s('51%'), ';'],
  ['}'],
  [t('.logo'), ' {'],
  ['  ', a('width'), ': ', s('95px'), ';'],
  ['  ', a('filter'), ': ', s('invert(100%)'), ';'],
  ['}'],
];

function CodeSnippet({ lines }) {
  return (
    <CodePre>
      <code>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {line.map((tok, j) => {
              if (typeof tok === 'string') return <Fragment key={j}>{tok}</Fragment>;
              const TokSpan = Tok[tok.type];
              return <TokSpan key={j}>{tok.text}</TokSpan>;
            })}
            {'\n'}
          </Fragment>
        ))}
      </code>
    </CodePre>
  );
}

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
    code: SANBREW_CODE,
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
    code: DANCE_CODE,
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
    code: GYM_CODE,
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
    <CodeWindow className="tilt" data-tilt-max="6">
      <CodeBar>
        <WinDot $c="r" /><WinDot $c="y" /><WinDot $c="g" />
        <CodeFile>{project.labels[idx]}</CodeFile>
      </CodeBar>
      <Slider style={{ height }}>
        <Slides
          ref={slidesRef}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <Slide>
            <CodeSnippet lines={project.code} />
          </Slide>
          <SlideShot>
            <img src={project.img} alt={project.alt} loading="lazy" onLoad={measure} />
          </SlideShot>
        </Slides>
      </Slider>
      <SlideControls>
        <SlideArrow aria-label="Previous view" onClick={() => go(idx - 1)}>‹</SlideArrow>
        {[0, 1].map((i) => (
          <SlideDot
            key={i}
            $active={idx === i}
            aria-label={i === 0 ? 'Show code snippet' : 'Show live preview'}
            onClick={() => go(i)}
          />
        ))}
        <SlideArrow aria-label="Next view" onClick={() => go(idx + 1)}>›</SlideArrow>
      </SlideControls>
    </CodeWindow>
  );
}

function Projects() {
  return (
    <Section id="projects">
      <SectionTitle className="reveal"><SectionNum>04</SectionNum> Launched Missions</SectionTitle>
      <SectionSub className="reveal">Live code pulled straight from my public GitHub repositories.</SectionSub>
      <ProjectsWrap>
        {PROJECTS.map((project) => (
          <ProjectCard key={project.title} className="reveal">
            <ProjectInfo>
              <h3>{project.title}</h3>
              <p>{project.desc}</p>
              <ProjectPoints>
                {project.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ProjectPoints>
              <Tags>
                {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </Tags>
              <ProjectLinks>
                <LiveBtn href={project.live} target="_blank" rel="noopener noreferrer" data-magnetic>
                  View Live Website
                </LiveBtn>
                <RepoLink href={project.repo} target="_blank" rel="noopener noreferrer" data-magnetic>
                  View repository <span>→</span>
                </RepoLink>
              </ProjectLinks>
            </ProjectInfo>
            <MediaWindow project={project} />
          </ProjectCard>
        ))}
      </ProjectsWrap>
    </Section>
  );
}

/* ============================================================
   Education
   ============================================================ */

function Education() {
  return (
    <Section id="education">
      <SectionTitle className="reveal"><SectionNum>05</SectionNum> Training Grounds</SectionTitle>
      <EduGrid>
        <EduCard className="tilt spotlight reveal">
          <EduWhen>2022 — 2026</EduWhen>
          <h3>SRM Institute of Science and Technology</h3>
          <EduWhat>B.Tech — Computer Science &amp; Engineering</EduWhat>
          <EduWhere>Delhi NCR, India</EduWhere>
          <EduScore>CGPA 8.01</EduScore>
        </EduCard>
        <EduCard className="tilt spotlight reveal">
          <EduWhen>2019 — 2022</EduWhen>
          <h3>Him Academy Public School</h3>
          <EduWhere>Hamirpur, Himachal Pradesh</EduWhere>
          <EduRow>
            <EduWhat>12th Grade · 2021 — 2022</EduWhat>
            <EduScore>86.8%</EduScore>
          </EduRow>
          <EduRow>
            <EduWhat>10th Grade · 2019 — 2020</EduWhat>
            <EduScore>89.7%</EduScore>
          </EduRow>
        </EduCard>
      </EduGrid>
    </Section>
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
    document.querySelectorAll('section[id], footer[id]').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <NavWrap $hidden={hidden}>
      <NavBar aria-label="Primary">
        <NavLogo href="#top" data-magnetic>eesh<span>.dev</span></NavLogo>
        <NavToggle
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span /><span /><span />
        </NavToggle>
        <NavLinks $open={open}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={[link.cta ? 'cta' : '', active === link.href ? 'active' : ''].join(' ').trim() || undefined}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </NavLinks>
      </NavBar>
    </NavWrap>
  );
}

/* ============================================================
   Footer
   ============================================================ */

function Footer() {
  return (
    <FooterWrap id="contact">
      <FooterTitle className="reveal">Let's build something <GradText>stellar</GradText>.</FooterTitle>
      <FooterSub className="reveal">Open to full-stack roles, freelance missions and cosmic collaborations.</FooterSub>
      <MailBtn href="mailto:eeshchitrarth03@gmail.com" className="reveal">&nbsp; eeshchitrarth03@gmail.com</MailBtn>
      <FooterMeta className="reveal">Delhi, India</FooterMeta>

      <Socials className="reveal">
        <SocialLink
          href="https://github.com/chitrarth11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub — chitrarth11"
          data-magnetic
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </SocialLink>
        <SocialLink
          href="https://linkedin.com/in/chitrarth11"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn — chitrarth11"
          data-magnetic
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2.5" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </SocialLink>
      </Socials>

      <Copyright>© 2026 Eesh Chitrarth Sharma · Crafted among the stars 🌌</Copyright>
    </FooterWrap>
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
      <GlobalStyle />
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
