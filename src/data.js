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
  ["web", "Web"],
  ["practice", "Coursework"],
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
    links: [["live", "https://sign-ai-tan.vercel.app"], ["code", `${GH}/SIGN_AI`]],
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
    id: "pes-vcs", cat: "systems", year: "2026", name: "PES-VCS",
    line: "A version control system written from scratch.",
    stack: ["C", "OpenSSL"],
    detail:
      "Content-addressed object store (SHA-256), tree objects for directories, a staging index, and commit history. Each part maps to a filesystem idea: blobs are files, trees are directories, refs are pointers.",
    links: [["code", `${GH}/PES2UG24CS372-pes-vcs`]],
    peek: ["$ pes add main.c", "$ pes commit -m \"phase 3\"", ".pes/objects/ab/cdef…", "$ pes log"],
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
  {
    id: "stayease", cat: "web", year: "2026", name: "StayEase",
    line: "A stay-booking web app on the MERN stack.",
    stack: ["MongoDB", "Express", "React", "Node"],
    detail: "A full-stack booking app: React + Vite front end, Express API, MongoDB. Academic project.",
    links: [["code", `${GH}/StayEase`]],
    peek: ["client   React + Vite", "server   Express on Node", "db       MongoDB"],
  },
  {
    id: "amazon", cat: "web", year: "2025", name: "Amazon homepage clone",
    line: "My first web project: the homepage, rebuilt in plain HTML and CSS.",
    stack: ["HTML", "CSS"],
    detail: "Where it started: a static page built by hand to learn layout with flexbox and positioning.",
    links: [["live", "https://amazon-xi-three.vercel.app"], ["code", `${GH}/amazon`]],
    peek: ["amazon.html", "amazonstyle.css", "display: flex;  /* everywhere */"],
  },
  {
    id: "se-labs", cat: "practice", year: "2026", name: "Software testing labs",
    line: "Static analysis, 100% branch coverage and fuzzing on deliberately buggy code.",
    stack: ["pytest", "Hypothesis", "Pylint", "Bandit", "Flake8"],
    detail:
      "Ran Pylint, Flake8 and Bandit on a gym booking ledger and fixed what they found; drove a shipping-quote module to 100% code and branch coverage; wrote Hypothesis property tests that throw random strings at parsers until they crash.",
    links: [["fuzzing", `${GH}/Lab-7-Fuzz-Testing`], ["coverage", `${GH}/L6_L7_04_shipping_quotation`], ["static analysis", `${GH}/L5_04_fitness_booking`]],
    peek: ["@given(st.text() | st.none())", "def test_parse_manifest_safe(s):", "Falsifying example: s=''", "branch coverage  100%"],
  },
  {
    id: "target", cat: "practice", year: "2026", name: "Target shooting game",
    line: "A Pygame lab: fix the hit-detection bug, then build the missing features.",
    stack: ["Python", "Pygame"],
    detail: "The starter built a square hitbox from the circle's centre, so clicks outside the target counted. Fixed the hit detection, then built moving targets, combo scoring and a timed round.",
    links: [["code", `${GH}/04_target_shooting`]],
    peek: ["Target.get_bounding_rect()", "  bug: rect starts at the centre", "combo ×3   timed round 30 s"],
  },
  {
    id: "leetcode", cat: "practice", year: "ongoing", name: "LeetCode",
    line: "Around 40 solved problems, synced to GitHub.",
    stack: ["Python"],
    detail: "Mostly arrays, linked lists and strings, plus a few hard ones (median of two sorted arrays, merge k sorted lists).",
    links: [["code", `${GH}/LeetCode`]],
    peek: ["4.  Median of Two Sorted Arrays   hard", "23. Merge k Sorted Lists         hard", "2.  Add Two Numbers              medium"],
  },
];

export const log = [
  ["21 Nov", "PyPI said 400 Bad Request.",
    "What it meant: a project called bharat-pii already exists, and PyPI ignores hyphens when it compares names. I had only checked the exact spelling. Renamed the project and now check every variant first."],
  ["21 Nov", "My PII scanner ran at 0.37 MB/s.",
    "The profiler found an O(n²) overlap check and sixteen regexes that started with a lookbehind, which makes Python try every position. Fixed both: same results, 4.5× faster."],
  ["21 Nov", "My own code leaked an auth token.",
    "Securegent's HTTP client followed a 302 to another host and re-sent the Authorization header with it. Redirects aren't followed at all now, and a test proves the token stays put."],
  ["20 Nov", "The alert rule that never fired.",
    "My Wazuh rules looked right on paper. Running real Wazuh in Docker showed another rule swallowing the “blocked” events first. Test against the real thing, not against your XML."],
];

export const tools = [
  ["languages", "Python, C, JavaScript / TypeScript, SQL"],
  ["ml", "PyTorch, TensorFlow, MediaPipe, OpenCV, RDKit, scikit-learn"],
  ["web", "React, FastAPI, Flask, Node / Express"],
  ["systems", "Linux, kernel modules, namespaces, pthreads, OpenFlow"],
  ["security", "MCP, prompt-injection defence, Wazuh / SIEM, fuzzing, Bandit"],
  ["infra", "Docker, AWS (Lambda, Bedrock, SNS), GitHub Actions, PostgreSQL, MongoDB"],
];
