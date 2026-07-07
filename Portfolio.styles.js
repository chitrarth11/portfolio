/**
 * Portfolio.styles.js — styled-components for Portfolio.jsx.
 *
 * Every styled block here is a 1:1 port of css/style.css, so the React
 * version renders pixel-identical to the vanilla site.
 *
 * Requires: npm i styled-components
 *
 * Cross-cutting behaviors driven by JS hooks (.tilt, .spotlight, .reveal,
 * body.has-cursor, .is-hover) stay as global classes in <GlobalStyle> —
 * they're toggled at runtime on many different components, which is exactly
 * what global utility classes are for. Everything structural is a named
 * styled component.
 */

import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

/* ============================================================
   Keyframes
   ============================================================ */

const drift = keyframes`
  from { transform: translate3d(0, 0, 0) scale(1); }
  to   { transform: translate3d(6vw, 4vh, 0) scale(1.15); }
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const chevPulse = keyframes`
  0%, 100% { opacity: 0.2; transform: rotate(45deg) translate(0, 0); }
  50% { opacity: 1; transform: rotate(45deg) translate(3px, 3px); }
`;

const dotPulse = keyframes`
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(1.6); opacity: 0; }
`;

const marquee = keyframes`
  to { transform: translateX(-50%); }
`;

/* ============================================================
   Shared css fragments
   ============================================================ */

const gradText = css`
  background: var(--grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const cardBase = css`
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--radius);
  backdrop-filter: blur(8px);
`;

/* ============================================================
   Background layers
   ============================================================ */

export const StarsCanvas = styled.canvas`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
`;

export const NebulaWrap = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
`;

export const Blob = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  will-change: transform;
  animation: ${drift} 26s ease-in-out infinite alternate;

  ${({ $v }) => $v === 1 && css`
    width: 46vw; height: 46vw; top: -12%; left: -8%;
    background: radial-gradient(circle, #4c1d95, transparent 65%);
  `}
  ${({ $v }) => $v === 2 && css`
    width: 42vw; height: 42vw; top: 34%; right: -12%;
    background: radial-gradient(circle, #86198f, transparent 65%);
    animation-delay: -8s;
  `}
  ${({ $v }) => $v === 3 && css`
    width: 36vw; height: 36vw; bottom: -14%; left: 22%;
    background: radial-gradient(circle, #155e75, transparent 65%);
    animation-delay: -16s;
  `}
`;

/* ============================================================
   Custom cursor
   ============================================================ */

const cursorBase = css`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  pointer-events: none;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
`;

export const CursorDot = styled.div`
  ${cursorBase}
  width: 7px;
  height: 7px;
  background: var(--cyan);
  box-shadow: 0 0 12px var(--cyan), 0 0 28px rgba(34, 211, 238, 0.6);
`;

export const CursorRing = styled.div`
  ${cursorBase}
  width: 38px;
  height: 38px;
  border: 1.5px solid rgba(139, 92, 246, 0.65);
  transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background 0.25s ease;

  &.is-hover {
    width: 62px;
    height: 62px;
    border-color: var(--magenta);
    background: rgba(217, 70, 239, 0.08);
  }
`;

/* ============================================================
   Navigation
   ============================================================ */

export const NavWrap = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: rgba(13, 16, 38, 0.55);
  border-bottom: 1px solid rgba(139, 148, 255, 0.08);
  transition: transform 0.35s ease;
  transform: ${({ $hidden }) => ($hidden ? 'translateY(-100%)' : 'none')};
`;

export const NavBar = styled.nav`
  max-width: 1180px;
  margin: 0 auto;
  height: var(--nav-h);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const NavLogo = styled.a`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.35rem;
  color: var(--text);
  text-decoration: none;
  letter-spacing: -0.02em;

  span {
    ${gradText}
  }
`;

export const NavToggle = styled.button`
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 8px;

  span {
    display: block;
    width: 24px;
    height: 2px;
    background: var(--text);
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
  }

  &[aria-expanded='true'] span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  &[aria-expanded='true'] span:nth-child(2) { opacity: 0; }
  &[aria-expanded='true'] span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  @media (max-width: 820px) {
    display: flex;
  }
`;

export const NavLinks = styled.ul`
  display: flex;
  gap: 28px;
  list-style: none;
  align-items: center;

  a {
    color: var(--text-dim);
    text-decoration: none;
    font-size: 0.92rem;
    font-weight: 500;
    position: relative;
    transition: color 0.25s;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -6px;
      width: 100%;
      height: 2px;
      background: var(--grad);
      border-radius: 2px;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    &:hover { color: var(--text); }
    &:hover::after, &.active::after { transform: scaleX(1); }
    &.active { color: var(--text); }
  }

  a.cta {
    padding: 8px 18px;
    border: 1px solid rgba(139, 92, 246, 0.5);
    border-radius: 999px;

    &::after { display: none; }
    &:hover {
      background: rgba(139, 92, 246, 0.15);
      box-shadow: 0 0 18px rgba(139, 92, 246, 0.35);
    }
  }

  @media (max-width: 820px) {
    position: fixed;
    top: var(--nav-h);
    right: 0;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    width: min(300px, 78vw);
    height: calc(100vh - var(--nav-h));
    padding: 30px 28px;
    background: rgba(13, 16, 38, 0.96);
    backdrop-filter: blur(20px);
    border-left: 1px solid var(--card-border);
    transform: ${({ $open }) => ($open ? 'translateX(0)' : 'translateX(100%)')};
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);

    li { width: 100%; }

    a {
      display: block;
      padding: 16px 0;
      font-size: 1.05rem;
      text-align: right;

      &::after { display: none; }
    }

    a.cta {
      border: none;
      padding: 16px 0;
    }
  }
`;

/* ============================================================
   Buttons
   ============================================================ */

export const Btn = styled.a`
  display: inline-block;
  padding: 14px 30px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: box-shadow 0.3s ease, background 0.3s ease, color 0.3s ease;
  will-change: transform;

  ${({ $ghost }) => ($ghost
    ? css`
        border: 1px solid rgba(139, 148, 255, 0.35);
        color: var(--text);
        background: rgba(23, 29, 62, 0.4);

        &:hover {
          border-color: var(--cyan);
          box-shadow: 0 0 24px rgba(34, 211, 238, 0.3);
        }
      `
    : css`
        background: var(--grad);
        color: #0a0d20;

        &:hover {
          box-shadow: 0 0 34px rgba(139, 92, 246, 0.55), 0 0 80px rgba(34, 211, 238, 0.25);
        }
      `)}

  @media (max-width: 520px) {
    padding: 12px 24px;
  }
`;

export const LiveBtn = styled(Btn)`
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 12px 24px;
`;

/* ============================================================
   Hero
   ============================================================ */

export const HeroSection = styled.section`
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: calc(var(--nav-h) + 40px) 24px 60px;
  position: relative;

  @media (max-width: 520px) {
    padding-left: 18px;
    padding-right: 18px;
  }
`;

export const HeroInner = styled.div``;

export const HeroHello = styled.p`
  font-family: var(--font-mono);
  color: var(--cyan);
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  margin-bottom: 18px;
`;

export const HeroName = styled.h1`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.6rem, 8vw, 5.4rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
`;

export const NameLine = styled.span`
  display: block;
  ${({ $grad }) => $grad && gradText}
`;

export const GradText = styled.span`
  ${gradText}
`;

export const HeroType = styled.p`
  margin-top: 22px;
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2.6vw, 1.35rem);
  color: var(--text-dim);

  strong {
    color: var(--text);
    font-weight: 500;
  }
`;

export const Caret = styled.span`
  color: var(--cyan);
  animation: ${blink} 1s step-end infinite;
`;

export const HeroSub = styled.p`
  max-width: 620px;
  margin-top: 20px;
  color: var(--text-dim);
  font-size: 1.02rem;
`;

export const HeroCta = styled.div`
  margin-top: 38px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ScrollHint = styled.a`
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px;
`;

export const Chev = styled.span`
  width: 11px;
  height: 11px;
  border-right: 2px solid var(--cyan);
  border-bottom: 2px solid var(--cyan);
  transform: rotate(45deg);
  animation: ${chevPulse} 1.7s ease-in-out infinite;

  &:nth-child(2) {
    animation-delay: 0.2s;
  }
`;

/* ============================================================
   Sections
   ============================================================ */

export const Section = styled.section`
  max-width: 1180px;
  margin: 0 auto;
  padding: 110px 24px 30px;

  @media (max-width: 520px) {
    padding: 80px 18px 20px;
  }
`;

export const SectionTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 4.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 44px;
  display: flex;
  align-items: baseline;
  gap: 14px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(139, 148, 255, 0.35), transparent);
    align-self: center;
  }
`;

export const SectionNum = styled.span`
  font-family: var(--font-mono);
  font-size: 0.55em;
  font-weight: 400;
  color: var(--cyan);
  opacity: 0.85;
`;

export const SectionSub = styled.p`
  color: var(--text-dim);
  margin: -28px 0 40px;
`;

/* ============================================================
   About
   ============================================================ */

export const AboutText = styled.div`
  max-width: 860px;

  p {
    margin-bottom: 18px;
    color: var(--text-dim);
    font-size: 1.05rem;
  }

  strong {
    color: var(--text);
  }
`;

export const AboutLangs = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

export const Chip = styled.span`
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: var(--card);
  font-size: 0.85rem;
  color: var(--text-dim);
  transition: border-color 0.3s, color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: var(--violet);
    color: var(--text);
    box-shadow: 0 0 18px rgba(139, 92, 246, 0.25);
  }
`;

export const AboutStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 38px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCardBox = styled.div`
  ${cardBase}
  padding: 20px 22px;
  text-align: center;
`;

export const StatNum = styled.span`
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  ${gradText}
`;

export const StatLabel = styled.span`
  display: block;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-top: 2px;
`;

/* ============================================================
   Skills
   ============================================================ */

export const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.22);
    color: #c4b5fd;
    transition: background 0.25s, color 0.25s, transform 0.25s;

    &:hover {
      background: rgba(34, 211, 238, 0.16);
      color: var(--cyan);
      transform: translateY(-2px);
    }
  }
`;

export const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* small screens: swipeable stacked deck, cards peek bottom-right */
  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 12px 30px 42px 0;
    touch-action: pan-y;
  }
`;

export const SkillCard = styled.div`
  ${cardBase}
  padding: 26px;

  h3 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    margin-bottom: 16px;
    color: var(--text);
  }

  @media (max-width: 820px) {
    grid-area: 1 / 1;
    user-select: none;
    -webkit-user-select: none;
    cursor: grab;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
    will-change: transform;

    &:active {
      cursor: grabbing;
    }
  }
`;

export const SoftMarquee = styled.div`
  margin-top: 42px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
`;

export const SoftTrack = styled.div`
  display: flex;
  width: max-content;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.87rem;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  animation: ${marquee} 28s linear infinite;

  span {
    margin-right: 34px;
  }

  ${SoftMarquee}:hover & {
    animation-play-state: paused;
  }
`;

export const SoftStar = styled.span`
  color: var(--violet);
`;

/* ============================================================
   Experience timeline
   ============================================================ */

export const Timeline = styled.div`
  position: relative;
  padding-left: 34px;

  @media (max-width: 520px) {
    padding-left: 28px;
  }
`;

export const TlItem = styled.article`
  position: relative;
  margin-bottom: 34px;

  /* line segments run dot-to-dot only — no overhang past first/last dot */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: -26px;
    top: 33px;
    width: 2px;
    height: calc(100% + 34px);
    background: linear-gradient(180deg, rgba(34, 211, 238, 0.55), rgba(139, 92, 246, 0.55));
    border-radius: 2px;
  }

  @media (max-width: 520px) {
    &:not(:last-child)::after {
      left: -20px;
    }
  }
`;

export const TlDot = styled.div`
  position: absolute;
  left: -34px;
  top: 26px;
  width: 14px;
  height: 14px;
  margin-left: 2px;
  border-radius: 50%;
  background: var(--violet);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2), 0 0 16px rgba(139, 92, 246, 0.7);
  z-index: 1;

  ${({ $pulse }) => $pulse && css`
    &::after {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid rgba(34, 211, 238, 0.6);
      animation: ${dotPulse} 2s ease-out infinite;
    }
  `}

  @media (max-width: 520px) {
    left: -28px;
  }
`;

export const TlCard = styled.div`
  ${cardBase}
  padding: 28px 30px;

  ul {
    list-style: none;
    margin-bottom: 16px;
  }

  li {
    color: var(--text-dim);
    font-size: 0.96rem;
    padding-left: 22px;
    position: relative;
    margin-bottom: 8px;

    &::before {
      content: '▹';
      position: absolute;
      left: 0;
      color: var(--cyan);
    }
  }

  strong {
    color: var(--text);
  }

  @media (max-width: 520px) {
    padding: 22px;
  }
`;

export const TlHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;

  h3 {
    font-family: var(--font-display);
    font-size: 1.25rem;
  }
`;

export const TlWhen = styled.span`
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--cyan);
  white-space: nowrap;
`;

export const TlOrg = styled.p`
  color: var(--magenta);
  font-size: 0.92rem;
  font-weight: 500;
  margin: 4px 0 14px;
`;

/* ============================================================
   Projects — code window & slider first (referenced by ProjectCard)
   ============================================================ */

export const CodeWindow = styled.div`
  background: rgba(10, 13, 32, 0.85);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(4, 6, 20, 0.7);
  backdrop-filter: blur(10px);
`;

export const CodeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px 16px;
  background: rgba(23, 29, 62, 0.8);
  border-bottom: 1px solid var(--card-border);
`;

export const WinDot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: ${({ $c }) => ($c === 'r' ? '#f87171' : $c === 'y' ? '#fbbf24' : '#34d399')};
`;

export const CodeFile = styled.span`
  margin-left: 10px;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  color: var(--text-dim);
`;

/* window height follows the active slide so screenshots show uncropped */
export const Slider = styled.div`
  overflow: hidden;
  transition: height 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const Slides = styled.div`
  display: flex;
  align-items: flex-start;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
`;

export const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 100%;
`;

export const SlideShot = styled(Slide)`
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const CodePre = styled.pre`
  padding: 20px 22px;
  overflow-x: auto;
  font-size: 0.8rem;
  line-height: 1.7;

  code {
    font-family: var(--font-mono);
    color: #dbe2ff;
  }

  @media (max-width: 520px) {
    font-size: 0.72rem;
    padding: 16px;
  }
`;

/* syntax-highlight tokens for the code snippets */
export const Tok = {
  C: styled.span`color: #6b7499; font-style: italic;`, /* comment  */
  T: styled.span`color: #f472b6;`,                     /* tag/selector */
  A: styled.span`color: #a5b4fc;`,                     /* attribute/property */
  S: styled.span`color: #86efac;`,                     /* string/value */
  K: styled.span`color: #c084fc;`,                     /* keyword */
  F: styled.span`color: #67e8f9;`,                     /* function */
};

export const SlideControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px;
  border-top: 1px solid var(--card-border);
  background: rgba(23, 29, 62, 0.7);
`;

export const SlideArrow = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid rgba(139, 148, 255, 0.3);
  background: none;
  color: var(--text-dim);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: color 0.25s, border-color 0.25s;

  &:hover {
    color: var(--cyan);
    border-color: var(--cyan);
  }
`;

export const SlideDot = styled.button`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s;
  background: ${({ $active }) => ($active ? 'var(--cyan)' : 'rgba(139, 148, 255, 0.25)')};
  box-shadow: ${({ $active }) => ($active ? '0 0 10px rgba(34, 211, 238, 0.7)' : 'none')};
`;

export const ProjectInfo = styled.div`
  h3 {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 3vw, 1.6rem);
    letter-spacing: -0.01em;
    margin-bottom: 12px;
  }

  > p {
    color: var(--text-dim);
    margin-bottom: 14px;
  }
`;

export const ProjectPoints = styled.ul`
  list-style: none;
  margin-bottom: 16px;

  li {
    color: var(--text-dim);
    font-size: 0.93rem;
    padding-left: 22px;
    position: relative;
    margin-bottom: 6px;

    &::before {
      content: '▹';
      position: absolute;
      left: 0;
      color: var(--magenta);
    }
  }
`;

export const ProjectLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
  margin-top: 18px;
`;

export const RepoLink = styled.a`
  display: inline-block;
  color: var(--cyan);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;

  span {
    display: inline-block;
    transition: transform 0.25s ease;
  }

  &:hover span {
    transform: translateX(6px);
  }
`;

export const ProjectsWrap = styled.div`
  display: grid;
  gap: 44px;
`;

/* soft translucent panel groups each snippet with the project it belongs to */
export const ProjectCard = styled.article`
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 40px;
  align-items: center;
  background: rgba(20, 26, 56, 0.32);
  border: 1px solid rgba(139, 148, 255, 0.10);
  border-radius: 22px;
  padding: 32px;
  backdrop-filter: blur(6px);

  &:nth-child(even) ${ProjectInfo} { order: 2; }
  &:nth-child(even) ${CodeWindow} { order: 1; }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 26px;

    &:nth-child(even) ${ProjectInfo} { order: 1; }
    &:nth-child(even) ${CodeWindow} { order: 2; }
  }

  @media (max-width: 520px) {
    padding: 20px;
  }
`;

/* ============================================================
   Education
   ============================================================ */

export const EduGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const EduCard = styled.div`
  ${cardBase}
  padding: 26px;
  position: relative;

  h3 {
    font-family: var(--font-display);
    font-size: 1.05rem;
    margin-bottom: 6px;
  }
`;

export const EduWhen = styled.p`
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--cyan);
  margin-bottom: 10px;
`;

export const EduWhat = styled.span`
  display: block;
  color: var(--text-dim);
  font-size: 0.9rem;
`;

export const EduWhere = styled.p`
  color: var(--text-dim);
  font-size: 0.82rem;
  opacity: 0.8;
  margin-bottom: 14px;
`;

export const EduScore = styled.span`
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.3);
  color: var(--cyan);
`;

export const EduRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  ${EduWhat} {
    font-size: 0.88rem;
  }
`;

/* ============================================================
   Footer
   ============================================================ */

export const FooterWrap = styled.footer`
  text-align: center;
  padding: 130px 24px 50px;
  max-width: 800px;
  margin: 0 auto;
`;

export const FooterTitle = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 5.5vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const FooterSub = styled.p`
  color: var(--text-dim);
  margin: 16px 0 32px;
`;

export const MailBtn = styled.a`
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.92rem;
  color: var(--text);
  text-decoration: none;
  padding: 11px 22px;
  border: 1px solid rgba(139, 148, 255, 0.35);
  border-radius: 10px;
  background: rgba(23, 29, 62, 0.5);
  transition: border-color 0.25s, box-shadow 0.25s;

  &:hover {
    border-color: var(--cyan);
    box-shadow: 0 0 16px rgba(34, 211, 238, 0.25);
  }
`;

export const FooterMeta = styled.p`
  color: var(--text-dim);
  font-size: 0.88rem;
  margin-top: 22px;
`;

export const Socials = styled.div`
  display: flex;
  justify-content: center;
  gap: 26px;
  margin-top: 42px;

  @media (max-width: 520px) {
    gap: 18px;
  }
`;

export const SocialLink = styled.a`
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1.5px solid rgba(139, 148, 255, 0.35);
  color: var(--text-dim);
  transition: color 0.3s, border-color 0.3s, box-shadow 0.3s;
  will-change: transform;

  svg {
    width: 26px;
    height: 26px;
  }

  &:hover {
    color: var(--cyan);
    border-color: var(--cyan);
    box-shadow: 0 0 28px rgba(34, 211, 238, 0.4), inset 0 0 18px rgba(34, 211, 238, 0.08);
  }

  @media (max-width: 520px) {
    width: 56px;
    height: 56px;
  }
`;

export const Copyright = styled.p`
  margin-top: 60px;
  font-size: 0.8rem;
  color: var(--text-dim);
  opacity: 0.7;
`;

/* ============================================================
   Global: theme vars, reset, and the cross-cutting utility
   classes that JS hooks toggle at runtime
   ============================================================ */

export const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #0d1026;            /* deep space navy — dark, not black */
    --bg-soft: #141a38;
    --card: rgba(23, 29, 62, 0.65);
    --card-border: rgba(139, 148, 255, 0.14);
    --text: #e8eaf6;
    --text-dim: #9aa3c7;
    --violet: #8b5cf6;
    --magenta: #d946ef;
    --cyan: #22d3ee;
    --star: #cdd6ff;
    --grad: linear-gradient(120deg, var(--cyan), var(--violet) 50%, var(--magenta));
    --radius: 18px;
    --nav-h: 72px;
    --font-display: 'Sora', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: calc(var(--nav-h) + 16px);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    line-height: 1.65;
    overflow-x: hidden;
  }

  ::selection { background: var(--violet); color: #fff; }

  main, header, footer { position: relative; z-index: 2; }

  body.has-cursor,
  body.has-cursor a,
  body.has-cursor button { cursor: none; }

  @media (hover: none), (pointer: coarse) {
    ${CursorDot}, ${CursorRing} { display: none; }
  }

  /* toggled by the tilt hook via element.style — hover shadow + spotlight */
  .tilt {
    transform-style: preserve-3d;
    will-change: transform;
    transition: box-shadow 0.35s ease;
  }
  .tilt:hover {
    box-shadow: 0 18px 50px rgba(5, 8, 25, 0.65), 0 0 30px rgba(139, 92, 246, 0.12);
  }

  .spotlight { position: relative; overflow: hidden; }
  .spotlight::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%),
                rgba(139, 92, 246, 0.16), transparent 65%);
    opacity: 0;
    transition: opacity 0.35s ease;
    pointer-events: none;
  }
  .spotlight:hover::before { opacity: 1; }

  /* toggled by the reveal hook's IntersectionObserver */
  .reveal {
    opacity: 0;
    transform: translateY(34px);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .reveal.visible { opacity: 1; transform: none; }

  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    ${Blob} { animation: none; }
    ${Caret}, ${Chev} { animation: none; }
    ${SoftTrack} {
      animation: none;
      flex-wrap: wrap;
      white-space: normal;
      width: auto;
      justify-content: center;
    }
    .reveal { opacity: 1; transform: none; transition: none; }
    * { transition-duration: 0.01ms !important; }
  }
`;
