import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence, LayoutGroup, MotionConfig, animate, motion,
  useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion,
  useScroll, useSpring, useTransform, useVelocity,
} from "motion/react";
import { areas, categories, covers, featured, projects, results, snaps, tools } from "./data.js";
import { redact, scan } from "./scan.js";

const EASE = [0.2, 0.7, 0.1, 1];
const CURTAIN = [0.76, 0, 0.24, 1];
const NAV = [["work", "work"], ["results", "results"], ["projects", "projects"], ["playground", "try it"], ["about", "about"]];
const EMAIL = "pratikpatil1008p@gmail.com";
const LINKS = [
  ["LinkedIn", "https://www.linkedin.com/in/pratikpatil2105/"],
  ["GitHub", "https://github.com/Pratix005"],
  ["PyPI", "https://pypi.org/project/securegent/"],
  ["Email", `mailto:${EMAIL}`],
];

/* ── small helpers ─────────────────────────────────────────── */

function Reveal({ children, delay = 0, as = "div", className, y = 22 }) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/* a section label that looks jotted in the margin */
function Label({ n, children }) {
  return (
    <Reveal as="p" className="label">
      <span className="label-n">{n}</span>
      <span className="label-t">{children}
        <svg viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
          <motion.path d="M2 6 C 20 2, 35 9, 55 5 S 95 2, 118 6"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeInOut", delay: 0.25 }} />
        </svg>
      </span>
    </Reveal>
  );
}

function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(pointer: fine)");
    const set = () => setFine(mq.matches);
    set(); mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return fine;
}

const wrap = (min, max, v) => { const r = max - min; return ((((v - min) % r) + r) % r) + min; };

/* numbers that roll into place like an odometer */
function Roll({ value, go = true, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const run = inView && go;
  let d = 0;
  return (
    <span ref={ref} className="roll" aria-label={value}>
      {[...value].map((ch, i) => {
        if (!/\d/.test(ch)) return <span key={i} aria-hidden="true">{ch === " " ? " " : ch}</span>;
        const at = `-${((10 + +ch) / 20) * 100}%`;
        const wait = delay + d++ * 0.09;
        return (
          <span className="roll-col" key={i} aria-hidden="true">
            <motion.span className="roll-strip"
              initial={{ y: reduce ? at : "0%" }}
              animate={run ? { y: at } : {}}
              transition={{ duration: 1.6, ease: [0.3, 0, 0.1, 1], delay: wait }}>
              {"01234567890123456789".split("").map((n, k) => <span key={k}>{n}</span>)}
            </motion.span>
            <span className="roll-ghost">{ch}</span>
          </span>
        );
      })}
    </span>
  );
}

/* a taped-down photo; `term` renders real terminal lines instead of an image */
function Polaroid({ img, term, note, className = "" }) {
  return (
    <figure className={`polaroid ${className}`}>
      <span className="tape" aria-hidden="true" />
      <div className="polaroid-pic">
        {img ? <img src={img} alt="" loading="lazy" draggable="false" /> : <pre>{term.join("\n")}</pre>}
      </div>
      <figcaption>{note}</figcaption>
    </figure>
  );
}

/* ── project covers (drawn, not photographed) ──────────────── */

function CoverArt({ kind }) {
  switch (kind) {
    case "pulse": return <svg viewBox="0 0 100 50"><path className="o" d="M0 30 H28 L34 14 L42 44 L50 6 L58 38 L63 30 H100" /></svg>;
    case "mask": return <p className="cv-mono">Aadhaar<br /><mark>XXXX XXXX</mark> 8697<br />PAN <mark>XXXXX</mark>234F</p>;
    case "hand": return (
      <svg viewBox="0 0 100 70">
        <circle className="w" cx="50" cy="58" r="9" />
        {[[22, 30], [34, 12], [50, 6], [66, 12], [80, 34]].map(([x, y], i) => (
          <g key={i}><path className="w" d={`M50 58 L${(50 + x) / 2} ${(58 + y) / 2 + 4} L${x} ${y}`} /><circle className="wf" cx={x} cy={y} r="3.2" /><circle className="wf" cx={(50 + x) / 2} cy={(58 + y) / 2 + 4} r="2.4" /></g>
        ))}
      </svg>);
    case "boxes": return <svg viewBox="0 0 100 60"><rect className="o" x="8" y="6" width="84" height="48" rx="4" /><rect className="w" x="20" y="16" width="34" height="28" rx="3" /><rect className="w" x="60" y="16" width="22" height="28" rx="3" /><path className="o" d="M64 26 l14 12 M78 26 l-14 12" /></svg>;
    case "pills": return <p className="cv-pills"><span>Safe</span><span>Risk</span><span className="hot">High-Risk</span></p>;
    case "lights": return <svg viewBox="0 0 100 70"><rect className="w" x="36" y="2" width="28" height="66" rx="14" /><circle className="wf" cx="50" cy="16" r="7" /><circle className="wf dim" cx="50" cy="35" r="7" /><circle className="wf dim" cx="50" cy="54" r="7" /></svg>;
    case "km": return <svg viewBox="0 0 100 60"><path className="i" d="M4 4 V56 H96" /><path className="o" d="M6 8 H22 V16 H38 V24 H50 V36 H70 V42 H94" /><path className="i dash" d="M6 8 H16 V22 H30 V36 H44 V48 H94" /></svg>;
    case "topo": return <svg viewBox="0 0 100 60"><path className="w" d="M14 14 L32 30 L14 46 M32 30 H50 H68 L86 14 M68 30 L86 46" /><circle className="of" cx="32" cy="30" r="6" /><circle className="of" cx="50" cy="30" r="6" /><circle className="of" cx="68" cy="30" r="6" />{[[14, 14], [14, 46], [86, 14], [86, 46]].map(([x, y]) => <circle key={x + y} className="wf" cx={x} cy={y} r="4" />)}</svg>;
    case "pip": return <p className="cv-mono">$ pip install<br />&nbsp;&nbsp;securegent<br />$ pip install<br />&nbsp;&nbsp;aadhaarguard</p>;
    case "scribble": return <svg viewBox="0 0 100 50"><path className="o thick" d="M6 30 C 20 10, 30 44, 46 24 S 70 8, 78 28 S 90 40, 96 18" /></svg>;
    case "shield": return <svg viewBox="0 0 100 60"><path className="o" d="M50 4 L74 12 V30 C74 44 62 52 50 56 C38 52 26 44 26 30 V12 Z" /><path className="w" d="M40 30 l7 7 l14 -14" /></svg>;
    case "sun": return <svg viewBox="0 0 100 60"><circle className="of" cx="50" cy="40" r="18" /><path className="i" d="M4 44 H96 M10 52 H90" /></svg>;
    default: return null;
  }
}

function Cover({ c }) {
  return (
    <div className={`cover cv-${c.theme}`}>
      <span className="cv-kicker">{c.kicker}</span>
      <div className="cv-art"><CoverArt kind={c.art} /></div>
      <strong className="cv-name">{c.name}</strong>
    </div>
  );
}

/* ── loading screen ────────────────────────────────────────── */

const LOADING = ["sharpening pencils", "making chai", "breaking things on purpose", "okay, ready"];

function Loader({ onDone }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const run = animate(0, 100, {
      duration: reduce ? 0.35 : 2.2,
      ease: [0.6, 0, 0.3, 1],
      onUpdate: v => setN(Math.round(v)),
      onComplete: () => setTimeout(() => { root.style.overflow = ""; onDone(); }, reduce ? 0 : 380),
    });
    return () => { run.stop(); root.style.overflow = ""; };
  }, [reduce, onDone]);

  const line = LOADING[Math.min(LOADING.length - 1, Math.floor(n / (101 / LOADING.length)))];

  return (
    <motion.div className="loader" role="status" aria-label="Loading"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{ duration: 0.95, ease: CURTAIN }}>
      <div className="loader-mark">
        <span className="loader-clip">
          <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}>
            pratik<b>.</b>
          </motion.span>
        </span>
        <svg viewBox="0 0 340 150" aria-hidden="true">
          <motion.path
            d="M70 40 C 120 14, 250 10, 300 42 C 345 72, 300 128, 200 136 C 110 143, 30 122, 26 86 C 22 52, 80 30, 150 24"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 1.5, ease: "easeInOut", delay: 0.35 }} />
        </svg>
      </div>
      <div className="loader-line">
        <AnimatePresence mode="wait">
          <motion.p key={line} initial={{ y: 14, opacity: 0, rotate: -2 }} animate={{ y: 0, opacity: 1, rotate: -2 }}
            exit={{ y: -14, opacity: 0 }} transition={{ duration: 0.22 }}>
            {line}{n < 100 ? "…" : " ✓"}
          </motion.p>
        </AnimatePresence>
      </div>
      <div className="loader-foot">
        <span className="loader-count">{String(n).padStart(3, "0")}</span>
        <div className="loader-bar"><motion.i style={{ scaleX: n / 100 }} /></div>
      </div>
    </motion.div>
  );
}

/* ── dotted paper that drifts a little slower than the page ── */

function Dots() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const y = useTransform(scrollY, v => (reduce ? 0 : -((v * 0.3) % 24)));
  return <motion.div className="dots" style={{ y }} aria-hidden="true" />;
}

/* ── header ────────────────────────────────────────────────── */

function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [time, setTime] = useState("--:--");

  useMotionValueEvent(scrollY, "change", v => setScrolled(v > 8));

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: bar }} aria-hidden="true" />
      <header className={`top${scrolled ? " scrolled" : ""}`}>
        <a className="mark" href="#top" aria-label="Pratik Patil, back to top">pratik<span>.</span></a>
        <nav aria-label="Sections" className="pillnav">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>
              {active === id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="nav-text">{label}</span>
            </a>
          ))}
        </nav>
        <div className="top-right">
          <span className="clock" title="My local time in Bengaluru"><i aria-hidden="true" />BLR <time>{time}</time></span>
          <a className="cta" href="#contact">
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14v10H3z M3 5l7 6 7-6" /></svg>
            Get in touch
          </a>
        </div>
      </header>
    </>
  );
}

/* ── hero: headline, a 3D ring you can spin, stat cards ────── */

const HEADLINE = ["I build AI tools,", "then spend weeks", "trying to "];
const STATS = [[String(projects.length), "projects"], ["2", "packages on PyPI"], ["14/14", "attacks blocked"], ["1", "kernel module"]];

function Ring({ ready }) {
  const reduce = useReducedMotion();
  const stage = useRef(null);
  const [cw, setCw] = useState(200);
  const N = covers.length, step = 360 / N;
  const r = Math.round(cw / 2 / Math.tan(Math.PI / N) + cw * 0.12);

  useEffect(() => {
    const measure = () => setCw(Math.round(Math.min(210, Math.max(112, stage.current.offsetWidth * 0.15))));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage.current);
    return () => ro.disconnect();
  }, []);

  const rot = useMotionValue(0);
  const spin = useRef(-0.012);              // degrees per ms while cruising
  const drag = useRef(null);
  useAnimationFrame((_, d) => {
    if (drag.current || reduce) return;
    spin.current += (-0.012 - spin.current) * Math.min(1, d / 700);
    rot.set(rot.get() + spin.current * d);
  });
  const down = e => { drag.current = { x: e.clientX, t: performance.now(), v: 0 }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = e => {
    const g = drag.current; if (!g) return;
    const now = performance.now(), dx = (e.clientX - g.x) * 0.32;
    rot.set(rot.get() + dx);
    g.v = dx / Math.max(1, now - g.t); g.x = e.clientX; g.t = now;
  };
  const up = () => { if (drag.current) { spin.current = Math.max(-1.2, Math.min(1.2, drag.current.v)); drag.current = null; } };

  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 1], reduce ? [-9, -9] : [-3, -14]);
  const h = Math.round(cw * 4 / 3);
  const room = Math.round(2 * r * Math.sin(15 * Math.PI / 180)) + 90;

  return (
    <motion.div className="ring-stage" ref={stage} style={{ height: h + room }}
      initial={{ opacity: 0, scale: 0.8, y: 60 }} animate={ready ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      aria-label="A ring of project covers. Drag to spin." role="img">
      <motion.div className="ring" style={{ rotateX: tilt, rotateY: rot, width: cw, height: h }}>
        {covers.map((c, i) => (
          <div className="ring-card" key={c.name} style={{ transform: `rotateY(${i * step}deg) translateZ(${r}px)` }}>
            <div className="ring-face"><Cover c={c} /></div>
            <div className="ring-face back"><Cover c={c} /></div>
          </div>
        ))}
      </motion.div>
      <p className="ring-hint" aria-hidden="true">• drag to spin •</p>
    </motion.div>
  );
}

function Hero({ ready }) {
  const go = ready ? "show" : "hide";
  return (
    <section className="hero">
      <div className="hero-top">
        <div>
          <motion.p className="hello" initial={{ opacity: 0, rotate: -4, y: 10 }} animate={ready ? { opacity: 1, rotate: -4, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.1 }}>
            hi, I'm Pratik
            <svg className="wave" viewBox="0 0 40 40" aria-hidden="true">
              <motion.path d="M8 20 C 12 10, 18 30, 22 18 S 30 12, 34 22" initial={{ pathLength: 0 }} animate={ready ? { pathLength: 1 } : {}} transition={{ duration: 0.6, delay: 0.5 }} />
            </svg>
          </motion.p>
          <h1 className="headline">
            {HEADLINE.map((line, i) => (
              <span className="line" key={i}>
                <motion.span
                  initial="hide" animate={go}
                  variants={{ hide: { y: "110%", rotate: 3 }, show: { y: 0, rotate: 0 } }}
                  transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.1 }}
                >
                  {line}
                  {i === 2 && (
                    <em className="scribble">break them.
                      <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                        <motion.path
                          d="M3 15 C 40 6, 80 20, 120 12 S 200 4, 240 13 S 285 18, 297 9"
                          initial={{ pathLength: 0 }} animate={ready ? { pathLength: 1 } : {}}
                          transition={{ duration: 0.9, ease: "easeInOut", delay: 1.1 }}
                        />
                      </svg>
                    </em>
                  )}
                </motion.span>
              </span>
            ))}
          </h1>
        </div>
        <motion.div className="hero-side" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}>
          <p className="intro">
            Computer science student at PES University, Bengaluru. I like problems where a
            mistake costs something real, so I build carefully, publish the code, and then
            write the tests that try to prove me wrong.
          </p>
          <p className="margin-note">
            <svg viewBox="0 0 60 40" aria-hidden="true"><path d="M8 4 C 6 18, 14 30, 34 34 M26 26 L 35 34 L 26 40" /></svg>
            spin the ring, it's my work
          </p>
        </motion.div>
      </div>

      <Ring ready={ready} />

      <ul className="stats">
        {STATS.map(([n, label], i) => (
          <motion.li key={label}
            initial={{ opacity: 0, y: 30 }} animate={ready ? { opacity: 1, y: 0 } : {}}
            whileHover={{ y: -6, rotate: i % 2 ? 1.5 : -1.5 }}
            transition={{ duration: 0.6, ease: EASE, delay: ready ? 0.9 + i * 0.1 : 0 }}>
            <span className="stat-n"><Roll value={n} go={ready} delay={1 + i * 0.1} /></span>
            <span className="stat-l">{label}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/* ── huge faded words that slide with the scroll ───────────── */

function BigWords({ text, from = "8%", to = "-42%" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [from, to]);
  return <div className="bigwords" ref={ref} aria-hidden="true"><motion.p style={{ x }}>{text}</motion.p></div>;
}

/* ── marquee that speeds up with your scroll ───────────────── */

function Marquee({ words, tilt = -1.5, flip = false, className = "" }) {
  const reduce = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(vel, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(base, v => `${wrap(-50, 0, v)}%`);
  const dir = useRef(flip ? -1 : 1);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < 0) dir.current = flip ? 1 : -1; else if (b > 0) dir.current = flip ? -1 : 1;
    let move = dir.current * -1.6 * (delta / 1000);
    move += move * Math.abs(b);
    base.set(base.get() + move);
  });

  const row = words.map(w => <span key={w}>{w}<i aria-hidden="true" className="sep" /></span>);
  return (
    <div className={`marquee ${className}`} style={{ "--tilt": `${tilt}deg` }} aria-hidden="true">
      <motion.div className="marquee-track" style={{ x }}>{row}{row}{row}{row}</motion.div>
    </div>
  );
}

/* ── the desk: a pinned strip of snapshots, scroll moves it sideways ── */

function DeskCard({ s, i, progress }) {
  const reduce = useReducedMotion();
  const amp = reduce ? 0 : 36 + (i % 3) * 16;
  const y = useTransform(progress, [0, 1], i % 2 ? [amp, -amp] : [-amp, amp]);
  const rotate = useTransform(progress, [0, 1], [s.tilt, s.tilt + (reduce ? 0 : (i % 2 ? -4 : 4))]);
  return (
    <motion.div className={`desk-card${s.term ? " is-term" : ""}`} style={{ y, rotate }}
      whileHover={{ scale: 1.04, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 18 } }}>
      <Polaroid img={s.img} term={s.term} note={s.note} />
    </motion.div>
  );
}

function Desk() {
  const ref = useRef(null);
  const track = useRef(null);
  const [dist, setDist] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const x = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.35 });

  useEffect(() => {
    const measure = () => { if (track.current) setDist(Math.max(0, track.current.scrollWidth - window.innerWidth)); };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    addEventListener("resize", measure);
    return () => { ro.disconnect(); removeEventListener("resize", measure); };
  }, []);

  return (
    <section className="desk" id="desk" ref={ref} style={{ height: `calc(100svh + ${dist}px)` }} aria-label="Snapshots from my projects">
      <div className="desk-pin">
        <div className="desk-head">
          <Label n="00">on my desk</Label>
          <Reveal as="h2" className="chapter-title">Screenshots, terminals,<br /><em>proof it actually runs.</em></Reveal>
        </div>
        <motion.div className="desk-track" ref={track} style={{ x }}>
          {snaps.map((s, i) => <DeskCard key={s.note} s={s} i={i} progress={scrollYProgress} />)}
          <p className="desk-end">that's the desk.<br />now the details ↓</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── areas: orange panel, pick a kind of work ──────────────── */

function Areas() {
  const [a, setA] = useState(0);
  const touched = useRef(false);
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px" });
  const reduce = useReducedMotion();
  const area = areas[a];
  const cover = covers.find(c => c.name === area.cover);

  useEffect(() => {
    if (!inView || reduce || touched.current) return;
    const id = setInterval(() => setA(v => (v + 1) % areas.length), 4200);
    return () => clearInterval(id);
  }, [inView, reduce]);

  const pick = i => { touched.current = true; setA(i); };

  return (
    <section className="areas" ref={ref} aria-label="What I build">
      <div className="areas-in">
        <div className="areas-show">
          <AnimatePresence mode="wait">
            <motion.div key={area.id} className="areas-cover"
              initial={{ opacity: 0, rotate: -12, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, rotate: -5, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 8, y: -30, scale: 0.9 }}
              transition={{ duration: 0.5, ease: EASE }}>
              <Cover c={cover} />
            </motion.div>
          </AnimatePresence>
          <span className="areas-caption">{area.caption}</span>
        </div>
        <div className="areas-text">
          <span className="pill-dark">what I build</span>
          <Reveal as="h2" className="areas-title">Three kinds of problems,<br />one habit: <em>test it hard.</em></Reveal>
          <div className="areas-list" role="tablist" aria-label="Areas">
            {areas.map((x, i) => (
              <button key={x.id} role="tab" type="button" aria-selected={i === a} className={i === a ? "on" : ""}
                onClick={() => pick(i)} onPointerEnter={() => pick(i)}>
                {x.name}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={area.id} className="areas-detail" role="tabpanel"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE }}>
              <p>{area.text}</p>
              <dl>
                {area.stats.map(([n, l]) => <div key={l}><dt>{n}</dt><dd>{l}</dd></div>)}
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ── featured: sticky stacked case studies ─────────────────── */

function CaseCard({ p, i, total, progress }) {
  const reduce = useReducedMotion();
  const media = useRef(null);
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, reduce ? 1 : 1 - (total - 1 - i) * 0.05]);
  const { scrollYProgress: mp } = useScroll({ target: media, offset: ["start end", "end start"] });
  const my = useTransform(mp, [0, 1], [reduce ? 0 : 50, reduce ? 0 : -50]);
  const mr = useTransform(mp, [0, 1], [reduce ? 0 : 2.5, reduce ? 0 : -1.5]);
  return (
    <div className="case-slot" style={{ "--i": i }}>
      <motion.article className="case" style={{ scale }}>
        <div className="case-text">
          <p className="case-meta"><span className="case-n">0{i + 1}</span>{p.meta.join(" · ")}</p>
          <h3>{p.name}</h3>
          <p className="case-pitch">{p.pitch}</p>
          <p className="case-body">{p.body}</p>
          <dl className="facts">
            {p.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="links">
            {p.links.map(([t, href]) => <a key={t} href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{t} <span aria-hidden="true">&#8599;</span></a>)}
          </p>
        </div>
        <motion.figure className="case-media" ref={media} style={{ y: my, rotate: mr }}>
          <span className="tape" aria-hidden="true" />
          <div className="window">
            <div className="window-bar" aria-hidden="true"><i /><i /><i /><span>{p.id}</span></div>
            <img src={p.media.src} alt={p.media.alt} width={p.media.w} height={p.media.h} loading="lazy" />
          </div>
          <figcaption>{p.media.caption}</figcaption>
        </motion.figure>
      </motion.article>
    </div>
  );
}

function Featured() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section className="chapter" id="work">
      <Label n="01">selected work</Label>
      <Reveal as="h2" className="chapter-title">Two open-source tools, <em>both on PyPI.</em></Reveal>
      <div className="cases" ref={ref}>
        {featured.map((p, i) => <CaseCard key={p.id} p={p} i={i} total={featured.length} progress={scrollYProgress} />)}
      </div>
    </section>
  );
}

/* ── results ───────────────────────────────────────────────── */

function Results() {
  return (
    <section className="chapter" id="results">
      <Label n="02">results</Label>
      <div className="projects-head">
        <Reveal as="h2" className="chapter-title">What the projects<br /><em>actually did.</em></Reveal>
        <Reveal as="p" className="aside" delay={0.1}>Every number here comes from a repo or a test run you can repeat.</Reveal>
      </div>
      <ul className="results">
        {results.map((r, i) => (
          <motion.li key={r.what}
            initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 0.8 : -0.8 }}
            whileHover={{ y: -8, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 16 } }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.65, ease: EASE, delay: (i % 4) * 0.08 }}>
            <span className="res-n"><Roll value={r.n} delay={(i % 4) * 0.08} /></span>
            <p>{r.what}</p>
            <span className="res-from">{r.from}</span>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/* ── all projects: filterable index with a cursor preview ──── */

function Preview({ project, x, y }) {
  return (
    <motion.div className="peek" style={{ x, y }} aria-hidden="true"
      initial={{ opacity: 0, scale: 0.9, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: -2 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}>
      <div className="peek-bar"><i /><i /><i /><span>{project.id}</span></div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.pre key={project.id}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}>
          {project.peek.join("\n")}
        </motion.pre>
      </AnimatePresence>
    </motion.div>
  );
}

function ProjectRow({ p, n, open, onToggle, onHover }) {
  const catName = categories.find(c => c[0] === p.cat)[1];
  return (
    <motion.li layout="position" className={`row${open ? " open" : ""}`}
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.4, ease: EASE }}
      onPointerEnter={() => onHover(p)} onPointerLeave={() => onHover(null)}>
      <button className="row-head" type="button" aria-expanded={open} aria-controls={`d-${p.id}`} onClick={onToggle}>
        <span className="row-n">{String(n).padStart(2, "0")}</span>
        <span className="row-name">{p.name}</span>
        <span className="row-line">{p.line}</span>
        <span className="row-cat">{catName}</span>
        <span className="row-year">{p.year}</span>
        <motion.span className="row-plus" aria-hidden="true" animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3, ease: EASE }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`d-${p.id}`} className="row-detail"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}>
            <div className="row-detail-in">
              <div>
                <p>{p.detail}</p>
                {p.with && <p className="with">Built with {p.with}.</p>}
                <ul className="stack">{p.stack.map(s => <li key={s}>{s}</li>)}</ul>
              </div>
              <div className="row-side">
                <pre className="row-peek">{p.peek.join("\n")}</pre>
                <p className="links">
                  {p.links.length === 0 && <span className="muted">private repo</span>}
                  {p.links.map(([t, href]) => <a key={t} href={href} target="_blank" rel="noreferrer">{t} <span aria-hidden="true">&#8599;</span></a>)}
                  {p.jump && <a href={p.jump}>case study &darr;</a>}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Projects() {
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(null);
  const [hover, setHover] = useState(null);
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.5 });
  const y = useSpring(my, { stiffness: 260, damping: 26, mass: 0.5 });

  const list = useMemo(() => projects.filter(p => cat === "all" || p.cat === cat), [cat]);
  const count = c => c === "all" ? projects.length : projects.filter(p => p.cat === c).length;

  const shown = useRef(false);
  const move = e => {
    const px = Math.min(e.clientX + 24, innerWidth - 470), py = e.clientY - 40;
    if (!shown.current) { x.jump(px); y.jump(py); shown.current = true; }
    mx.set(px); my.set(py);
  };
  const leave = () => { shown.current = false; };
  const showPeek = fine && !reduce && hover && hover.id !== open;

  return (
    <section className="chapter" id="projects">
      <Label n="03">everything I've built</Label>
      <div className="projects-head">
        <Reveal as="h2" className="chapter-title">All {projects.length} projects, <em>big and small.</em></Reveal>
        <Reveal as="p" className="aside" delay={0.1}>Click a row for the details. The two featured above come first.</Reveal>
      </div>

      <Reveal className="chips" delay={0.05}>
        <LayoutGroup id="chips">
          <div role="tablist" aria-label="Filter projects">
            {categories.map(([id, name]) => (
              <button key={id} role="tab" type="button" aria-selected={cat === id}
                className={cat === id ? "on" : ""} onClick={() => { setCat(id); setOpen(null); }}>
                {cat === id && <motion.span layoutId="chip-pill" className="chip-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="chip-text">{name} <sup>{count(id)}</sup></span>
              </button>
            ))}
          </div>
        </LayoutGroup>
      </Reveal>

      <ol className="rows" onPointerMove={move} onPointerLeave={leave}>
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((p, i) => (
            <ProjectRow key={p.id} p={p} n={i + 1} open={open === p.id}
              onToggle={() => setOpen(open === p.id ? null : p.id)} onHover={setHover} />
          ))}
        </AnimatePresence>
      </ol>

      <AnimatePresence>{showPeek && <Preview project={hover} x={x} y={y} />}</AnimatePresence>
    </section>
  );
}

/* ── playground ────────────────────────────────────────────── */

const SAMPLE = `Hi team, refund for Ravi Kumar.
Aadhaar 3588 1399 8697, PAN ABCPE1234F.
Call him on +91 98765 43210 or pay ravi.kumar@okaxis.
Order #4521, invoice INV-2026-0042, total Rs 2,499.`;

function Playground() {
  const [text, setText] = useState(SAMPLE);
  const [style, setStyle] = useState("partial");
  const hits = useMemo(() => scan(text.slice(0, 20000)), [text]);

  const parts = [];
  let pos = 0;
  hits.forEach((f, i) => {
    parts.push(text.slice(pos, f.start));
    parts.push(<motion.mark key={`${f.start}-${style}`} initial={{ backgroundColor: "#ff5b14" }} animate={{ backgroundColor: "#ffe6d6" }} transition={{ duration: 0.6, delay: i * 0.04 }}>{redact(f, style)}</motion.mark>);
    pos = f.end;
  });
  parts.push(text.slice(pos, 20000));

  return (
    <section className="chapter" id="playground">
      <Label n="04">try it</Label>
      <div className="try-head">
        <Reveal as="h2" className="chapter-title">Paste something<br /><em>you shouldn't paste.</em></Reveal>
        <Reveal as="p" className="aside" delay={0.1}>
          A small JavaScript port of aadhaarguard runs in your browser. Nothing leaves this page,
          and the sample is fake.
        </Reveal>
      </div>
      <Reveal className="lab">
        <div className="lab-in">
          <label htmlFor="lab-input" className="lab-label">input</label>
          <textarea id="lab-input" spellCheck="false" rows={7} value={text} onChange={e => setText(e.target.value)} />
          <div className="lab-styles" role="radiogroup" aria-label="Redaction style">
            {["partial", "tag", "mask"].map(s => (
              <button key={s} type="button" role="radio" aria-checked={style === s} onClick={() => setStyle(s)}>
                {style === s && <motion.span layoutId="style-pill" className="chip-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="chip-text">{s}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="lab-out">
          <p className="lab-label">output <span>/ {hits.length ? `${hits.length} found` : "nothing found"}</span></p>
          <pre aria-live="polite">{parts}</pre>
          <ul className="findings">
            {hits.map(f => <li key={`${f.start}`}><b>{f.kind}</b> {f.why}{f.ctx ? " + keyword" : ""} &middot; {f.conf.toFixed(2)}</li>)}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

/* ── about ─────────────────────────────────────────────────── */

function About() {
  return (
    <section className="chapter about" id="about">
      <Label n="05">about</Label>
      <div className="about-grid">
        <Reveal className="about-text">
          <p className="big">I like problems where being wrong is <em>expensive</em>: health data, money, personal IDs, AI that can take actions.</p>
          <p>
            I'm a B.Tech CSE student at PES University. I started out building ML projects for
            healthcare and accessibility, and drifted into security once I noticed most of those
            systems would happily leak what they were meant to protect. Now I write tools for
            that, publish them, and then write the test that tries to break them.
          </p>
          <p>Coursework counts too: the container runtime came out of operating systems, the SDN controller out of computer networks.</p>
        </Reveal>
        <Reveal as="dl" className="tools" delay={0.1}>
          {tools.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </Reveal>
      </div>
    </section>
  );
}

/* ── contact ───────────────────────────────────────────────── */

function Magnetic({ children, className, ...rest }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18 });
  const y = useSpring(0, { stiffness: 220, damping: 18 });
  const move = e => {
    if (reduce) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  return (
    <motion.a ref={ref} className={className} style={{ x, y }} onPointerMove={move} onPointerLeave={() => { x.set(0); y.set(0); }} {...rest}>
      {children}
    </motion.a>
  );
}

function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(EMAIL); setCopied("copied"); }
    catch (e) { setCopied("select & copy"); }
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <section className="chapter contact" id="contact">
      <Label n="06">contact</Label>
      <Reveal as="h2" className="contact-title">Got an internship, a bug,<br />or a <em>bad idea</em> worth trying?</Reveal>
      <Reveal className="contact-row" delay={0.1}>
        <Magnetic className="email" href={`mailto:${EMAIL}`}>{EMAIL}</Magnetic>
        <button className="copy" type="button" onClick={copy}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={copied || "copy"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.18 }}>
              {copied || "copy"}
            </motion.span>
          </AnimatePresence>
        </button>
        <p className="say-hi" aria-hidden="true">
          <svg viewBox="0 0 70 40"><path d="M66 30 C 50 34, 26 30, 12 14 M6 22 L 11 12 L 22 12" /></svg>
          say hi, I reply
        </p>
      </Reveal>
    </section>
  );
}

/* ── footer: link row, then a dark band with a ribbon ──────── */

const RIBBON = [
  { img: "assets/shots/securegent-2.webp" }, { t: "p.", bg: "#ff5b14" },
  { img: "assets/shots/aadhaarguard-1.webp" }, { t: "py", bg: "#fbf3ea", ink: "#ff5b14" },
  { img: "assets/shots/pypi-securegent.webp" }, { t: "C", bg: "#ffd9c4", ink: "#1d1a17" },
  { img: "assets/shots/securegent-3.webp" }, { t: "AI", bg: "#ff5b14" },
  { img: "assets/shots/pypi-aadhaarguard.webp" }, { t: "14", bg: "#fbf3ea", ink: "#1d1a17" },
];
const RIB_PATH = "M -120 200 C 140 70, 360 270, 620 170 S 1000 40, 1230 170 S 1480 230, 1580 110";

function Footer() {
  const dur = 34;
  return (
    <>
      <ul className="socials">
        {LINKS.map(([name, href]) => (
          <li key={name}>
            <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
              {name} <span aria-hidden="true">&#8599;</span>
            </a>
          </li>
        ))}
      </ul>
      <footer className="foot-dark">
        <svg className="ribbon" viewBox="0 0 1440 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs><clipPath id="rib-clip"><rect x="-31" y="-31" width="62" height="62" rx="7" /></clipPath></defs>
          <path id="rib" d={RIB_PATH} fill="none" stroke="#ff5b14" strokeWidth="58" strokeLinecap="round" />
          {RIBBON.map((c, i) => (
            <g key={i}>
              <g transform="rotate(-8)">
                <rect x="-35" y="-35" width="70" height="70" rx="9" fill={c.img ? "#fff" : c.bg} stroke="#1d1a17" strokeWidth="2" />
                {c.img
                  ? <image href={c.img} x="-31" y="-31" width="62" height="62" preserveAspectRatio="xMinYMin slice" clipPath="url(#rib-clip)" />
                  : <text x="0" y="11" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="30" fill={c.ink || "#fff"}>{c.t}</text>}
              </g>
              <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`-${(i * dur) / RIBBON.length}s`}>
                <mpath href="#rib" />
              </animateMotion>
            </g>
          ))}
        </svg>
        <p className="foot-big"><span>&copy;</span> 2026 Pratik Patil</p>
        <div className="foot-row">
          <p>&copy; 2026 Pratik Patil &middot; Bengaluru</p>
          <nav aria-label="Footer">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            <a href="#contact">contact</a>
          </nav>
          <a href="#top">back to top &uarr;</a>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const done = useMemo(() => () => { setLoading(false); setTimeout(() => setReady(true), 250); }, []);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Loader key="loader" onDone={done} />}</AnimatePresence>
      <Dots />
      <Header />
      <main id="top">
        <Hero ready={ready} />
        <BigWords text="security · machine learning · systems in C · " />
        <Desk />
        <Areas />
        <Featured />
        <Results />
        <div className="cross" aria-hidden="true">
          <Marquee className="alt" words={["write the test first", "then break it", "measure it", "ship it"]} tilt={3} flip />
          <Marquee words={["security for AI agents", "Indian PII", "machine learning", "systems in C", "open source"]} tilt={-2.5} />
        </div>
        <Projects />
        <Playground />
        <About />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
