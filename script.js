"use strict";

/* ──────────────────── BACKGROUND CANVAS ANIMATION ────────────────────── */
(function initBgCanvas() {
  const canvas = document.getElementById("bgCanvas");
  const ctx    = canvas.getContext("2d");
  let W, H, animId, isDark = false;
  let time = 0;

  /* Light mode — floating soft orbs */
  const ORBS = [
    { x:.15, y:.2,  r:.30, vx: .00014, vy: .00009,  c:[0,122,255] },
    { x:.80, y:.15, r:.24, vx:-.00010, vy: .00014,  c:[90,200,250] },
    { x:.50, y:.78, r:.26, vx: .00011, vy:-.00009,  c:[52,199,89]  },
    { x:.20, y:.65, r:.20, vx: .00008, vy: .00011,  c:[255,149,0]  },
    { x:.78, y:.70, r:.18, vx:-.00009, vy:-.00007,  c:[88,86,214]  },
    { x:.45, y:.40, r:.16, vx: .00013, vy: .00008,  c:[255,45,135] },
  ];

  /* Dark mode — stars */
  const STARS = Array.from({length:140}, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    base: Math.random() * 0.55 + 0.15,
    spd: Math.random() * 0.018 + 0.004,
    ph:  Math.random() * Math.PI * 2,
  }));

  /* Dark mode — aurora bands */
  const BANDS = [
    { oy:.28, c:[99,102,241],  a:.16, af:.40, wf:.36, wp:0.0 },
    { oy:.42, c:[20,184,166],  a:.12, af:.55, wf:.28, wp:1.8 },
    { oy:.22, c:[139,92,246],  a:.10, af:.35, wf:.44, wp:3.5 },
    { oy:.52, c:[59,130,246],  a:.09, af:.48, wf:.32, wp:5.1 },
    { oy:.35, c:[16,185,129],  a:.08, af:.42, wf:.38, wp:2.4 },
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function drawLight() {
    ctx.clearRect(0,0,W,H);
    ORBS.forEach(o => {
      o.x += o.vx; o.y += o.vy;
      if (o.x < -.3 || o.x > 1.3) o.vx *= -1;
      if (o.y < -.3 || o.y > 1.3) o.vy *= -1;
      const x = o.x*W, y = o.y*H, r = o.r * Math.min(W,H);
      const g = ctx.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0,   `rgba(${o.c},0.18)`);
      g.addColorStop(0.5, `rgba(${o.c},0.07)`);
      g.addColorStop(1,   `rgba(${o.c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);
    });
  }

  function drawDark() {
    ctx.clearRect(0,0,W,H);
    const t = time * 0.003;

    /* stars */
    STARS.forEach(s => {
      const op = s.base * (0.5 + 0.5 * Math.sin(time * s.spd + s.ph));
      ctx.beginPath();
      ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${op})`;
      ctx.fill();
    });

    /* aurora */
    BANDS.forEach(b => {
      const yc  = b.oy * H + Math.sin(t * b.af + b.wp) * b.a * H;
      const bH  = H * 0.22;
      const pts = 14;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, yc - bH);
      for (let i = 0; i <= pts; i++) {
        const x = (i/pts)*W;
        const y = yc - bH/2 + Math.sin(i*0.7 + t*b.wf*2 + b.wp) * H*0.035;
        i === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      for (let i = pts; i >= 0; i--) {
        const x = (i/pts)*W;
        const y = yc + bH/2 + Math.sin(i*0.7 + t*b.wf*2 + b.wp + Math.PI) * H*0.025;
        ctx.lineTo(x,y);
      }
      ctx.closePath();

      const g = ctx.createLinearGradient(0, yc-bH, 0, yc+bH);
      g.addColorStop(0,   `rgba(${b.c},0)`);
      g.addColorStop(0.5, `rgba(${b.c},${b.a})`);
      g.addColorStop(1,   `rgba(${b.c},0)`);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    });
  }

  function loop() {
    time++;
    isDark ? drawDark() : drawLight();
    animId = requestAnimationFrame(loop);
  }

  window.setBgMode = function(dark) {
    isDark = dark;
  };

  resize();
  window.addEventListener("resize", resize);
  loop();
})();

/* ──────────────────── THEME ────────────────────── */
const MOON = `<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>`;
const SUN  = `
  <circle cx="12" cy="12" r="4" fill="currentColor"/>
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="12" y1="2"  x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2"  y1="12" x2="5"  y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.93"  y1="4.93"  x2="7.05"  y2="7.05"/>
    <line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/>
    <line x1="4.93"  y1="19.07" x2="7.05"  y2="16.95"/>
    <line x1="16.95" y1="7.05"  x2="19.07" y2="4.93"/>
  </g>`;

let darkMode = false;

function applyTheme(dark) {
  darkMode = dark;
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.getElementById("themeIcon").innerHTML = dark ? SUN : MOON;
  document.getElementById("themeLabel").textContent = dark ? "Light" : "Dark";
  window.setBgMode?.(dark);
  try { localStorage.setItem("gitscope-theme", dark ? "dark" : "light"); } catch(_) {}
}

(function initTheme() {
  try {
    const s = localStorage.getItem("gitscope-theme");
    if (s) { applyTheme(s === "dark"); return; }
  } catch(_) {}
  applyTheme(window.matchMedia?.("(prefers-color-scheme:dark)").matches ?? false);
})();

document.getElementById("themeBtn").addEventListener("click", () => applyTheme(!darkMode));

/* ──────────────────── CONSTANTS ────────────────────── */
const API       = "https://api.github.com/users/";
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const HOME_USER = "Zephyrex21";

/* ── Icon SVG strings ── */
const SVG = {
  leetcode: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.483 0a1.374 1.374 0 00-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 00-1.209 2.104 5.527 5.527 0 00.062 2.362 5.83 5.83 0 00.349 1.017 5.938 5.938 0 001.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 00-1.951-.003l-2.396 2.392a3.021 3.021 0 01-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.545 2.545 0 01.619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 00-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0013.483 0zm-2.866 12.815a1.38 1.38 0 000 2.764H20.79a1.38 1.38 0 000-2.764z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  netlify: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.686 7.32l-3.809-3.81-.852-.853a1.07 1.07 0 00-1.513 0L5.314 7.855a1.07 1.07 0 000 1.513l.189.188 4.063 4.064.113.113.815.815a1.07 1.07 0 001.513 0l.064-.064 3.843-3.843.188-.188a1.07 1.07 0 000-1.513zM9.657 12.91l-3.163-3.163 3.163-3.163 3.163 3.163-3.163 3.163zm0 0M8.754 4.336L4.508 8.582a1.07 1.07 0 000 1.513l4.246 4.246V4.336zm6.49 0v10.005l4.247-4.246a1.07 1.07 0 000-1.513L15.244 4.336z"/><path d="M9.657 12.91l-3.163-3.163 3.163-3.163 3.163 3.163-3.163 3.163z"/></svg>`,
  website: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  company: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>`,
};

/* Home user hardcoded chip definitions */
const HOME_CHIPS = {
  b: { label:"LeetCode",  value:"Zephyrex_21",        href:"https://leetcode.com/u/Zephyrex_21/",                    icon:SVG.leetcode,  color:"ci-b" },
  c: { label:"Instagram", value:"@_raj.shekharrr",    href:"https://www.instagram.com/_raj.shekharrr/",              icon:SVG.instagram, color:"ci-c" },
  d: { label:"Netlify",   value:"Zephyr Labs",         href:"https://app.netlify.com/teams/zephyr-labs/projects",    icon:SVG.netlify,   color:"ci-d" },
};

/* ──────────────────── DOM ────────────────────── */
const $ = id => document.getElementById(id);
const el = {
  input:       $("input"),
  submit:      $("submitBtn"),
  loading:     $("loadingEl"),
  profileCard: $("profileCard"),
  emptyState:  $("emptyState"),
  errorTag:    $("errorTag"),
  avatar:      $("avatar"),
  name:        $("name"),
  user:        $("user"),
  dateText:    $("dateText"),
  bio:         $("bio"),
  repos:       $("repos"),
  followers:   $("followers"),
  following:   $("following"),
  ghLink:      $("ghLink"),
  location:    $("location"),
  chipLoc:     $("chip-location"),
};

/* ──────────────────── UI HELPERS ────────────────────── */
function showError(on, msg) {
  el.errorTag.textContent = msg || "No results";
  el.errorTag.classList.toggle("show", on);
}
function setLoading(on) {
  el.loading.classList.toggle("show", on);
  el.submit.disabled    = on;
  el.submit.textContent = on ? "…" : "Search";
}
function resetUI() {
  showError(false);
  el.profileCard.classList.remove("show");
  el.emptyState.classList.remove("show");
}
function fmt(n) {
  if (n == null) return "–";
  if (n >= 1_000_000) return (n/1e6).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1_000)     return (n/1e3).toFixed(1).replace(/\.0$/,"")+"k";
  return String(n);
}

/* apply a chip definition { label, value, href, icon, color } to a slot (b/c/d) */
function applyDynChip(slot, def) {
  const chip  = $(  `chip-${slot}`);
  const icon  = $(`chip-${slot}-icon`);
  const label = $(`chip-${slot}-label`);
  const val   = $(`chip-${slot}-value`);

  // update color class
  icon.className = `chip-icon ${def.color}`;
  icon.innerHTML = def.icon;
  label.textContent = def.label;

  const ok = !!(def.value?.trim());
  chip.classList.toggle("na-chip", !ok);
  val.classList.toggle("na", !ok);
  val.textContent = ok ? def.value : "Not available";
  chip.href = (ok && def.href) ? def.href : "#";
}

function setLocChip(value) {
  const ok = !!(value?.trim());
  el.chipLoc.classList.toggle("na-chip", !ok);
  el.location.classList.toggle("na", !ok);
  el.location.textContent = ok ? value : "Not available";
}

/* build other-user chip defs from GitHub API data */
function buildOtherChips(d) {
  const blog = d.blog?.trim() || "";
  const blogUrl = blog ? (blog.startsWith("http") ? blog : `https://${blog}`) : "";
  const blogDisplay = blog.replace(/^https?:\/\/(www\.)?/i,"").replace(/\/$/,"");

  const tw = d.twitter_username?.trim() || "";
  const co = (d.company || "").trim().replace(/^@/,"");

  return {
    b: { label:"Website",  value:blogDisplay, href:blogUrl,                           icon:SVG.website,  color:"ci-b" },
    c: { label:"Twitter",  value:tw ? `@${tw}` : "", href:tw ? `https://x.com/${tw}` : "#", icon:SVG.twitter,  color:"ci-c" },
    d: { label:"Company",  value:co,          href:"#",                               icon:SVG.company,  color:"ci-d" },
  };
}

/* ──────────────────── RENDER ────────────────────── */
function renderProfile(d) {
  el.avatar.src = d.avatar_url || "";
  el.avatar.alt = `${d.login}'s avatar`;

  el.name.textContent = d.name || d.login;
  el.user.textContent = `@${d.login}`;
  el.user.href        = d.html_url;
  el.ghLink.href      = d.html_url;

  if (d.created_at) {
    const [yr,mo,day] = d.created_at.split("T")[0].split("-");
    el.dateText.textContent = `Joined ${+day} ${MONTHS[+mo-1]} ${yr}`;
  } else {
    el.dateText.textContent = "–";
  }

  el.bio.textContent       = d.bio?.trim() || "This profile has no bio.";
  el.repos.textContent     = fmt(d.public_repos);
  el.followers.textContent = fmt(d.followers);
  el.following.textContent = fmt(d.following);

  // Location — always dynamic
  setLocChip(d.location || "");

  // Chips b / c / d — home user gets personal hardcoded links, others get GitHub socials
  const isHome = d.login.toLowerCase() === HOME_USER.toLowerCase();
  const chips  = isHome ? HOME_CHIPS : buildOtherChips(d);
  applyDynChip("b", chips.b);
  applyDynChip("c", chips.c);
  applyDynChip("d", chips.d);
}

/* ──────────────────── FETCH ────────────────────── */
async function fetchProfile(username) {
  resetUI();
  setLoading(true);
  try {
    const res  = await fetch(`${API}${encodeURIComponent(username.trim())}`);
    const data = await res.json();
    setLoading(false);
    if (data.message === "Not Found" || res.status === 404) {
      el.emptyState.classList.add("show");
    } else if (data.message) {
      showError(true, "API error");
    } else {
      renderProfile(data);
      /* force re-animation */
      el.profileCard.style.animation = "none";
      requestAnimationFrame(() => {
        el.profileCard.style.animation = "";
        el.profileCard.classList.add("show");
      });
    }
  } catch(err) {
    setLoading(false);
    showError(true, "Network error");
    console.error("[GitScope]", err);
  }
}

/* ──────────────────── EVENT LISTENERS ────────────────────── */
el.submit.addEventListener("click", () => {
  const v = el.input.value.trim();
  if (v) fetchProfile(v);
});

el.input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const v = el.input.value.trim();
    if (v) fetchProfile(v);
  }
});

el.input.addEventListener("input", () => showError(false));

// Home button
$("homeBtn").addEventListener("click", () => {
  el.input.value = HOME_USER;
  fetchProfile(HOME_USER);
});

// Cmd/Ctrl + K → focus search
document.addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    el.input.focus(); el.input.select();
  }
});

/* ──────────────────── INIT ────────────────────── */
fetchProfile(HOME_USER);