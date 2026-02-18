// ==========================
// KPU SULBAR MICROSITE
// ADMIN JS (GitHub Pages)
// ==========================

// GANTI dengan URL Web App GAS kamu
const API_URL = "https://script.google.com/macros/s/AKfycbw32G9B_U4APTAIuIhiYPYyo8GLhvQrTncgCMgs-W9IAaHLtfig1MVvpNPu2_CUmG9zng/exec";

let TOKEN = localStorage.getItem("KPU_TOKEN") || "";
let USER = JSON.parse(localStorage.getItem("KPU_USER") || "null");

async function api(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);

  Object.keys(params).forEach(k => {
    url.searchParams.set(k, params[k]);
  });

  const res = await fetch(url.toString());
  return res.json();
}

function showLogin(msg = "") {
  document.getElementById("loginCard").style.display = "block";
  document.getElementById("dashCard").style.display = "none";
  document.getElementById("loginMsg").textContent = msg;
}

function showDash() {
  document.getElementById("loginCard").style.display = "none";
  document.getElementById("dashCard").style.display = "block";
}

function setMsg(id, text, ok = true) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.style.color = ok ? "rgba(255,255,255,0.75)" : "#ffd0d8";
}

function renderLinksAdmin(links) {
  const box = document.getElementById("linksAdmin");
  box.innerHTML = "";

  if (!links || links.length === 0) {
    box.innerHTML = `<div class="small">Belum ada link.</div>`;
    return;
  }

  links.forEach(item => {
    const div = document.createElement("div");
    div.className = "link";
    div.href = "#";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = item.icon || "🔗";

    const text = document.createElement("div");
    text.style.display = "grid";
    text.style.gap = "2px";

    const t = document.createElement("div");
    t.style.fontWeight = "900";
    t.textContent = item.title;

    const u = document.createElement("div");
    u.style.fontSize = "12px";
    u.style.color = "rgba(255,255,255,0.65)";
    u.textContent = item.url;

    const meta = document.createElement("div");
    meta.style.fontSize = "12px";
    meta.style.color = "rgba(255,255,255,0.55)";
    meta.textContent = `Order: ${item.order} • ${item.active ? "Aktif" : "Nonaktif"}`;

    text.appendChild(t);
    text.appendChild(u);
    text.appendChild(meta);

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";
    actions.style.marginLeft = "auto";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn";
    btnEdit.textContent = "Edit";
    btnEdit.onclick = () => openEdit(item);

    const btnDel = document.createElement("button");
    btnDel.className = "btn danger";
    btnDel.textContent = "Hapus";
    btnDel.onclick = () => removeLink(item.id);

    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);

    div.appendChild(badge);
    div.appendChild(text);
    div.appendChild(actions);

    box.appendChild(div);
  });
}

function openForm(show = true) {
  document.getElementById("linkFormBox").style.display = show ? "block" : "none";
}

function resetForm() {
  document.getElementById("link_id").value = "";
  document.getElementById("link_title").value = "";
  document.getElementById("link_url").value = "";
  document.getElementById("link_icon").value = "🔗";
  document.getElementById("link_order").value = 1;
  document.getElementById("link_active").value = "true";
  setMsg("linkMsg", "");
}

function openEdit(item) {
  openForm(true);
  document.getElementById("link_id").value = item.id;
  document.getElementById("link_title").value = item.title;
  document.getElementById("link_url").value = item.url;
  document.getElementById("link_icon").value = item.icon || "🔗";
  document.getElementById("link_order").value = item.order || 1;
  document.getElementById("link_active").value = item.active ? "true" : "false";
}

async function removeLink(id) {
  if (!confirm("Hapus link ini?")) return;

  const res = await api("deleteLink", { token: TOKEN, id });
  if (!res.ok) return alert(res.message || "Gagal hapus");

  await loadAdmin();
}

async function saveLink() {
  const id = document.getElementById("link_id").value;
  const title = document.getElementById("link_title").value.trim();
  const url = document.getElementById("link_url").value.trim();
  const icon = document.getElementById("link_icon").value.trim();
  const order = document.getElementById("link_order").value;
  const active = document.getElementById("link_active").value;

  if (!title || !url) {
    setMsg("linkMsg", "Judul dan URL wajib.", false);
    return;
  }

  const res = await api("saveLink", {
    token: TOKEN,
    id,
    title,
    url,
    icon,
    order,
    active
  });

  if (!res.ok) {
    setMsg("linkMsg", res.message || "Gagal simpan link.", false);
    return;
  }

  setMsg("linkMsg", res.message || "Tersimpan.");
  resetForm();
  openForm(false);
  await loadAdmin();
}

async function saveConfig() {
  const site_title = document.getElementById("site_title").value.trim();
  const site_subtitle = document.getElementById("site_subtitle").value.trim();
  const logo_url = document.getElementById("logo_url").value.trim();
  const theme = document.getElementById("theme").value;

  const res = await api("saveConfig", {
    token: TOKEN,
    site_title,
    site_subtitle,
    logo_url,
    theme
  });

  if (!res.ok) {
    setMsg("cfgMsg", res.message || "Gagal simpan config.", false);
    return;
  }

  setMsg("cfgMsg", res.message || "Config tersimpan.");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadLogo() {
  const input = document.getElementById("logoFile");
  if (!input.files || !input.files[0]) {
    setMsg("cfgMsg", "Pilih file logo dulu.", false);
    return;
  }

  const file = input.files[0];
  const base64 = await fileToBase64(file);

  setMsg("cfgMsg", "Uploading logo...");

  const res = await api("uploadLogo", {
    token: TOKEN,
    filename: file.name,
    base64
  });

  if (!res.ok) {
    setMsg("cfgMsg", res.message || "Upload gagal.", false);
    return;
  }

  document.getElementById("logo_url").value = res.logo_url;
  setMsg("cfgMsg", "Logo berhasil diupload.");
}

async function loadAdmin() {
  const data = await api("getAdmin", { token: TOKEN });

  if (!data.ok) {
    showLogin("Session invalid, silakan login ulang.");
    localStorage.removeItem("KPU_TOKEN");
    localStorage.removeItem("KPU_USER");
    TOKEN = "";
    USER = null;
    return;
  }

  showDash();

  // user info
  document.getElementById("userInfo").textContent =
    `Login sebagai: ${USER?.name || "Admin"} (${USER?.role || "admin"})`;

  // config
  const cfg = data.config || {};
  document.getElementById("site_title").value = cfg.site_title || "";
  document.getElementById("site_subtitle").value = cfg.site_subtitle || "";
  document.getElementById("logo_url").value = cfg.logo_url || "";
  document.getElementById("theme").value = cfg.theme || "dark";

  // links
  renderLinksAdmin(data.links || []);
}

async function login() {
  const nip = document.getElementById("nip").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!nip || !password) {
    setMsg("loginMsg", "NIP dan password wajib.", false);
    return;
  }

  setMsg("loginMsg", "Memproses...");

  const res = await api("login", { nip, password });

  if (!res.ok) {
    setMsg("loginMsg", res.message || "Login gagal.", false);
    return;
  }

  TOKEN = res.token;
  USER = res.user;

  localStorage.setItem("KPU_TOKEN", TOKEN);
  localStorage.setItem("KPU_USER", JSON.stringify(USER));

  setMsg("loginMsg", "Login berhasil.");
  await loadAdmin();
}

function logout() {
  localStorage.removeItem("KPU_TOKEN");
  localStorage.removeItem("KPU_USER");
  TOKEN = "";
  USER = null;
  showLogin("Logout berhasil.");
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("btnLogin").onclick = login;
  document.getElementById("btnLogout").onclick = logout;

  document.getElementById("btnSaveConfig").onclick = saveConfig;
  document.getElementById("btnUploadLogo").onclick = uploadLogo;

  document.getElementById("btnAddLink").onclick = () => {
    resetForm();
    openForm(true);
  };

  document.getElementById("btnCancelLink").onclick = () => {
    resetForm();
    openForm(false);
  };

  document.getElementById("btnSaveLink").onclick = saveLink;

  // Auto login if token exists
  if (TOKEN && USER) {
    await loadAdmin();
  } else {
    showLogin("");
  }
});
