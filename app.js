/* mahmoud.tasarro.co.uk v6 — vanilla JS, no dependencies.
   All numbers below are real data from the primary MEES reliability trial
   (tool_cycle_20260508_153554.xml): [switch index, seconds since previous
   confirmation, tool S=SCANNER01 G=GRIP01]. */

const INTERVALS = [[2,35.9,'G'],[3,35.9,'S'],[4,35.8,'G'],[5,35.9,'S'],[6,35.9,'G'],[7,35.9,'S'],[8,35.9,'G'],[9,35.9,'S'],[10,35.9,'G'],[11,36.0,'S'],[12,35.9,'G'],[13,35.9,'S'],[14,35.9,'G'],[15,35.9,'S'],[16,35.9,'G'],[17,36.0,'S'],[18,35.9,'G'],[19,35.9,'S'],[20,35.9,'G'],[21,36.0,'S'],[22,36.0,'G'],[23,36.0,'S'],[24,35.9,'G'],[25,36.0,'S'],[26,36.0,'G'],[27,36.1,'S'],[28,36.0,'G'],[29,36.0,'S'],[30,36.0,'G'],[31,36.0,'S'],[32,36.0,'G'],[33,36.0,'S'],[34,36.0,'G'],[35,36.0,'S'],[36,36.1,'G'],[37,36.0,'S'],[38,36.1,'G'],[39,36.1,'S'],[40,36.1,'G'],[41,36.1,'S'],[42,36.2,'G'],[43,36.0,'S'],[44,36.1,'G'],[45,36.1,'S'],[46,36.2,'G'],[47,36.2,'S'],[48,36.2,'G'],[49,36.1,'S'],[50,36.2,'G'],[51,36.2,'S'],[52,36.1,'G'],[53,36.2,'S'],[54,36.1,'G'],[55,36.2,'S'],[56,36.2,'G'],[57,36.1,'S'],[58,36.2,'G'],[59,36.3,'S'],[60,36.3,'G'],[61,36.3,'S'],[62,36.2,'G'],[63,36.1,'S'],[64,36.2,'G'],[65,36.2,'S'],[66,36.2,'G'],[67,36.2,'S'],[68,36.3,'G'],[69,36.3,'S'],[70,36.3,'G'],[71,36.2,'S'],[72,36.3,'G'],[73,36.3,'S'],[74,36.3,'G'],[75,36.3,'S'],[76,36.3,'G'],[77,36.3,'S'],[78,36.4,'G'],[79,36.3,'S'],[80,36.3,'G'],[81,36.3,'S'],[82,36.3,'G'],[83,36.3,'S'],[84,36.3,'G'],[85,36.3,'S'],[86,36.4,'G'],[87,36.4,'S'],[88,36.4,'G'],[89,36.4,'S'],[90,36.4,'G'],[91,36.4,'S'],[92,36.4,'G'],[93,36.3,'S'],[94,36.4,'G'],[95,36.4,'S'],[96,36.5,'G'],[97,36.5,'S'],[98,36.4,'G'],[99,36.4,'S'],[100,36.4,'G'],[101,36.5,'S'],[102,36.5,'G']];

const CONSOLE_LINES = [
  { t: "[15:41:27] switch 001 -> SCANNER01 ... success", cls: "" },
  { t: "[15:42:03] switch 002 -> GRIP01    ... success", cls: "" },
  { t: "[15:42:39] switch 003 -> SCANNER01 ... success", cls: "" },
  { t: "[15:43:15] switch 004 -> GRIP01    ... success", cls: "" },
  { t: "[15:43:51] switch 005 -> SCANNER01 ... success", cls: "" },
  { t: "[15:44:27] switch 006 -> GRIP01    ... success", cls: "" },
  { t: "           ... 96 more switches, every one successful ...", cls: "dim" },
  { t: "session summary: 102/102 successful | 0 faults | 4011.2 s", cls: "sum" },
];

const TOOL = { S: "SCANNER01", G: "GRIP01" };
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* run fn once, the first time el scrolls into view */
function whenVisible(el, fn, threshold = 0.3) {
  if (!el) return;
  if (!("IntersectionObserver" in window)) { fn(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) { io.disconnect(); fn(); }
  }, { threshold });
  io.observe(el);
}

/* position a chart tooltip at viewBox point (px, py), kept inside the chart */
function placeTip(tip, wrap, px, py, W, H) {
  /* the svg may be wider than its wrapper on phones (wrapper scrolls) */
  const svg = wrap.querySelector("svg");
  const w = wrap.getBoundingClientRect();
  const r = svg.getBoundingClientRect();
  const x0 = r.left - w.left + wrap.scrollLeft;
  tip.style.display = "block";
  const half = tip.offsetWidth / 2;
  let left = x0 + (px / W) * r.width;
  left = Math.max(wrap.scrollLeft + half, Math.min(wrap.scrollLeft + wrap.clientWidth - half, left));
  tip.style.left = left + "px";
  tip.style.top = (r.top - w.top) + (py / H) * r.height + "px";
}

/* ── stat count-up ─────────────────────────────────────────── */
function countUps() {
  document.querySelectorAll(".stat b[data-count]").forEach((el) => {
    const finalHTML = el.innerHTML;
    if (REDUCED) return;
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const suffix = el.dataset.suffix || "";
    const D = 1100;
    whenVisible(el, () => {
      const t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / D, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.innerHTML = finalHTML;
      }
      requestAnimationFrame(step);
    }, 0.6);
  });
}

/* ── console replay ────────────────────────────────────────── */
function consoleReplay() {
  const pre = document.getElementById("swap-console");
  if (!pre) return;
  const render = (line) => {
    const span = document.createElement("span");
    if (line.cls) span.className = line.cls;
    span.innerHTML = line.t.replace(/success$/, '<span class="ok">success</span>') + "\n";
    pre.appendChild(span);
  };
  if (REDUCED) {
    CONSOLE_LINES.forEach(render);
    return;
  }
  pre.classList.add("cursor");
  let i = 0;
  const tick = () => {
    render(CONSOLE_LINES[i]);
    i += 1;
    if (i < CONSOLE_LINES.length) setTimeout(tick, i >= 6 ? 650 : 360);
    else pre.classList.remove("cursor");
  };
  whenVisible(pre, () => setTimeout(tick, 300));
}

/* ── swap-interval chart ───────────────────────────────────── */
function chart() {
  const wrap = document.getElementById("swap-chart");
  const tip = document.getElementById("chart-tip");
  if (!wrap || !tip) return;

  const W = 720, H = 280, L = 46, R = 14, T = 16, B = 32;
  const PW = W - L - R, PH = H - T - B;
  const Y0 = 35, Y1 = 37, X0 = 2, X1 = 102;
  const x = (i) => L + ((i - X0) / (X1 - X0)) * PW;
  const y = (v) => T + ((Y1 - v) / (Y1 - Y0)) * PH;

  const NS = "http://www.w3.org/2000/svg";
  const S = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };

  const svg = S("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-hidden": "false" }, wrap);

  // recessive grid + y ticks
  [35, 35.5, 36, 36.5, 37].forEach((v) => {
    S("line", { x1: L, x2: L + PW, y1: y(v), y2: y(v), class: "grid" }, svg);
    S("text", { x: L - 8, y: y(v) + 3.5, class: "tick", "text-anchor": "end" }, svg).textContent = v.toFixed(1);
  });
  // x ticks
  [2, 25, 50, 75, 102].forEach((i) => {
    S("text", { x: x(i), y: T + PH + 20, class: "tick", "text-anchor": "middle" }, svg).textContent = "#" + i;
  });
  S("text", { x: L + PW / 2, y: H - 2, class: "tick", "text-anchor": "middle" }, svg).textContent = "switch index";

  // mean reference (selective label, not a gridline)
  S("line", { x1: L, x2: L + PW, y1: y(36.2), y2: y(36.2), class: "meanline" }, svg);
  S("text", { x: L + 6, y: y(36.2) - 7, class: "meanlabel", "text-anchor": "start" }, svg).textContent = "mean 36.2 s";

  // series
  const d = INTERVALS.map((p, k) => (k ? "L" : "M") + x(p[0]).toFixed(1) + " " + y(p[1]).toFixed(1)).join(" ");
  S("path", { d, class: "series" }, svg);
  INTERVALS.forEach((p) => S("circle", { cx: x(p[0]), cy: y(p[1]), r: 2.2, class: "dot" }, svg));

  // hover/focus layer
  const cross = S("line", { y1: T, y2: T + PH, class: "crosshair", visibility: "hidden" }, svg);
  const hi = S("circle", { r: 5, class: "hidot", visibility: "hidden" }, svg);

  let cur = -1;
  const show = (k) => {
    cur = Math.max(0, Math.min(INTERVALS.length - 1, k));
    const [i, dt, tool] = INTERVALS[cur];
    const px = x(i), py = y(dt);
    cross.setAttribute("x1", px); cross.setAttribute("x2", px);
    cross.setAttribute("visibility", "visible");
    hi.setAttribute("cx", px); hi.setAttribute("cy", py);
    hi.setAttribute("visibility", "visible");
    tip.textContent = `#${String(i).padStart(3, "0")} · ${TOOL[tool]} · ${dt.toFixed(1)} s`;
    placeTip(tip, wrap, px, py, W, H);
  };
  const hide = () => {
    cross.setAttribute("visibility", "hidden");
    hi.setAttribute("visibility", "hidden");
    tip.style.display = "none";
  };

  wrap.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    INTERVALS.forEach((p, k) => {
      const dd = Math.abs(x(p[0]) - vx);
      if (dd < bd) { bd = dd; best = k; }
    });
    show(best);
  });
  wrap.addEventListener("mouseleave", hide);
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { show(cur < 0 ? 0 : cur + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { show(cur < 0 ? INTERVALS.length - 1 : cur - 1); e.preventDefault(); }
    else if (e.key === "Home") { show(0); e.preventDefault(); }
    else if (e.key === "End") { show(INTERVALS.length - 1); e.preventDefault(); }
    else if (e.key === "Escape") hide();
  });
  wrap.addEventListener("blur", hide);

  // table view twin
  const tbody = document.getElementById("swap-table");
  if (tbody) {
    INTERVALS.forEach(([i, dt, tool]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>#${String(i).padStart(3, "0")}</td><td>${TOOL[tool]}</td><td>${dt.toFixed(1)}</td>`;
      tbody.appendChild(tr);
    });
  }
}

/* ── architecture stack ────────────────────────────────────── */
function arch() {
  const info = document.getElementById("arch-info");
  const layers = document.querySelectorAll(".arch-layer");
  if (!info || !layers.length) return;
  layers.forEach((btn) => {
    btn.addEventListener("click", () => {
      layers.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      info.textContent = btn.dataset.info;
    });
  });
}

/* ── scroll reveal ─────────────────────────────────────────── */
function reveal() {
  const els = document.querySelectorAll(".reveal");
  if (REDUCED || !("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("on"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("on"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

countUps();
consoleReplay();
chart();
arch();
reveal();

/* ══ v3: remaining project visualizations ══════════════════════ */

/* FIC commit timeline — real git history, octall's authored commits,
   merges and stash artifacts excluded (24 commits, May-Jun 2026). */
const FIC_LANES = ["Extensions & VR", "Reliability fixes", "Device & platform", "Control tuning"];
const FIC_COMMITS = [
  { lane: 0, day: 2,  n: 2, label: "tool-switcher extension · live cam feed" },
  { lane: 0, day: 36, n: 2, label: "initial VR playground · VR updates" },
  { lane: 0, day: 45, n: 1, label: "autotuning extension work" },
  { lane: 1, day: 2,  n: 5, label: "buffer overflow · serial blocking · Qt logging crash · scanner moved to its own thread · vision fix" },
  { lane: 2, day: 33, n: 2, label: "Kinova gripper enabled + control loop · libfranka 0.17 → 0.18" },
  { lane: 2, day: 34, n: 1, label: "async position-control example (CMake)" },
  { lane: 2, day: 36, n: 1, label: "launch-file analysis cache" },
  { lane: 2, day: 47, n: 1, label: "version bump to 4.0.0" },
  { lane: 3, day: 2,  n: 2, label: "Cartesian tolerance + postural control · switch to joint planner" },
  { lane: 3, day: 17, n: 1, label: "automatic stiffness in the torque map" },
  { lane: 3, day: 45, n: 5, label: "admittance & haptic · Cartesian autotuner (stiffness floor, oscillation override) ×4" },
  { lane: 3, day: 47, n: 1, label: "autotuners for orientation / elbow / postural + torque saturation vs URDF limits" },
];

function ficTimeline() {
  const wrap = document.getElementById("fic-timeline");
  const tip = document.getElementById("fic-tip");
  if (!wrap || !tip) return;
  const W = 720, LANE_H = 36, L = 128, R = 16, T = 8;
  const H = T + FIC_LANES.length * LANE_H + 30;
  const DAY0 = 0, DAY1 = 60; // 1 May - 30 Jun 2026
  const x = (d) => L + ((d - DAY0) / (DAY1 - DAY0)) * (W - L - R);
  const laneY = (l) => T + l * LANE_H + LANE_H / 2;

  const NS = "http://www.w3.org/2000/svg";
  const S = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    parent.appendChild(el);
    return el;
  };
  const svg = S("svg", { viewBox: `0 0 ${W} ${H}` }, wrap);

  FIC_LANES.forEach((name, l) => {
    S("line", { x1: L, x2: W - R, y1: laneY(l), y2: laneY(l), class: "grid" }, svg);
    S("text", { x: L - 10, y: laneY(l) + 3.5, class: "tick", "text-anchor": "end" }, svg).textContent = name;
  });
  [{ d: 0, t: "May 2026" }, { d: 31, t: "Jun 2026" }].forEach((m) => {
    S("text", { x: x(m.d), y: H - 6, class: "tick", "text-anchor": "start" }, svg).textContent = m.t;
    S("line", { x1: x(m.d), x2: x(m.d), y1: T, y2: H - 22, class: "grid" }, svg);
  });

  const dots = FIC_COMMITS.map((c) => {
    const r = 5 + 2.6 * Math.sqrt(c.n - 1);
    const g = S("g", {}, svg);
    S("circle", { cx: x(c.day), cy: laneY(c.lane), r, class: "commitdot" }, g);
    if (c.n > 1)
      S("text", { x: x(c.day), y: laneY(c.lane) + 3.5, class: "commitcount", "text-anchor": "middle" }, g).textContent = c.n;
    return { c, r };
  });

  let cur = -1;
  const show = (k) => {
    cur = (k + FIC_COMMITS.length) % FIC_COMMITS.length;
    const c = FIC_COMMITS[cur];
    const date = c.day <= 30 ? `${c.day + 1} May` : `${c.day - 30} Jun`;
    tip.textContent = `${date} · ${c.n} commit${c.n > 1 ? "s" : ""} · ${c.label}`;
    placeTip(tip, wrap, x(c.day), laneY(c.lane) - 8, W, H);
  };
  const hide = () => { tip.style.display = "none"; };

  wrap.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const vy = ((e.clientY - rect.top) / rect.height) * H;
    let best = -1, bd = Infinity;
    FIC_COMMITS.forEach((c, k) => {
      const dd = Math.hypot(x(c.day) - vx, laneY(c.lane) - vy);
      if (dd < bd) { bd = dd; best = k; }
    });
    if (bd < 40) show(best); else hide();
  });
  wrap.addEventListener("mouseleave", hide);
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { show(cur + 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { show(cur - 1); e.preventDefault(); }
    else if (e.key === "Escape") hide();
  });
  wrap.addEventListener("blur", hide);
}

/* RISC-V rv32ui results — real run, 3 Aug 2026, Icarus Verilog. */
const RV_GROUPS = [
  { name: "register-register", tests: ["add","sub","sll","slt","sltu","xor","srl","sra","or","and"] },
  { name: "immediates", tests: ["addi","slti","sltiu","xori","ori","andi","slli","srli","srai"] },
  { name: "branches", tests: ["beq","bne","blt","bge","bltu","bgeu"] },
  { name: "jumps & upper", tests: ["jal","jalr","lui","auipc"] },
  { name: "loads", tests: ["lb","lbu","lh","lhu","lw"] },
  { name: "stores", tests: ["sb","sh","sw"] },
  { name: "memory & misc", tests: ["ld_st","st_ld","simple","ma_data","fence_i"] },
];
const RV_FAIL = { ma_data: "fails — misaligned data access; the core doesn't implement misalignment traps yet" };
const RV_SKIP = { fence_i: "skipped — self-modifying code; this core's Harvard instruction memory can't" };

function rvGrid() {
  const host = document.getElementById("rv-grid");
  if (!host) return;
  RV_GROUPS.forEach((g) => {
    const row = document.createElement("div");
    row.className = "rv-row";
    const label = document.createElement("span");
    label.className = "rv-group";
    label.textContent = g.name;
    row.appendChild(label);
    const tiles = document.createElement("div");
    tiles.className = "rv-tiles";
    g.tests.forEach((t) => {
      const tile = document.createElement("span");
      const st = RV_FAIL[t] ? "fail" : RV_SKIP[t] ? "skip" : "pass";
      tile.className = "rv-tile " + st;
      tile.title = RV_FAIL[t] || RV_SKIP[t] || t + ": PASS";
      tile.innerHTML = `<span class="g" aria-hidden="true">${st === "pass" ? "✓" : st === "fail" ? "✕" : "–"}</span>${t}<span class="visually-hidden"> ${st}</span>`;
      tiles.appendChild(tile);
    });
    row.appendChild(tiles);
    host.appendChild(row);
  });
}

/* ToolIndexer protocol chips — from TOOLINDEXER_PROTOCOL.md. */
function protoChips() {
  const info = document.getElementById("proto-info");
  const chips = document.querySelectorAll(".proto-chip");
  if (!info || !chips.length) return;
  chips.forEach((btn) => {
    btn.addEventListener("click", () => {
      chips.forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      info.textContent = btn.dataset.info;
    });
  });
}

ficTimeline();
rvGrid();
protoChips();

/* ══ v6: page chrome ═══════════════════════════════════════════ */

/* accessible tabs (WAI-ARIA tabs pattern, manual activation on click/arrow) */
function tabs() {
  document.querySelectorAll("[data-tabs]").forEach((root) => {
    const tabsEls = [...root.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      tabsEls.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabsEls.forEach((t, k) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        let n = -1;
        if (e.key === "ArrowRight") n = (k + 1) % tabsEls.length;
        else if (e.key === "ArrowLeft") n = (k - 1 + tabsEls.length) % tabsEls.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabsEls.length - 1;
        if (n >= 0) { e.preventDefault(); select(tabsEls[n], true); }
      });
    });
    select(tabsEls.find((t) => t.getAttribute("aria-selected") === "true") || tabsEls[0]);
  });
}

/* sticky-nav border, mobile menu, and current-section highlight */
function nav() {
  const bar = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const list = document.getElementById("nav-links");
  if (!bar || !list) return;

  const onScroll = () => bar.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const close = () => { list.classList.remove("open"); toggle && toggle.setAttribute("aria-expanded", "false"); };
  if (toggle) {
    toggle.addEventListener("click", () => {
      const open = !list.classList.contains("open");
      list.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    list.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  const links = [...list.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window) || !sections.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => {
        const on = a.getAttribute("href") === "#" + en.target.id;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
}

/* copy-email button: only shown where the Clipboard API exists */
function copyEmail() {
  const btn = document.getElementById("copy-email");
  if (!btn || !navigator.clipboard) return;
  btn.hidden = false;
  const label = btn.textContent;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      btn.textContent = "Copied ✓";
    } catch (_) {
      btn.textContent = "Couldn't copy";
    }
    setTimeout(() => { btn.textContent = label; }, 2000);
  });
}

tabs();
nav();
copyEmail();
