// Everything on the site lives here. Facts come from each repo's README.

export const GH = "https://github.com/Pratix005";

export const featured = [
  {
    id: "securegent",
    name: "Securegent",
    pitch: "A firewall for AI agents.",
    meta: ["Nov 2026", "solo", "Python", "Apache-2.0"],
    body:
      "An agent that reads your email will, sooner or later, read an email written by an attacker. Securegent assumes the model will get fooled and limits what a fooled agent can do: every tool call is checked against who the agent is, a policy, and where its data came from, and it is logged before it runs.",
    facts: [
      ["14/14", "red-team attacks stopped by the India-finance policy pack, with normal work still allowed"],
      ["~1 ms", "per check. Approvals from a dashboard, Slack or Teams"],
      ["MCP", "proxy tested live against the official filesystem server"],
      ["0.3.0", "on PyPI. The last audit caught my own HTTP client leaking a token on redirects"],
    ],
    links: [
      ["code", `${GH}/Securegent`],
      ["pypi", "https://pypi.org/project/securegent/"],
    ],
    media: { src: "assets/securegent.gif", w: 1200, h: 760,
      alt: "Securegent dashboard: normal tool calls allowed, prompt-injection attempts blocked, a payment waiting for approval",
      caption: "Recorded live: allowed calls, blocked attacks, a payment waiting for a human." },
  },
  {
    id: "aadhaarguard",
    name: "aadhaarguard",
    pitch: "Finds Indian personal data before it ends up in your logs.",
    meta: ["Nov 2026", "solo", "Python", "zero dependencies"],
    body:
      "A regex for “12 digits” flags every order ID you have. aadhaarguard checks the check digits Indian IDs actually carry (Verhoeff for Aadhaar, mod-36 for GSTIN, Luhn for cards) and looks for words like a/c or आधार nearby before it reports anything ambiguous.",
    facts: [
      ["15", "kinds: Aadhaar, PAN, GSTIN, UPI, phone, vehicle plates, bank accounts…"],
      ["87", "tests on Python 3.10–3.14, Linux and Windows"],
      ["4.5×", "faster after the profiler found an O(n²) overlap check"],
      ["0.2.1", "on PyPI. Logging filter, CLI, pre-commit hook"],
    ],
    links: [
      ["code", `${GH}/aadhaarguard`],
      ["pypi", "https://pypi.org/project/aadhaarguard/"],
      ["try it below", "#playground"],
    ],
    media: { src: "assets/aadhaarguard.gif", w: 1000, h: 510,
      alt: "Terminal: aadhaarguard scanning a customer record and redacting Aadhaar, PAN, GSTIN, phone and UPI values",
      caption: "Real CLI output. The order number, date and price are left alone." },
  },
];

export const categories = [
  ["all", "All"],
  ["security", "Security"],
  ["ml", "AI / ML"],
  ["systems", "Systems"],
];

// `peek` is what shows in the hover preview: a few real lines from the project.
export const projects = [
  {
    id: "securegent", cat: "security", year: "2026", name: "Securegent",
    line: "Identity, permissions and audit between an AI agent and its tools.",
    stack: ["Python", "MCP", "Wazuh", "SQLite / Postgres"],
    detail:
      "Policy packs, taint tracking on data an agent has read, an MCP proxy (stdio and HTTP), a red-team suite of 14 attacks, SIEM export and human approvals. Published on PyPI.",
    links: [["code", `${GH}/Securegent`], ["pypi", "https://pypi.org/project/securegent/"]],
    peek: ["$ python -m securegent.redteam", "pack     india-finance", "attacks  14", "blocked  14/14"],
    jump: "#work",
  },
  {
    id: "aadhaarguard", cat: "security", year: "2026", name: "aadhaarguard",
    line: "Finds and redacts 15 kinds of Indian personal data, with checksum validation.",
    stack: ["Python", "no dependencies"],
    detail:
      "Pure-Python library and CLI. Validates Verhoeff, Luhn and GSTIN mod-36 check digits and uses nearby keywords to settle ambiguous matches. CI on Python 3.10–3.14 and Windows.",
    links: [["code", `${GH}/aadhaarguard`], ["pypi", "https://pypi.org/project/aadhaarguard/"]],
    peek: ["Aadhaar 3588 1399 8697", "  → XXXX XXXX 8697   verhoeff ok", "Order #4521", "  → left alone"],
    jump: "#work",
  },
  {
    id: "sign-ai", cat: "ml", year: "2026", name: "SIGN_AI",
    line: "Sign language recognition, translation and practice for the Deaf community.",
    stack: ["React", "TypeScript", "FastAPI", "MediaPipe", "TensorFlow"],
    detail:
      "Real-time gesture recognition from the webcam with MediaPipe hand landmarks and an MLP, sign ↔ text translation, and a learning mode that scores your pose against a reference with DTW. Works for Indian and American sign language.",
    links: [["code", `${GH}/SIGN_AI`]],
    peek: ["hand landmarks   21 × 3", "model            MLP", "practice score   DTW distance", "mode             ISL / ASL"],
  },
  {
    id: "container-runtime", cat: "systems", year: "2026", name: "Mini container runtime",
    line: "Containers from scratch in C, with a kernel module that enforces memory limits.",
    stack: ["C", "Linux kernel module", "pthreads"],
    with: "Reet Anand",
    detail:
      "PID, UTS and mount namespaces with chroot; a supervisor that reaps children on SIGCHLD; a bounded-buffer logging pipeline with mutexes and condition variables; a UNIX-socket CLI. The kernel module checks each container's RSS every second, warns at the soft limit and kills at the hard one.",
    links: [["code", `${GH}/OS-Jackfruit`]],
    peek: ["$ sudo ./engine start memtest --hard-mib 20", "[container_monitor] SOFT LIMIT rss=17297408", "[container_monitor] HARD LIMIT", "memtest   state=killed"],
  },
  {
    id: "medshield", cat: "ml", year: "2026", name: "MedShield AI",
    line: "Predicts drug–gene risk from a patient's genetic profile and suggests safer drugs.",
    stack: ["PyTorch", "RDKit", "Flask"],
    detail:
      "An MLP trained on curated drug–gene interaction data classifies a medication as safe, risk or high-risk for four pharmacogenomic genes, recommends alternatives, and draws the molecule with RDKit.",
    links: [["code", `${GH}/MedShieldAI`]],
    peek: ["input   gene profile + drug", "model   trained_mlp.pth", "output  Safe | Risk | High-Risk", "        + safer alternatives"],
  },
  {
    id: "traffic", cat: "ml", year: "2026", name: "Traffic AI",
    line: "Multi-agent traffic management: predicts congestion and re-times signals.",
    stack: ["OpenCV", "AWS Bedrock", "Lambda", "TomTom API"],
    detail:
      "Agents read live traffic data, predict congestion and re-time signals. Built on AWS. The repo is private, so there's no link.",
    links: [],
    peek: ["in    live traffic + camera feeds", "out   congestion forecast", "      new signal timings"],
  },
  {
    id: "pancreatic", cat: "ml", year: "2026", name: "Pancreatic cancer prognosis",
    line: "Survival analysis on clinical and radiomic features.",
    stack: ["Python", "lifelines", "scikit-learn"],
    with: "Ruhika Kolla",
    detail:
      "Cox proportional-hazards models on clinical, radiomic and combined features, Naive Bayes risk-threshold selection, and SMOTE applied inside the CV folds so it can't leak. The real dataset is under NDA, so the repo ships a synthetic cohort with the same shape.",
    links: [["code", `${GH}/ML_MiniProject_PancreaticCancer`]],
    peek: ["patients   80 (synthetic)", "features   12 clinical + 900 radiomic", "model      Cox PH", "$ python src/demo.py P003"],
  },
  {
    id: "sdn", cat: "systems", year: "2026", name: "SDN static routing",
    line: "A Ryu controller that installs every route the moment a switch connects.",
    stack: ["Python", "Ryu", "OpenFlow 1.3", "Mininet"],
    detail:
      "Proactive flow rules across a three-switch topology, plus a monitor thread that re-installs them every 10 seconds so the paths can't drift.",
    links: [["code", `${GH}/SDN-Static-Routing`]],
    peek: ["h1 ─┐", "     s1 ── s2 ── s3 ─┬─ h3", "h2 ─┘               └─ h4", "flows reinstalled every 10 s"],
  },
];

// Numbers come from each repo (README, results/metrics.json) or from my own runs.
export const results = [
  { n: "14/14", what: "prompt-injection attacks blocked by the India-finance policy pack", from: "Securegent" },
  { n: "~1 ms", what: "to check a tool call against identity, policy and data origin", from: "Securegent" },
  { n: "4.5×", what: "faster scanning after the profiler found an O(n²) overlap check", from: "aadhaarguard" },
  { n: "400/400", what: "random inputs where the browser port matches the Python library", from: "aadhaarguard" },
  { n: "0%", what: "packets dropped across the topology (12/12 pings)", from: "SDN routing" },
  { n: "0.24 ms", what: "average h1 → h4 round trip on the static path", from: "SDN routing" },
  { n: "2.5×", what: "sooner an I/O-bound container finished next to a CPU hog, thanks to CFS", from: "Container runtime" },
  { n: "0.65", what: "C-index with clinical + radiomic features vs 0.62 clinical alone (synthetic cohort)", from: "Pancreatic prognosis" },
];

export const tools = [
  ["languages", "Python, C, JavaScript / TypeScript, SQL"],
  ["ml", "PyTorch, TensorFlow, MediaPipe, OpenCV, RDKit, scikit-learn"],
  ["web", "React, FastAPI, Flask, Node / Express"],
  ["systems", "Linux, kernel modules, namespaces, pthreads, OpenFlow"],
  ["security", "MCP, prompt-injection defence, Wazuh / SIEM, fuzzing, Bandit"],
  ["infra", "Docker, AWS (Lambda, Bedrock, SNS), GitHub Actions, PostgreSQL, MongoDB"],
];

// The "desk": snapshots that slide past while you scroll. `img` is a real
// screenshot; `term` is a few real lines rendered as a terminal.
export const snaps = [
  { img: "assets/shots/securegent-2.webp", note: "securegent catching 6 bad calls", tilt: -3 },
  { img: "assets/shots/aadhaarguard-1.webp", note: "aadhaarguard vs. a customer file", tilt: 2.5 },
  { term: ["$ sudo ./engine start memtest \\", "    --hard-mib 20", "", "[container_monitor] SOFT LIMIT", "    rss=17297408", "[container_monitor] HARD LIMIT", "memtest   state=killed"], note: "my kernel module, being ruthless", tilt: -1.5 },
  { img: "assets/shots/pypi-securegent.webp", note: "shipped it! 0.3.0", tilt: 3.5 },
  { term: ["h1 ─┐", "     s1 ── s2 ── s3 ─┬─ h3", "h2 ─┘               └─ h4", "", "flows reinstalled every 10 s"], note: "SDN routing, drawn in ascii", tilt: -2.5 },
  { img: "assets/shots/securegent-3.webp", note: "the big orange stop button", tilt: 1.5 },
  { img: "assets/shots/pypi-aadhaarguard.webp", note: "package #2", tilt: -3.5 },
  { img: "assets/shots/github.webp", note: "where all of it lives", tilt: -1 },
];

// Covers for the 3D ring and the areas panel. Drawn in code, one per project.
export const covers = [
  { name: "Securegent", kicker: "firewall · 0.3.0", theme: "ink", art: "pulse" },
  { name: "aadhaarguard", kicker: "indian pii · 0.2.1", theme: "cream", art: "mask" },
  { name: "SIGN_AI", kicker: "ISL / ASL", theme: "orange", art: "hand" },
  { name: "Containers", kicker: "C · kernel module", theme: "ink", art: "boxes" },
  { name: "MedShield", kicker: "drug–gene risk", theme: "peach", art: "pills" },
  { name: "Traffic AI", kicker: "multi-agent", theme: "orange", art: "lights" },
  { name: "Prognosis", kicker: "survival analysis", theme: "cream", art: "km" },
  { name: "SDN", kicker: "OpenFlow 1.3", theme: "ink", art: "topo" },
  { name: "pip install", kicker: "both on PyPI", theme: "orange", art: "pip" },
  { name: "break it.", kicker: "build it, then", theme: "peach", art: "scribble" },
  { name: "14/14", kicker: "attacks blocked", theme: "ink", art: "shield" },
  { name: "Bengaluru", kicker: "BLR · IST", theme: "cream", art: "sun" },
];

export const areas = [
  { id: "security", name: "Security tooling", cover: "Securegent", caption: "securegent + aadhaarguard",
    text: "Guardrails for AI agents and for Indian personal data: policies, audit logs, redaction, and a red-team suite that attacks my own code.",
    stats: [["14/14", "attacks blocked"], ["2", "packages on PyPI"]] },
  { id: "ml", name: "Machine learning", cover: "SIGN_AI", caption: "SIGN_AI · MedShield · Traffic AI · prognosis",
    text: "Models for health and accessibility: sign language from hand landmarks, drug–gene risk, and survival analysis.",
    stats: [["4", "ML projects"], ["0.65", "C-index (synthetic data)"]] },
  { id: "systems", name: "Systems in C", cover: "Containers", caption: "container runtime + SDN controller",
    text: "Containers built from namespaces with a kernel module that enforces memory limits, and an SDN controller that keeps its routes.",
    stats: [["2.5×", "sooner for I/O work under CFS"], ["0%", "packets dropped"]] },
];
