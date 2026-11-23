import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence, LayoutGroup, MotionConfig, animate, motion,
  useAnimationFrame, useInView, useMotionValue, useMotionValueEvent, useReducedMotion,
  useScroll, useSpring, useTransform, useVelocity,
} from "motion/react";
import { categories, featured, projects, results, snaps, tools } from "./data.js";
import { redact, scan } from "./scan.js";

const EASE = [0.2, 0.7, 0.1, 1];
const CURTAIN = [0.76, 0, 0.24, 1];
const NAV = [["work", "work"], ["results", "results"], ["projects", "projects"], ["playground", "try it"], ["about", "about"], ["contact", "contact"]];

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
        <nav aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>
              {active === id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="nav-text">{label}</span>
            </a>
          ))}
        </nav>
        <span className="clock" title="My local time in Bengaluru"><i aria-hidden="true" />BLR <time>{time}</time></span>
      </header>
    </>
  );
}

/* ── hero ──────────────────────────────────────────────────── */

const HEADLINE = ["I build AI tools,", "then spend weeks", "trying to "];
const HERO_PICS = [
  { img: "assets/shots/securegent-2.webp", note: "securegent saying no", tilt: -6, speed: -260, cls: "hp-1" },
  { img: "assets/shots/aadhaarguard-1.webp", note: "aadhaarguard at work", tilt: 5, speed: -140, cls: "hp-2" },
  { img: "assets/shots/pypi-securegent.webp", note: "on pypi!!", tilt: -2, speed: -360, cls: "hp-3" },
];

function HeroPic({ pic, i, progress, ready }) {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : pic.speed]);
  const rotate = useTransform(progress, [0, 1], [pic.tilt, pic.tilt + (reduce ? 0 : (i % 2 ? 8 : -8))]);
  return (
    <motion.div className={`hero-pic ${pic.cls}`} style={{ y, rotate }}>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.85, rotate: i % 2 ? 14 : -14 }}
        animate={ready ? { opacity: 1, y: 0, scale: 1, rotate: 0 } : {}}
        transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.55 + i * 0.14 }}
        whileHover={{ scale: 1.05, rotate: i % 2 ? -3 : 3, zIndex: 5 }}>
        <Polaroid img={pic.img} note={pic.note} />
      </motion.div>
    </motion.div>
  );
}

function Hero({ ready }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const go = ready ? "show" : "hide";

  const counts = [
    [projects.length, "projects below"],
    [2, "packages on PyPI"],
    ["14/14", "red-team attacks blocked"],
    [1, "Linux kernel module"],
  ];

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-copy" style={{ y: drift }}>
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
        <motion.p className="margin-note" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.6 }}>
          <svg viewBox="0 0 60 40" aria-hidden="true"><path d="M56 6 C 40 4, 22 10, 12 28 M4 20 L 12 30 L 22 22" /></svg>
          (mostly my own tools)
        </motion.p>

        <div className="hero-foot">
          <motion.p className="intro" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}>
            Computer science student at PES University, Bengaluru. I like problems where a
            mistake costs something real, so I build carefully, publish the code, and then
            write the tests that try to prove me wrong. Security, machine learning and
            low-level systems, mostly.
          </motion.p>
          <motion.dl className="counts" initial="h" animate={ready ? "s" : "h"}
            variants={{ s: { transition: { staggerChildren: 0.08, delayChildren: 0.8 } } }}>
            {counts.map(([n, what]) => (
              <motion.div key={what} variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
                <dt>{n}</dt><dd>{what}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </motion.div>

      <div className="hero-pics" aria-hidden="true">
        {HERO_PICS.map((pic, i) => <HeroPic key={pic.cls} pic={pic} i={i} progress={scrollYProgress} ready={ready} />)}
      </div>

      <motion.a className="scroll-hint" href="#desk" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 1.8, duration: 0.8 }}>
        <motion.svg viewBox="0 0 60 70" aria-hidden="true" animate={reduce ? {} : { y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <path d="M8 6 C 30 8, 48 22, 40 44 C 37 52, 32 58, 28 63 M18 56 L 28 64 L 34 52" />
        </motion.svg>
        <span>scroll, things move</span>
      </motion.a>
    </section>
  );
}

/* ── marquee that speeds up with your scroll ───────────────── */

function Marquee({ words, tilt = -1.5, flip = false }) {
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

  const row = words.map(w => <span key={w}>{w}<i aria-hidden="true">✺</i></span>);
  return (
    <div className={`marquee${flip ? " alt" : ""}`} style={{ "--tilt": `${tilt}deg` }} aria-hidden="true">
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

/* ── results: numbers that count up when they arrive ─────── */

function Count({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const m = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  const [pre, num, post] = m ? [m[1], m[2], m[3]] : ["", null, value];
  const dec = num && num.includes(".") ? num.split(".")[1].length : 0;
  const [shown, setShown] = useState(num ? (0).toFixed(dec) : "");
  useEffect(() => {
    if (!num || !inView) return;
    if (reduce) { setShown(num); return; }
    const run = animate(0, parseFloat(num), { duration: 1.5, ease: EASE, onUpdate: v => setShown(v.toFixed(dec)) });
    return () => run.stop();
  }, [inView, num, dec, reduce]);
  return <span ref={ref} aria-label={value}>{pre}{shown}{post}</span>;
}

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
            <span className="res-n"><Count value={r.n} /></span>
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
            I'm a B.Tech CSE student at PES University. I started out building ML projects for healthcare and accessibility, and drifted into
            security once I noticed most of those systems would happily leak what they were meant
            to protect. These days I write tools for that, publish them, and then write the test
            that tries to break them.
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

const EMAIL = "pratikpatil1008p@gmail.com";

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
      <Reveal as="ul" className="elsewhere" delay={0.15}>
        <li><a href="https://www.linkedin.com/in/pratikpatil2105/" target="_blank" rel="noreferrer">LinkedIn &#8599;</a></li>
        <li><a href="https://github.com/Pratix005" target="_blank" rel="noreferrer">GitHub &#8599;</a></li>
      </Reveal>
    </section>
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
        <Marquee words={["security for AI agents", "Indian PII", "machine learning", "systems in C", "web apps", "breaking my own code"]} />
        <Desk />
        <Featured />
        <Results />
        <Projects />
        <Marquee words={["test against the real thing", "ship it", "then break it", "write it down"]} tilt={1.2} flip />
        <Playground />
        <About />
        <Contact />
      </main>
      <footer className="foot">
        <p>&copy; 2026 Pratik Patil &middot; Bengaluru</p>
        <a href="#top">back to top &uarr;</a>
      </footer>
    </MotionConfig>
  );
}
