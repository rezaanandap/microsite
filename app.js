// ==========================
// KPU SULBAR MICROSITE
// PUBLIC JS (GitHub Pages)
// ==========================

// GANTI dengan URL Web App GAS kamu
const API_URL = "https://script.google.com/macros/s/AKfycbw32G9B_U4APTAIuIhiYPYyo8GLhvQrTncgCMgs-W9IAaHLtfig1MVvpNPu2_CUmG9zng/exec";

document.getElementById("year").textContent = new Date().getFullYear();

async function api(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);

  Object.keys(params).forEach(k => {
    url.searchParams.set(k, params[k]);
  });

  const res = await fetch(url.toString());
  return res.json();
}

function safeUrl(url) {
  try {
    const u = new URL(url);
    return u.toString();
  } catch {
    return null;
  }
}

function renderLinks(links) {
  const box = document.getElementById("links");
  box.innerHTML = "";

  if (!links || links.length === 0) {
    box.innerHTML = `<div class="small">Belum ada link yang aktif.</div>`;
    return;
  }

  links.forEach(item => {
    const valid = safeUrl(item.url);
    if (!valid) return;

    const a = document.createElement("a");
    a.className = "link";
    a.href = valid;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = item.icon || "🔗";

    const text = document.createElement("div");
    text.style.display = "grid";
    text.style.gap = "2px";

    const t = document.createElement("div");
    t.style.fontWeight = "800";
    t.textContent = item.title;

    const u = document.createElement("div");
    u.style.fontSize = "12px";
    u.style.color = "rgba(255,255,255,0.65)";
    u.textContent = item.url;

    text.appendChild(t);
    text.appendChild(u);

    a.appendChild(badge);
    a.appendChild(text);

    box.appendChild(a);
  });
}

async function load() {
  try {
    const data = await api("getPublic");

    if (!data.ok) throw new Error(data.message || "Gagal load data");

    const cfg = data.config || {};
    document.title = cfg.site_title || "Microsite";
    document.getElementById("title").textContent = cfg.site_title || "Microsite";
    document.getElementById("subtitle").textContent = cfg.site_subtitle || "";

    const logo = document.getElementById("logo");
    if (cfg.logo_url) {
      logo.src = cfg.logo_url;
    } else {
      logo.src = "data:image/svg+xml;base64," + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
          <rect width="100%" height="100%" rx="18" fill="#4f8cff"/>
          <text x="50%" y="56%" text-anchor="middle" font-size="28" fill="white" font-family="Arial">KPU</text>
        </svg>
      `);
    }

    renderLinks(data.links);
  } catch (err) {
    document.getElementById("title").textContent = "Gagal memuat";
    document.getElementById("subtitle").textContent = String(err.message || err);
  }
}

load();
