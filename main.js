(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero entrance: wait for fonts so the headline doesn't reflow mid-animation.
  const start = () => root.classList.add("loaded");
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
  setTimeout(start, 1200);

  /* ── theme ─────────────────────────────────────────────── */
  const themeBtn = document.getElementById("theme");
  const currentTheme = () =>
    root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  themeBtn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  /* ── Bengaluru clock ───────────────────────────────────── */
  const clock = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);

  /* ── header border, progress bar, active nav ───────────── */
  const top = document.querySelector(".top");
  const bar = document.querySelector(".progress");
  const navLinks = [...document.querySelectorAll(".top nav a")];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute("href")));
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    top.classList.toggle("scrolled", y > 8);
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle("active", i === current));
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ── reveal on scroll (with a small stagger per batch) ─── */
  const io = new IntersectionObserver(entries => {
    entries.filter(e => e.isIntersecting).forEach((e, i) => {
      e.target.style.transitionDelay = reduced ? "0s" : `${Math.min(i, 5) * 70}ms`;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));

  /* ── cursor dot (fine pointers only) ───────────────────── */
  const dot = document.querySelector(".cursor");
  if (!reduced && matchMedia("(pointer: fine)").matches) {
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const follow = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      dot.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(follow) : 0;
    };
    addEventListener("pointermove", e => {
      x = e.clientX; y = e.clientY;
      dot.classList.add("on");
      if (!raf) raf = requestAnimationFrame(follow);
    }, { passive: true });
    document.addEventListener("pointerleave", () => dot.classList.remove("on"));
    document.addEventListener("pointerover", e => {
      dot.classList.toggle("big", !!e.target.closest("a, button, .case-media"));
    });
  }

  /* ── copy email ────────────────────────────────────────── */
  document.querySelectorAll("[data-copy]").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "copied";
      } catch (e) {
        btn.textContent = "select & copy";
      }
      btn.classList.add("done");
      setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1800);
    });
  });

  /* ── playground: a small port of aadhaarguard ──────────── */
  const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
  const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
  const digits = s => s.replace(/\D/g, "");
  const verhoeff = n => [...n].reverse().reduce((c, ch, i) => D[c][P[i % 8][+ch]], 0) === 0;
  const luhn = n => [...n].reverse().reduce((s, ch, i) => {
    let d = +ch; if (i % 2) { d *= 2; if (d > 9) d -= 9; } return s + d;
  }, 0) % 10 === 0;
  const B36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const gstinOk = g => {
    g = g.toUpperCase();
    let t = 0;
    for (let i = 0; i < 14; i++) { const p = B36.indexOf(g[i]) * (i % 2 ? 2 : 1); t += Math.floor(p / 36) + (p % 36); }
    return B36[(36 - (t % 36)) % 36] === g[14];
  };
  const repetitive = d => new Set(d).size <= 2;
  const HANDLES = new Set("ybl ibl axl okaxis okhdfcbank okicici oksbi paytm ptyes ptaxis pthdfc ptsbi upi apl yapl axisbank hdfcbank icici sbi kotak kmbl idfcfirst indus federal rbl yesbank pnb boi cnrb ikwik freecharge jupiteraxis slice airtel jio".split(" "));

  const DETECTORS = [
    { kind: "gstin", re: /(?<![A-Za-z0-9])\d{2}[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z][1-9A-Z]Z[0-9A-Z](?![A-Za-z0-9])/g,
      score: v => { const s = +v.slice(0, 2); return ((s >= 1 && s <= 38) || s === 97 || s === 99) && gstinOk(v) ? 0.98 : null; },
      why: "check character ok", ctx: /gst/ },
    { kind: "aadhaar", re: /(?<![\w-])[2-9]\d{3}([ -]?)\d{4}\1\d{4}(?!\w|[ -]\d)/g,
      score: v => { const d = digits(v); return !repetitive(d) && verhoeff(d) ? 0.75 : null; },
      why: "verhoeff ok", ctx: /aadha?ar|adhaar|uid|आधार/ },
    { kind: "card", re: /(?<![\d-])\d(?:[ -]?\d){12,18}(?!\d)/g,
      score: v => { const d = digits(v); return "234568".includes(d[0]) && !repetitive(d) && luhn(d) ? 0.9 : null; },
      why: "luhn ok", ctx: /card|credit|debit|visa|rupay/ },
    { kind: "pan", re: /(?<![A-Za-z0-9])[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z](?![A-Za-z0-9])/g,
      score: () => 0.85, why: "format ok", ctx: /\bpan\b|पैन/ },
    { kind: "phone", re: /(?<![\w+])(?:(?:\+91|0091|91)[ -]?|0)?(?:[6-9]\d{4}[ -]?\d{5}|[6-9]\d{2}[ -]\d{3}[ -]\d{4})(?!\w|[ -]\d)/g,
      score: v => { const d = digits(v); return repetitive(d.slice(-10)) ? null : d.length > 10 ? 0.9 : 0.7; },
      why: "mobile range", ctx: /phone|mobile|call|whatsapp|contact|मोबाइल/ },
    { kind: "upi", re: /(?<![\w.+-])[A-Za-z0-9][A-Za-z0-9._-]{1,254}@[A-Za-z][A-Za-z0-9]{1,63}(?![\w-]|\.[\w-])/g,
      score: v => HANDLES.has(v.split("@").pop().toLowerCase()) ? 0.95 : 0.55,
      why: "upi handle", ctx: /upi|vpa|gpay|phonepe|paytm|pay\b/ },
    { kind: "email", re: /(?<![\w.+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}(?![\w-])/g,
      score: () => 0.9, why: "email", ctx: /mail/ },
    { kind: "ifsc", re: /(?<![A-Za-z0-9])[A-Z]{4}0[A-Z0-9]{6}(?![A-Za-z0-9])/g,
      score: () => 0.7, why: "ifsc format", ctx: /ifsc|branch/ },
  ];

  const scan = text => {
    const found = [];
    DETECTORS.forEach((det, prio) => {
      for (const m of text.matchAll(det.re)) {
        let conf = det.score(m[0]);
        if (conf == null) continue;
        const win = text.slice(Math.max(0, m.index - 40), m.index).toLowerCase();
        const ctx = det.ctx.test(win);
        if (ctx) conf = Math.min(0.99, conf + 0.15);
        found.push({ kind: det.kind, value: m[0], start: m.index, end: m.index + m[0].length, conf, ctx, prio, why: det.why });
      }
    });
    found.sort((a, b) => (b.ctx - a.ctx) || (b.conf - a.conf) || ((b.end - b.start) - (a.end - a.start)) || (a.prio - b.prio));
    const kept = [];
    for (const f of found) if (kept.every(k => f.end <= k.start || f.start >= k.end)) kept.push(f);
    return kept.sort((a, b) => a.start - b.start);
  };

  const partial = (kind, v) => {
    if ((kind === "email" || kind === "upi") && v.includes("@")) {
      const at = v.lastIndexOf("@"); const local = v.slice(0, at);
      return local[0] + "X".repeat(Math.max(local.length - 1, 3)) + v.slice(at);
    }
    const pos = [...v].map((c, i) => (/[A-Za-z0-9]/.test(c) ? i : -1)).filter(i => i >= 0);
    const keep = new Set(pos.length > 4 ? pos.slice(-4) : []);
    if (kind === "phone") pos.slice(0, -10).forEach(i => keep.add(i));
    return [...v].map((c, i) => (/[A-Za-z0-9]/.test(c) && !keep.has(i) ? "X" : c)).join("");
  };
  const replace = (f, style) =>
    style === "tag" ? `[${f.kind.toUpperCase()}]` :
    style === "mask" ? f.value.replace(/[A-Za-z0-9]/g, "X") : partial(f.kind, f.value);

  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const input = document.getElementById("lab-input");
  const output = document.getElementById("lab-output");
  const findings = document.getElementById("lab-findings");
  const count = document.getElementById("lab-count");
  let style = "partial";

  const render = () => {
    const text = input.value.slice(0, 20000);
    const hits = scan(text);
    let html = "", pos = 0;
    hits.forEach(f => {
      html += esc(text.slice(pos, f.start)) + `<mark>${esc(replace(f, style))}</mark>`;
      pos = f.end;
    });
    output.innerHTML = html + esc(text.slice(pos));
    count.textContent = hits.length ? `/ ${hits.length} found` : "/ nothing found";
    findings.innerHTML = hits.map(f =>
      `<li><b>${f.kind}</b> ${f.why}${f.ctx ? " + keyword" : ""} &middot; ${f.conf.toFixed(2)}</li>`).join("");
  };
  let timer;
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(render, 90); });
  document.querySelectorAll(".lab-styles button").forEach(btn => {
    btn.addEventListener("click", () => {
      style = btn.dataset.style;
      document.querySelectorAll(".lab-styles button").forEach(b => b.setAttribute("aria-checked", String(b === btn)));
      render();
    });
  });
  render();
})();
