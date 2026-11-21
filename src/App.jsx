import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence, LayoutGroup, MotionConfig, motion,
  useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import { categories, featured, log, projects, tools } from "./data.js";
import { redact, scan } from "./scan.js";

const EASE = [0.2, 0.7, 0.1, 1];
const NAV = [["work", "work"], ["projects", "projects"], ["playground", "try it"], ["about", "about"], ["contact", "contact"]];

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

function Label({ n, children }) {
  return <Reveal as="p" className="label">{n} <span>/ {children}</span></Reveal>;
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

/* ── header ────────────────────────────────────────────────── */

function Header() {
  const { scrollY, scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.3 });
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [time, setTime] = useState("--:--");
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

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

  const flip = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    setTheme(next);
  };

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
        <div className="top-right">
          <span className="clock" title="My local time in Bengaluru">BLR <time>{time}</time></span>
          <button className="theme" type="button" onClick={flip} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            <motion.span className="theme-dot" animate={{ rotate: theme === "dark" ? 180 : 0 }} transition={{ duration: 0.5, ease: EASE }} />
          </button>
        </div>
      </header>
    </>
  );
}

/* ── hero ──────────────────────────────────────────────────── */

const HEADLINE = ["I build AI tools,", "then spend weeks", "trying to "];

function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  const counts = [
    [projects.length, "projects below"],
    [2, "packages on PyPI"],
    [1, "Linux kernel module"],
    [2, "live web apps"],
  ];

  return (
    <section className="hero" ref={ref}>
      <motion.div style={{ y: drift, opacity: fade }}>
        <motion.p className="hello" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          Hi, I'm Pratik.
        </motion.p>
        <h1 className="headline">
          {HEADLINE.map((line, i) => (
            <span className="line" key={i}>
              <motion.span
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.09 }}
              >
                {line}
                {i === 2 && (
                  <em className="scribble">break them.
                    <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                      <motion.path
                        d="M3 15 C 40 6, 80 20, 120 12 S 200 4, 240 13 S 285 18, 297 9"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.9, ease: "easeInOut", delay: 1.05 }}
                      />
                    </svg>
                  </em>
                )}
              </motion.span>
            </span>
          ))}
        </h1>
      </motion.div>

      <div className="hero-foot">
        <motion.p className="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}>
          Computer science student at PES University, Bengaluru, and an intern at PESU Research
          Foundation. Right now: security tooling for AI agents and for Indian personal data.
          Before that, sign language recognition, drug&ndash;gene risk models, a container
          runtime in C, and the usual pile of web apps.
        </motion.p>
        <motion.dl className="counts" initial="h" animate="s"
          variants={{ s: { transition: { staggerChildren: 0.07, delayChildren: 0.75 } } }}>
          {counts.map(([n, what]) => (
            <motion.div key={what} variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
              <dt>{n}</dt><dd>{what}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>

      <motion.a className="scroll-hint" href="#work" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.8 }}>
        <svg viewBox="0 0 60 70" aria-hidden="true"><path d="M8 6 C 30 8, 48 22, 40 44 C 37 52, 32 58, 28 63 M18 56 L 28 64 L 34 52" /></svg>
        <span>start with the two I'm proudest of</span>
      </motion.a>
    </section>
  );
}

/* ── featured: sticky stacked case studies ─────────────────── */

function CaseCard({ p, i, total, progress }) {
  const reduce = useReducedMotion();
  const start = i / total;
  const scale = useTransform(progress, [start, 1], [1, reduce ? 1 : 1 - (total - 1 - i) * 0.05]);
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
        <figure className="case-media">
          <div className="window">
            <div className="window-bar" aria-hidden="true"><i /><i /><i /><span>{p.id}</span></div>
            <img src={p.media.src} alt={p.media.alt} width={p.media.w} height={p.media.h} loading="lazy" />
          </div>
          <figcaption>{p.media.caption}</figcaption>
        </figure>
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

/* ── all projects: filterable index with a cursor preview ──── */

function Preview({ project, x, y }) {
  return (
    <motion.div className="peek" style={{ x, y }} aria-hidden="true"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.18 }}>
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
      <Label n="02">everything I've built</Label>
      <div className="projects-head">
        <Reveal as="h2" className="chapter-title">All {projects.length} projects, <em>coursework included.</em></Reveal>
        <Reveal as="p" className="aside" delay={0.1}>Click a row for the details. The two above are first; the rest are newest first, roughly.</Reveal>
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
    parts.push(<motion.mark key={`${f.start}-${style}`} initial={{ backgroundColor: "var(--signal)" }} animate={{ backgroundColor: "var(--signal-soft)" }} transition={{ duration: 0.6, delay: i * 0.04 }}>{redact(f, style)}</motion.mark>);
    pos = f.end;
  });
  parts.push(text.slice(pos, 20000));

  return (
    <section className="chapter" id="playground">
      <Label n="03">try it</Label>
      <div className="try-head">
        <Reveal as="h2" className="chapter-title">Paste something<br />you shouldn't paste.</Reveal>
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

/* ── log ───────────────────────────────────────────────────── */

function Log() {
  return (
    <section className="chapter" id="log">
      <Label n="04">things that broke</Label>
      <Reveal as="h2" className="chapter-title">A short log of mistakes,<br /><em>mostly mine.</em></Reveal>
      <ol className="log">
        {log.map(([when, title, body], i) => (
          <Reveal as="li" key={title} delay={Math.min(i, 3) * 0.05}>
            <time>{when}</time>
            <div><h4>{title}</h4><p>{body}</p></div>
          </Reveal>
        ))}
      </ol>
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
          <p className="big">I like problems where being wrong is expensive: health data, money, personal IDs, AI that can take actions.</p>
          <p>
            I'm a B.Tech CSE student at PES University and an intern at PESU Research Foundation.
            I started out building ML projects for healthcare and accessibility, and drifted into
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
      </Reveal>
      <Reveal as="ul" className="elsewhere" delay={0.15}>
        <li><a href="https://www.linkedin.com/in/pratikpatil2105/" target="_blank" rel="noreferrer">LinkedIn &#8599;</a></li>
        <li><a href="https://github.com/Pratix005" target="_blank" rel="noreferrer">GitHub &#8599;</a></li>
      </Reveal>
    </section>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main id="top">
        <Hero />
        <Featured />
        <Projects />
        <Playground />
        <Log />
        <About />
        <Contact />
      </main>
      <footer className="foot">
        <p>&copy; 2026 Pratik Patil &middot; Bengaluru</p>
        <p>React and Framer Motion. Set in Recursive &amp; Newsreader. No tracking.</p>
        <a href="#top">back to top &uarr;</a>
      </footer>
    </MotionConfig>
  );
}
