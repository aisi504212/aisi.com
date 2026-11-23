/* 红笺工坊 — shared UI helpers and original SVG art */
(function (global) {
  const $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };
  const $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatPrice(n) {
    const num = Number(n) || 0;
    if (Number.isInteger(num)) return String(num);
    return num.toFixed(2);
  }

  function priceHtml(n) {
    return '<span class="price"><span class="yen">¥</span><span class="num">' + formatPrice(n) + "</span></span>";
  }

  function formatSales(n) {
    n = Number(n) || 0;
    if (n >= 10000) return "销量 " + (Math.floor(n / 1000) / 10).toString().replace(/\.0$/, "") + "万+";
    if (n >= 1000) return "销量 " + n;
    return "销量 " + n;
  }

  function formatTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = function (x) { return x < 10 ? "0" + x : "" + x; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function productById(id) {
    return (HJ_DATA.PRODUCTS || []).find(function (p) { return p.id === id; }) || null;
  }

  function categoryName(id) {
    const c = (HJ_DATA.CATEGORIES || []).find(function (x) { return x.id === id; });
    return c ? c.name : "";
  }

  const THEMES = {
    rose: { a: "#3a1530", b: "#c44569", c: "#ffd0dc" },
    wine: { a: "#2a1024", b: "#8a2a4a", c: "#f5c6d3" },
    ink: { a: "#161428", b: "#4a3f72", c: "#e4dcff" },
    blush: { a: "#3a2030", b: "#d46a8a", c: "#ffe3ec" },
    sand: { a: "#2c2418", b: "#c4a06a", c: "#fff1d6" },
    gold: { a: "#2a2210", b: "#d4a017", c: "#ffe9a8" },
    coral: { a: "#3a1c14", b: "#e07050", c: "#ffd8cc" },
    teal: { a: "#0e2a2a", b: "#1fa3a0", c: "#c8fff6" },
    cyan: { a: "#0c2436", b: "#1a8fbf", c: "#d4f6ff" },
    violet: { a: "#221436", b: "#7a5cff", c: "#e4dcff" },
    indigo: { a: "#14183a", b: "#3d5ad8", c: "#dce4ff" },
    slate: { a: "#1a2030", b: "#4c5d7a", c: "#dce6f5" },
    amber: { a: "#2a1c10", b: "#e08a20", c: "#ffe2b0" },
    ember: { a: "#2a1210", b: "#c45a2a", c: "#ffd2bc" },
    fire: { a: "#2c100c", b: "#ff4d00", c: "#ffd0bc" }
  };

  function coverSvg(cover, w, h) {
    cover = cover || { theme: "rose", kicker: "红笺", title: "成稿" };
    const t = THEMES[cover.theme] || THEMES.rose;
    const kicker = escapeHtml(cover.kicker || "");
    const title = escapeHtml(cover.title || "");
    w = w || 452;
    h = h || 272;
    const kFont = Math.round(h * 0.1);
    const tFont = Math.round(h * 0.155);
    return (
      '<svg class="cover-art" viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="g' + cover.theme + w + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + t.a + '"/>' +
      '<stop offset="100%" stop-color="' + t.b + '"/>' +
      "</linearGradient>" +
      "</defs>" +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g' + cover.theme + w + ')"/>' +
      '<circle cx="' + (w * 0.86) + '" cy="' + (h * 0.22) + '" r="' + (h * 0.32) + '" fill="rgba(255,255,255,0.06)"/>' +
      '<circle cx="' + (w * 0.12) + '" cy="' + (h * 0.86) + '" r="' + (h * 0.28) + '" fill="rgba(0,0,0,0.12)"/>' +
      '<path d="M24 ' + (h - 28) + " C " + (w * 0.3) + " " + (h - 70) + ", " + (w * 0.6) + " " + (h - 10) + ", " + (w - 24) + " " + (h - 36) + '" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>' +
      '<text x="28" y="' + (h * 0.36) + '" fill="' + t.c + '" font-size="' + kFont + '" font-family="PingFang SC, Microsoft YaHei, sans-serif" opacity="0.92">' + kicker + "</text>" +
      '<text x="28" y="' + (h * 0.58) + '" fill="#ffffff" font-size="' + tFont + '" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">' + title + "</text>" +
      "</svg>"
    );
  }

  function logoMark(size) {
    size = size || 36;
    return (
      '<svg class="logo-mark" width="' + size + '" height="' + size + '" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect x="1" y="1" width="34" height="34" rx="8" fill="#0c1028" stroke="#56EBFF" stroke-width="1.6"/>' +
      '<path d="M8 24c4-9 7-13 10-13 2 0 3 2 4 5 2-4 5-6 7-4" fill="none" stroke="#56EBFF" stroke-width="1.8" stroke-linecap="round"/>' +
      '<text x="18" y="27" text-anchor="middle" fill="#56EBFF" font-size="9" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">笺</text>' +
      "</svg>"
    );
  }

  function shopAvatar() {
    return (
      '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="80" height="80" rx="14" fill="#0c1028"/>' +
      '<rect x="2" y="2" width="76" height="76" rx="13" fill="none" stroke="#56EBFF" stroke-width="1.4"/>' +
      '<text x="40" y="36" text-anchor="middle" fill="#56EBFF" font-size="16" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">红笺</text>' +
      '<text x="40" y="56" text-anchor="middle" fill="#9af3ff" font-size="11" font-family="PingFang SC, Microsoft YaHei, sans-serif">工坊</text>' +
      "</svg>"
    );
  }

  function icon(name) {
    const icons = {
      chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 16.5V7.8A2.8 2.8 0 0 1 7.8 5h8.4A2.8 2.8 0 0 1 19 7.8v6.2a2.8 2.8 0 0 1-2.8 2.8H9l-4 3v-3.3z"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8.2" r="3.1"/><path d="M5.5 19c1.4-3 3.7-4.4 6.5-4.4s5.1 1.4 6.5 4.4"/></svg>',
      sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.6"/><path d="M12 3.5v2M12 18.5v2M4.8 4.8l1.5 1.5M17.7 17.7l1.5 1.5M3.5 12h2M18.5 12h2M4.8 19.2l1.5-1.5M17.7 6.3l1.5-1.5"/></svg>',
      moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16.8 13.6A6.6 6.6 0 0 1 10.2 5 6.8 6.8 0 1 0 16.8 13.6z"/></svg>',
      cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 7h15l-1.4 8.2A2 2 0 0 1 16.6 17H9.2A2 2 0 0 1 7.2 15.3L5 7z"/><path d="M5 7 4 4.5H2.5"/><circle cx="9" cy="19.5" r="1.2"/><circle cx="16.5" cy="19.5" r="1.2"/></svg>',
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.2"/><path d="M16 16.5 20 20.5"/></svg>',
      grid: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/></svg>',
      list: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="5" width="16" height="2.2" rx="1"/><rect x="4" y="11" width="16" height="2.2" rx="1"/><rect x="4" y="17" width="16" height="2.2" rx="1"/></svg>',
      left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
      right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
      heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 19s-6.5-4.1-8.3-8A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 20.3 11c-1.8 3.9-8.3 8-8.3 8z"/></svg>',
      heartOn: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 19s-6.5-4.1-8.3-8A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 20.3 11c-1.8 3.9-8.3 8-8.3 8z"/></svg>',
      plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
      minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>',
      trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 7h14M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7m-7.5 0 .6 12.2A1.8 1.8 0 0 0 9.9 21h4.2a1.8 1.8 0 0 0 1.8-1.8L16.5 7"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.5 10 17.5 19 7.5"/></svg>'
    };
    return icons[name] || "";
  }

  function creditBadges() {
    return (
      '<span class="credit-badges" aria-label="商家信誉标识">' +
      '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#2a3348"/><path d="M9 3.5 10.6 7h3.6l-2.9 2.2 1.1 3.6L9 10.8 5.6 12.8 6.7 9.2 3.8 7h3.6z" fill="#f5c56b"/></svg>' +
      '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#2a3348"/><path d="M5 11c2-4 4-6 4-6s2 2 4 6c-1.2.8-2.6 1.2-4 1.2S6.2 11.8 5 11z" fill="#7ad7c7"/></svg>' +
      '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#2a3348"/><path d="M6 12V6.5L9 8.2 12 6.5V12H6z" fill="#8ec4ff"/></svg>' +
      '<svg viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#2a3348"/><path d="M5.5 12.2c2-5 3.2-7.5 3.5-8.2.3.7 1.5 3.2 3.5 8.2" fill="none" stroke="#f3b3c8" stroke-width="1.4" stroke-linecap="round"/></svg>' +
      "</span>"
    );
  }

  function heroArts() {
    const pen =
      '<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="18" y="22" width="70" height="58" rx="8" fill="#1b2144" stroke="#56EBFF" stroke-opacity=".35"/>' +
      '<rect x="26" y="32" width="40" height="6" rx="3" fill="#56EBFF" fill-opacity=".7"/>' +
      '<rect x="26" y="44" width="54" height="4" rx="2" fill="#9aa6d0" fill-opacity=".5"/>' +
      '<rect x="26" y="54" width="46" height="4" rx="2" fill="#9aa6d0" fill-opacity=".35"/>' +
      '<path d="M86 18l16 8-28 54-10-5z" fill="#c9a36a"/>' +
      '<path d="M102 26l6 3-4 8-7-3z" fill="#56EBFF"/>' +
      "</svg></div>";
    const seal =
      '<div class="hero-art" aria-hidden="true"><svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="58" cy="52" r="30" fill="#3a1d18" stroke="#e8b15a" stroke-width="3"/>' +
      '<circle cx="58" cy="52" r="22" fill="none" stroke="#e8b15a" stroke-width="1.4"/>' +
      '<text x="58" y="58" text-anchor="middle" fill="#f3d48a" font-size="18" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">优</text>' +
      '<rect x="86" y="22" width="8" height="28" rx="2" fill="#c9a36a"/>' +
      "</svg></div>";
    return pen + seal;
  }

  function heroMedal() {
    return (
      '<div class="hero-medal" aria-hidden="true"><svg viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M34 8h18l8 34H28z" fill="#c45a4a"/>' +
      '<path d="M66 8h18l6 34H58z" fill="#3a6db5"/>' +
      '<circle cx="59" cy="70" r="34" fill="#f0c14b"/>' +
      '<circle cx="59" cy="70" r="28" fill="#f7dc7a"/>' +
      '<circle cx="59" cy="70" r="22" fill="#e8b03a"/>' +
      '<text x="59" y="77" text-anchor="middle" fill="#7a4a10" font-size="20" font-weight="800" font-family="PingFang SC, Microsoft YaHei, sans-serif">优</text>' +
      "</svg></div>"
    );
  }

  function heatIcons(n) {
    n = n || 4;
    let s = "";
    for (let i = 0; i < 5; i++) {
      const on = i < n;
      s +=
        '<svg viewBox="0 0 16 16" style="opacity:' + (on ? 1 : 0.25) + '"><path d="M8 2c2 3 5 4.2 5 7.2A5 5 0 1 1 3.6 7.6C4.6 5 6.4 3.6 8 2z" fill="' +
        (on ? "#ff5b4a" : "#9aa0b6") +
        '"/></svg>';
    }
    return s;
  }

  function repMedals() {
    return (
      '<span class="rep-label">信誉等级：' +
      '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#f0c14b"/><path d="M8 3.5 9.3 6.4h3.1L9.9 8.2l.9 3L8 9.7 5.2 11.2l.9-3L3.6 6.4h3.1z" fill="#7a4a10"/></svg>' +
      '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#e8b03a"/><path d="M8 3.5 9.3 6.4h3.1L9.9 8.2l.9 3L8 9.7 5.2 11.2l.9-3L3.6 6.4h3.1z" fill="#7a4a10"/></svg>' +
      '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#d9a026"/><path d="M8 3.5 9.3 6.4h3.1L9.9 8.2l.9 3L8 9.7 5.2 11.2l.9-3L3.6 6.4h3.1z" fill="#7a4a10"/></svg>' +
      "</span>"
    );
  }

  function dockIcons() {
    return {
      about:
        '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="24" cy="24" r="22" fill="#1b3a58"/>' +
        '<path d="M14 16h20v18H14z" fill="#eef7ff" rx="2"/>' +
        '<rect x="14" y="16" width="20" height="18" rx="3" fill="#f4fbff"/>' +
        '<path d="M18 21h12M18 25h9" stroke="#4aa0c8" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M30 12c3 4 5 6 7 6l-4 10-6-3z" fill="#c9a36a"/>' +
        "</svg>",
      packages:
        '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="4" y="8" width="40" height="34" rx="8" fill="#16324f"/>' +
        '<rect x="12" y="16" width="24" height="20" rx="3" fill="#f3f7ff"/>' +
        '<path d="M12 22h24" stroke="#56EBFF" stroke-width="2"/>' +
        '<path d="M24 16v20" stroke="#ffb24a" stroke-width="2"/>' +
        "</svg>",
      help:
        '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="24" cy="24" r="20" fill="#1a2a18"/>' +
        '<circle cx="24" cy="24" r="20" fill="#204830"/>' +
        '<circle cx="24" cy="24" r="12" fill="#f0c14b"/>' +
        '<text x="24" y="29" text-anchor="middle" font-size="16" font-weight="800" fill="#6a430c" font-family="Georgia, serif">?</text>' +
        "</svg>"
    };
  }

  function trustIcon(id) {
    const map = {
      fast:
        '<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#56EBFF" stroke-width="2"/><path d="M23 12v12l8 4" stroke="#56EBFF" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
      edit:
        '<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#8ec4ff" stroke-width="2"/><path d="M15 29l2.2-8L29 9.2 35 15 23 27.2 15 29z" fill="none" stroke="#8ec4ff" stroke-width="2"/><path d="M26.5 11.5 32.8 17.8" stroke="#8ec4ff" stroke-width="2"/></svg>',
      align:
        '<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#f0c14b" stroke-width="2"/><path d="M23 11l3 7 7 1-5.2 5 1.4 7L23 27.8 16.8 31l1.4-7L13 19l7-1z" fill="#f0c14b"/></svg>',
      chat:
        '<svg viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#7ad7c7" stroke-width="2"/><path d="M14 17.5c0-2 1.6-3.5 3.6-3.5h10.8c2 0 3.6 1.5 3.6 3.5v8c0 2-1.6 3.5-3.6 3.5H20l-6 4v-4h-.4c-2 0-3.6-1.5-3.6-3.5v-8z" fill="none" stroke="#7ad7c7" stroke-width="2"/></svg>'
    };
    return map[id] || "";
  }

  function mascotSvg() {
    return (
      '<svg viewBox="0 0 92 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<circle cx="46" cy="46" r="44" fill="#1b2144"/>' +
      '<ellipse cx="46" cy="58" rx="22" ry="16" fill="#f4fbff"/>' +
      '<circle cx="46" cy="38" r="16" fill="#f4fbff"/>' +
      '<circle cx="40" cy="37" r="2" fill="#1b2144"/>' +
      '<circle cx="52" cy="37" r="2" fill="#1b2144"/>' +
      '<path d="M42 43c2 2 6 2 8 0" fill="none" stroke="#1b2144" stroke-width="1.4" stroke-linecap="round"/>' +
      '<text x="46" y="80" text-anchor="middle" fill="#56EBFF" font-size="10">红笺</text>' +
      "</svg>"
    );
  }

  function footerWaves() {
    return (
      '<svg viewBox="0 0 1600 400" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M0 280 C 260 180, 420 340, 720 250 S 1200 140, 1600 230 L 1600 400 L 0 400 Z" fill="rgba(86,235,255,0.05)"/>' +
      '<path d="M0 310 C 300 230, 540 360, 860 280 S 1280 200, 1600 300 L 1600 400 L 0 400 Z" fill="rgba(80,90,140,0.18)"/>' +
      "</svg>"
    );
  }

  function toast(msg) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity .25s ease";
      setTimeout(function () { el.remove(); }, 250);
    }, 2200);
  }

  function applyTheme() {
    const theme = HJ_STORE.getTheme();
    document.documentElement.setAttribute("data-theme", theme);
  }

  function toggleTheme() {
    const next = HJ_STORE.getTheme() === "dark" ? "light" : "dark";
    HJ_STORE.setTheme(next);
    applyTheme();
  }

  function navActive(route) {
    if (route === "home") return "home";
    if (route === "about") return "about";
    if (route === "packages" || route === "shop" && false) return "packages";
    if (route === "packages") return "packages";
    if (route === "help") return "help";
    if (route === "messages") return "messages";
    if (route === "account" || route === "login" || route === "register" || route === "orders" || route === "order" || route === "review") return "account";
    if (route === "cart" || route === "checkout" || route === "pay" || route === "success") return "cart";
    return "";
  }

  function headerHtml(route) {
    const shop = HJ_DATA.SHOP;
    const act = navActive(route);
    const unread = HJ_STORE.unreadCount();
    const cartN = HJ_STORE.cartCount();
    const logged = HJ_STORE.isLoggedIn();
    const theme = HJ_STORE.getTheme();
    return (
      '<header class="site-header"><div class="header-inner">' +
      '<a class="logo" href="#/">' + logoMark(36) + '<span class="logo-word">' + escapeHtml(shop.name) + "</span></a>" +
      '<nav class="nav-main">' +
      '<a href="#/" class="' + (act === "home" ? "active" : "") + '">店铺首页</a>' +
      '<a href="#/about" class="' + (act === "about" ? "active" : "") + '">服务介绍</a>' +
      '<a href="#/packages" class="' + (act === "packages" ? "active" : "") + '">热门套餐</a>' +
      '<a href="#/help" class="' + (act === "help" ? "active" : "") + '">帮助中心</a>' +
      "</nav>" +
      '<div class="header-actions">' +
      '<a class="icon-btn' + (act === "messages" ? " active" : "") + '" href="#/messages">' + icon("chat") + "<span>消息</span>" +
      (unread ? '<em class="badge-dot">' + (unread > 9 ? "9+" : unread) + "</em>" : "") +
      "</a>" +
      '<a class="icon-btn' + (act === "account" ? " active" : "") + '" href="#/' + (logged ? "account" : "login") + '">' +
      icon("user") + "<span>" + (logged ? escapeHtml(HJ_STORE.currentUser().nickname || "个人中心") : "个人中心") + "</span></a>" +
      '<a class="icon-btn' + (act === "cart" ? " active" : "") + '" href="#/cart">' + icon("cart") + "<span>购物车</span>" +
      (cartN ? '<em class="badge-dot">' + (cartN > 9 ? "9+" : cartN) + "</em>" : "") +
      "</a>" +
      '<button class="icon-btn theme-btn" type="button" data-action="toggle-theme" title="切换浅色/深色主题">' +
      (theme === "dark" ? icon("sun") : icon("moon")) +
      "<span>" + (theme === "dark" ? "浅色" : "深色") + "</span></button>" +
      "</div></div></header>"
    );
  }

  function footerHtml() {
    const shop = HJ_DATA.SHOP;
    const trust = HJ_DATA.TRUST.map(function (t) {
      return (
        '<div class="trust-item"><div class="trust-ico">' + trustIcon(t.id) + "</div><div><h4>" +
        escapeHtml(t.title) + "</h4><p>" + escapeHtml(t.desc) + "</p></div></div>"
      );
    }).join("");
    return (
      '<footer class="site-footer"><div class="footer-pattern">' + footerWaves() + "</div>" +
      '<div class="footer-inner container">' +
      '<div class="trust-row">' + trust + "</div>" +
      '<div class="legal-grid">' +
      "<div><strong>关于本站</strong>红笺工坊演示店用于展示小红书笔记文案与对标成稿的下单流程。内容、价格与档期均为示例，不构成真实要约。</div>" +
      "<div><strong>演示说明</strong>购物车、收藏、登录和订单仅保存在当前浏览器的本地存储中。支付为演示流程，不会接入任何第三方支付，也不会真实扣款。</div>" +
      "<div><strong>使用注意</strong>请勿将本站文案示例用于虚假宣传。本页不展示、不冒用任何备案号、许可证或企业资质编号。</div>" +
      "</div>" +
      '<div class="footer-copy">Copyright © ' + shop.year + " " + escapeHtml(shop.name) + "演示站点。保留演示版式说明，不代表真实经营主体。</div>" +
      '<div class="demo-badges">' +
      '<span class="demo-badge">演示站点</span>' +
      '<span class="demo-badge">不会真实扣款</span>' +
      '<span class="demo-badge">本地存储</span>' +
      '<span class="demo-badge">非备案信息</span>' +
      "</div>" +
      '<p class="demo-note">本页面为功能与版式演示，底部未放置任何真实或仿造的许可证编号。</p>' +
      "</div></footer>"
    );
  }

  function dockHtml() {
    const ico = dockIcons();
    return (
      '<nav class="float-dock" aria-label="快捷入口">' +
      '<a class="dock-item" href="#/about"><span class="dock-ico">' + ico.about + "</span>服务介绍</a>" +
      '<a class="dock-item" href="#/packages"><span class="dock-ico">' + ico.packages + "</span>热门套餐</a>" +
      '<a class="dock-item" href="#/help"><span class="dock-ico">' + ico.help + "</span>帮助中心</a>" +
      "</nav>"
    );
  }

  function productTags(p, compact) {
    let html = "";
    if (p.featured) html += '<span class="tag tag-dark">工坊精选</span>';
    if (p.autoDeliver) html += '<span class="tag tag-cyan">自动交付</span>';
    if (!compact && p.rush) html += '<span class="tag tag-orange">可加急</span>';
    if (!compact && (p.tags || []).indexOf("热门") !== -1) html += '<span class="tag tag-ghost">热门</span>';
    return html;
  }

  function gridCard(p) {
    const hot = (p.tags || []).indexOf("热门") !== -1;
    return (
      '<article class="product-card" data-href="#/product/' + p.id + '">' +
      '<div class="card-cover">' + (hot ? '<span class="ribbon">热</span>' : "") + coverSvg(p.cover, 452, 272) + "</div>" +
      '<h3 class="card-title">' + escapeHtml(p.title) + "</h3>" +
      '<p class="card-meta">' + escapeHtml(p.short) + "</p>" +
      '<div class="card-foot">' + priceHtml(p.price) + '<span class="sales">' + formatSales(p.sales) + "</span></div>" +
      "</article>"
    );
  }

  function listRow(p) {
    return (
      '<article class="list-row" data-href="#/product/' + p.id + '">' +
      '<div class="list-thumb">' + coverSvg(p.cover, 296, 172) + "</div>" +
      '<div class="list-body">' +
      '<h3 class="list-title">' + escapeHtml(p.title) + "</h3>" +
      '<p class="list-sub">' + escapeHtml(p.short) + " | " + escapeHtml(categoryName(p.category)) + " | " + escapeHtml(p.turnaround) + "</p>" +
      '<div class="list-tags">' + productTags(p, true) + repMedals() + "</div>" +
      "</div>" +
      '<div class="list-right">' +
      '<span class="sales">' + formatSales(p.sales) + "</span>" +
      '<span class="stock">档期 ' + p.stock + "</span>" +
      priceHtml(p.price) +
      "</div></article>"
    );
  }

  function statusLabel(s) {
    const map = {
      pending: "待支付",
      paid: "已支付",
      delivered: "已交付",
      revising: "修改中",
      reviewed: "已评价",
      cancelled: "已取消"
    };
    return map[s] || s;
  }

  function statusClass(s) {
    if (s === "pending") return "status-chip status-pending";
    if (s === "delivered" || s === "reviewed" || s === "paid") return "status-chip status-delivered";
    if (s === "cancelled") return "status-chip status-cancelled";
    return "status-chip";
  }

  function emptyHtml(text) {
    return '<div class="empty"><div class="mascot">' + mascotSvg() + "</div><p>" + escapeHtml(text) + "</p></div>";
  }

  function layout(route, mainHtml, opts) {
    opts = opts || {};
    return (
      '<div class="app-root">' +
      headerHtml(route) +
      '<main class="page-main"><div class="container">' + mainHtml + "</div></main>" +
      footerHtml() +
      (opts.hideDock ? "" : dockHtml()) +
      "</div>"
    );
  }

  global.HJ_UI = {
    $: $,
    $$: $$,
    escapeHtml: escapeHtml,
    formatPrice: formatPrice,
    priceHtml: priceHtml,
    formatSales: formatSales,
    formatTime: formatTime,
    productById: productById,
    categoryName: categoryName,
    coverSvg: coverSvg,
    logoMark: logoMark,
    shopAvatar: shopAvatar,
    icon: icon,
    creditBadges: creditBadges,
    heroArts: heroArts,
    heroMedal: heroMedal,
    heatIcons: heatIcons,
    repMedals: repMedals,
    mascotSvg: mascotSvg,
    toast: toast,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    headerHtml: headerHtml,
    footerHtml: footerHtml,
    dockHtml: dockHtml,
    productTags: productTags,
    gridCard: gridCard,
    listRow: listRow,
    statusLabel: statusLabel,
    statusClass: statusClass,
    emptyHtml: emptyHtml,
    layout: layout
  };
})(window);
