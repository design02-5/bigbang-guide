/* app.js — 版面與互動邏輯。內容資料一律不寫在這支檔案，改資料請去 data.js */

const ICONS = {
  call: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a1 1 0 0 0 1 1h3l5 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M16 8a4 4 0 0 1 0 8"/><path d="M19 5a8 8 0 0 1 0 14"/></svg>`,
  cheer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/><path d="M12 7.5v5"/><circle cx="12" cy="15.2" r="0.6" fill="currentColor" stroke="none"/></svg>`,
  clap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>`,
  chevron: `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  sliders: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h13M21 18h-1"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
};

/* ===== 隱藏編輯模式（歌迷看的正式網址完全不受影響）=====
   網址後面加 ?edit=1 解鎖一次，這台裝置的瀏覽器會記住（localStorage），之後不用每次都加。
   GitHub 存檔設定沿用 tools/lyrics-builder.html 那邊存的同一組（同一台裝置的瀏覽器共用）。 */
const EDIT_MODE_KEY = "bg_cosmos_edit_mode";
if (new URLSearchParams(location.search).get("edit") === "1") {
  localStorage.setItem(EDIT_MODE_KEY, "1");
}
function isEditModeOn() {
  return localStorage.getItem(EDIT_MODE_KEY) === "1";
}
function exitEditMode() {
  localStorage.removeItem(EDIT_MODE_KEY);
  location.href = location.pathname + location.hash;
}
let editingLineIndex = null; // 歌曲頁目前正在編輯哪一句（null = 沒有在編輯）

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[s]));
}
function placeholder(text) { return `<span class="placeholder-pill">${escapeHtml(text)}</span>`; }
function wrapWords(text) {
  return text.split(/(\s+)/).map((w) => (w.trim() ? `<span class="word">${escapeHtml(w)}</span>` : w)).join("");
}
/*
 * 歌詞文字上色：預設整句都用 chantKey 的顏色（跟以前一樣）。
 * 如果文字裡有 **文字** 這種標記，就只有被包住的部分上色，其他字用一般顏色
 * ——同一句裡「只有某幾個字是應援詞/大合唱、其他是正常歌詞」時用這個標記法。
 */
function renderChantText(text, chantKey) {
  // 只有文字裡有 **標記** 的部分才上色；沒有 ** 就整句維持正常顏色，
  // chant 這時只用來決定右上角的應援標籤（大合唱／應援詞），不會讓整句變色。
  if (!chantKey || !text.includes("**")) return wrapWords(text);
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => {
    if (!part) return "";
    return i % 2 === 1
      ? `<span class="chant-mark ${chantKey}">${wrapWords(part)}</span>`
      : wrapWords(part);
  }).join("");
}

/* ===== 主題（深色／淺色） ===== */
function initTheme() {
  if (localStorage.getItem("bg_cosmos_theme") === "light") {
    document.body.classList.add("light-mode");
  }
}
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("bg_cosmos_theme", document.body.classList.contains("light-mode") ? "light" : "dark");
}
function themeToggleHtml() {
  const isLight = document.body.classList.contains("light-mode");
  return `<button class="icon-btn" id="theme-toggle">${isLight ? ICONS.moon : ICONS.sun}${isLight ? "深色模式" : "淺色模式"}</button>`;
}
function wireThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    toggleTheme();
    const fresh = document.createElement("div");
    fresh.innerHTML = themeToggleHtml();
    btn.replaceWith(fresh.firstElementChild);
    wireThemeToggle();
  });
}

/* ===== 路由 ===== */
function getRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  if (hash === "/" ) return { name: "home" };
  if (hash === "/guide") return { name: "guide" };
  const m = hash.match(/^\/song\/(.+)$/);
  if (m) return { name: "song", id: decodeURIComponent(m[1]) };
  return { name: "home" };
}

function render() {
  stopCountdownInterval();
  stopPolling();
  const route = getRoute();
  const app = document.getElementById("app");
  if (route.name === "guide") app.innerHTML = renderGuide();
  else if (route.name === "song") app.innerHTML = renderSong(route.id);
  else app.innerHTML = renderHome();
  document.body.classList.toggle("is-song-page", route.name === "song");
  document.body.classList.toggle("is-home", route.name === "home");
  afterRender(route);
  window.scrollTo(0, 0);
}

function afterRender(route) {
  wireThemeToggle();
  if (route.name === "home") {
    wireAccordion();
    wireShareButton();
    wireCopyAddrButton();
    wireSeatMapClick();
    startCountdownInterval();
  } else if (route.name === "guide") {
    renderSongList();
    wireGuideControls();
  } else if (route.name === "song") {
    const song = SONGS.find((s) => s.id === route.id) || SONGS[0];
    renderLyricsList(song);
    setupPlayer(song);
    wireLyricsClick();
    wireLyricsEdit(song);
    wireEditModeBanner();
    wireToolbar(song);
    wireSongStrip();
    wireSettingsPanel();
  }
}

/* ===== 首頁 ===== */
function getUpcomingTourStops() {
  const todayStr = new Date().toISOString().slice(0, 10);
  return TOUR_STOPS
    .filter((s) => s.dateEnd >= todayStr)
    .sort((a, b) => a.dateEnd.localeCompare(b.dateEnd));
}

function renderHome() {
  const info = TOUR_INFO;
  const stops = getUpcomingTourStops();
  return `
    <div class="top-bar top-bar--float"><div></div>${themeToggleHtml()}</div>
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-logo">
          <img class="logo-dark" src="images/白_無場次.png" alt="${escapeHtml(info.group)} ${escapeHtml(info.tourName)} ${escapeHtml(info.tourSubtitle)}">
          <img class="logo-light" src="images/黑_無場次.png" alt="${escapeHtml(info.group)} ${escapeHtml(info.tourName)} ${escapeHtml(info.tourSubtitle)}">
        </div>
        ${info.showCountdown ? `<div id="countdown-box" class="countdown"></div>` : ""}
        <a class="guide-nav-btn" href="#/guide">BIGBANG 應援歌單</a>
      </div>
    </section>
    <div class="tour-stops">
      <div class="tour-stops-inner">
        <div class="tour-stops-head">
          <span>巡演場次</span>
          <span class="tour-stops-count">${stops.length ? `尚有 ${stops.length} 場` : "本季場次已全數結束"}</span>
        </div>
        <ul class="tour-stops-list">
          ${stops.map((s) => `
            <li class="tour-stop-row">
              <span class="tsr-date">${escapeHtml(s.dateLabel)}</span>
              <span class="tsr-city">${escapeHtml(s.city)}${s.showAdded ? `<span class="show-added">SHOW ADDED</span>` : ""}</span>
              <span class="tsr-venue">${escapeHtml(s.venue)}</span>
            </li>`).join("")}
        </ul>
      </div>
    </div>
    ${info.showInfoSections ? `
    <div class="accordion">
      ${accordionItem("演出資訊", showInfoPanel())}
      ${accordionItem("公告・指南", announcePanel())}
      ${accordionItem("座位配置圖", seatMapPanel())}
      ${accordionItem("交通方式", transportPanel())}
      ${accordionItem("應援禮儀・第一次參加", etiquettePanel())}
      ${accordionItem(info.membership.name, membershipPanel())}
    </div>` : ""}
    <div style="display:flex;justify-content:${info.showOfficialSiteLink ? "space-between" : "flex-end"};align-items:center;margin-top:24px;">
      ${info.showOfficialSiteLink ? `<a class="icon-btn" href="${info.officialSiteUrl || "#"}" target="_blank" rel="noopener">官方網站</a>` : ""}
      <button class="icon-btn" id="share-btn">${ICONS.share}分享</button>
    </div>
    ${footerHtml()}
  `;
}

function accordionItem(title, panelHtml) {
  return `
    <div class="accordion-item">
      <button class="accordion-trigger"><span>${escapeHtml(title)}</span>${ICONS.chevron}</button>
      <div class="accordion-panel">${panelHtml}</div>
    </div>`;
}

function showInfoPanel() {
  const info = TOUR_INFO;
  const priceRows = info.ticketPrices.length
    ? info.ticketPrices.map((p) => `<tr><td>${escapeHtml(p.level)}</td><td>${escapeHtml(p.price)}</td></tr>`).join("")
    : `<tr><td colspan="2">${placeholder("票價待補")}</td></tr>`;
  return `
    <div class="section-label">| 演出概要 |</div>
    <dl class="info-list">
      <dt>演出名稱</dt><dd>${escapeHtml(info.tourName)} ${escapeHtml(info.tourSubtitle)}</dd>
      <dt>場地</dt><dd>${escapeHtml(info.venue)}<span class="note">${escapeHtml(info.venueAddress)}</span></dd>
      <dt>入場規則</dt><dd>${escapeHtml(info.entryRule)}</dd>
      <dt>取票方式</dt><dd>${escapeHtml(info.ticketVendor)}</dd>
    </dl>
    <table class="info-table"><thead><tr><th>票區</th><th>票價</th></tr></thead><tbody>${priceRows}</tbody></table>
    ${info.ticketUrl ? `<p><a href="${info.ticketUrl}" target="_blank" rel="noopener">前往售票頁面</a></p>` : `<p>${placeholder("售票連結待補")}</p>`}
  `;
}
function announcePanel() {
  return `<p>場館地圖、周邊販售、身分確認等官方公告會在公布後補上。</p><p>${placeholder("官方公告圖片待補")}</p>`;
}
function seatMapPanel() {
  const info = TOUR_INFO;
  if (info.seatMapImage) {
    return `<div class="seat-map-box"><img src="${info.seatMapImage}" alt="座位配置圖" id="seat-map-img"></div><p style="font-size:12px;margin-top:8px;">點擊圖片可開啟原尺寸查看。</p>`;
  }
  return `<div class="seat-map-box">${escapeHtml(info.seatMapNote)}</div>`;
}
function transportPanel() {
  const info = TOUR_INFO;
  const t = info.transport;
  const list = (arr) => arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
      <div><strong>${escapeHtml(info.venue)}</strong><br><span>${escapeHtml(info.venueAddress)}</span></div>
      <button class="copy-addr-btn" id="copy-addr-btn">複製地址</button>
    </div>
    <h4>捷運／大眾運輸</h4><ul>${list(t.mrt)}</ul>
    <h4>公車</h4><ul>${list(t.bus)}</ul>
    <h4>開車／停車</h4><ul>${list(t.driving)}</ul>
  `;
}
function etiquettePanel() {
  const e = TOUR_INFO.etiquette;
  const list = (arr) => arr.map((x) => `<li>${escapeHtml(x)}</li>`).join("");
  return `
    <p>${escapeHtml(e.intro)}</p>
    <h4>第一次參加</h4><ul>${list(e.firstTime)}</ul>
    <h4>一起遵守</h4><ul>${list(e.together)}</ul>
    <h4>如果是站席</h4><ul>${list(e.standing)}</ul>
    <p style="margin-top:14px;">${escapeHtml(e.disclaimer)}</p>
  `;
}
function membershipPanel() {
  const m = TOUR_INFO.membership;
  return `
    <div class="section-label">| 場館限定特典 |</div>
    <p>${escapeHtml(m.perkTitle)}</p>
    <p>${escapeHtml(m.description)}</p>
    ${m.officialUrl ? `<p><a href="${m.officialUrl}" target="_blank" rel="noopener">查看官方頁面</a></p>` : `<p>${placeholder("官方連結待補")}</p>`}
  `;
}
function footerHtml() {
  const info = TOUR_INFO;
  return `
    <div class="footer">
      <p>${escapeHtml(info.tourName)} ${escapeHtml(info.tourSubtitle)} · FAN CHANT GUIDE（非官方粉絲製作）${escapeHtml(info.version)}</p>
      <nav>
        ${info.githubRepoUrl ? `<a href="${info.githubRepoUrl}" target="_blank" rel="noopener">GitHub Repo</a>` : ""}
        ${info.forkFromUrl ? `<a href="${info.forkFromUrl}" target="_blank" rel="noopener">Fork 來源</a>` : ""}
        ${info.feedbackUrl ? `<a href="${info.feedbackUrl}" target="_blank" rel="noopener">意見回饋</a>` : ""}
      </nav>
    </div>`;
}

function wireAccordion() {
  document.querySelectorAll(".accordion-item").forEach((item) => {
    item.querySelector(".accordion-trigger").addEventListener("click", () => item.classList.toggle("open"));
  });
}
function wireCopyAddrButton() {
  const btn = document.getElementById("copy-addr-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(TOUR_INFO.venueAddress);
      btn.textContent = "已複製";
      setTimeout(() => (btn.textContent = "複製地址"), 1500);
    } catch (e) { alert(TOUR_INFO.venueAddress); }
  });
}
function wireSeatMapClick() {
  const img = document.getElementById("seat-map-img");
  if (!img) return;
  img.addEventListener("click", () => window.open(img.src, "_blank"));
}
function wireShareButton() {
  const btn = document.getElementById("share-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const shareData = { title: document.title, url: location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      try {
        await navigator.clipboard.writeText(location.href);
        btn.innerHTML = "已複製連結";
        setTimeout(() => (btn.innerHTML = ICONS.share + "分享"), 1500);
      } catch (e) { alert(location.href); }
    }
  });
}

/* ===== 倒數計時 ===== */
let countdownTimer = null;
function startCountdownInterval() {
  if (!TOUR_INFO.showCountdown) return;
  updateCountdownBox();
  countdownTimer = setInterval(updateCountdownBox, 1000);
}
function stopCountdownInterval() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
}
function updateCountdownBox() {
  const box = document.getElementById("countdown-box");
  if (!box) return;
  if (!TOUR_INFO.showDateTimeISO) {
    box.innerHTML = `<span class="dday">日期待定</span><span class="timer">請在 data.js 填入 showDateTimeISO 開啟倒數</span>`;
    return;
  }
  const diff = new Date(TOUR_INFO.showDateTimeISO).getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600) + days * 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  box.innerHTML = `<span class="dday">${diff <= 0 ? "D-DAY" : "D-" + days}</span><span class="timer">${pad(hours)}:${pad(minutes)}:${pad(seconds)}</span>`;
}

/* ===== 應援指南（歌曲清單） ===== */
let guideState = { search: "", categories: [] };
function getAllCategories() {
  const set = new Set();
  SONGS.forEach((s) => (s.categories || []).forEach((c) => set.add(c)));
  return Array.from(set);
}
function renderGuide() {
  const allCategories = getAllCategories();
  return `
    <div class="top-bar">
      <a class="icon-btn" href="#/">${ICONS.back}返回首頁</a>
      ${themeToggleHtml()}
    </div>
    <div class="guide-header">
      <h1>BIGBANG 應援歌單</h1>
      <p>選擇歌曲，搭配影片查看歌詞與大合唱重點</p>
    </div>
    <div class="search-box">
      <label for="song-search">搜尋歌曲</label>
      <input id="song-search" type="text" placeholder="輸入曲名..." value="${escapeHtml(guideState.search)}">
    </div>
    <div class="filter-bar" role="group" aria-label="分類篩選（可多選）">
      <button class="filter-default" data-filter-default aria-pressed="${guideState.categories.length === 0}">預設</button>
      ${allCategories.map((c) => `<button class="filter-category" data-category="${escapeHtml(c)}" aria-pressed="${guideState.categories.includes(c)}">${escapeHtml(c)}</button>`).join("")}
    </div>
    <div class="song-count" id="song-count"></div>
    <ul class="song-list" id="song-list"></ul>
    ${footerHtml()}
  `;
}
function legendItem(key) {
  return `<span class="legend-item ${key}">${ICONS[key]}${CHANT_TYPES[key].label}</span>`;
}
function getFilteredSortedSongs() {
  let list = SONGS.slice();
  if (guideState.search.trim()) {
    const q = guideState.search.trim().toLowerCase();
    list = list.filter((s) => s.title.toLowerCase().includes(q) || (s.titleOriginal || "").toLowerCase().includes(q));
  }
  if (guideState.categories.length) {
    list = list.filter((s) => (s.categories || []).some((c) => guideState.categories.includes(c)));
  }
  list.sort((a, b) => a.order - b.order);
  return list;
}
function renderSongList() {
  const list = getFilteredSortedSongs();
  const countEl = document.getElementById("song-count");
  if (countEl) countEl.textContent = `共 ${list.length} 首`;
  const listEl = document.getElementById("song-list");
  if (listEl) {
    listEl.innerHTML = list.map((s) => `
      <li><button class="song-item" data-song-id="${s.id}">
        <span class="num">${String(s.order).padStart(2, "0")}</span>
        <span class="title">${escapeHtml(s.title)}${s.titleOriginal ? `<small>${escapeHtml(s.titleOriginal)}</small>` : ""}</span>
      </button></li>`).join("");
  }
}
function wireGuideControls() {
  document.getElementById("song-search").addEventListener("input", (e) => {
    guideState.search = e.target.value;
    renderSongList();
  });
  document.querySelector(".filter-default").addEventListener("click", () => {
    guideState.categories = [];
    document.querySelectorAll(".filter-bar button").forEach((b) => b.setAttribute("aria-pressed", b.hasAttribute("data-filter-default")));
    renderSongList();
  });
  document.querySelectorAll(".filter-category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = btn.dataset.category;
      const i = guideState.categories.indexOf(c);
      if (i === -1) guideState.categories.push(c); else guideState.categories.splice(i, 1);
      btn.setAttribute("aria-pressed", guideState.categories.includes(c));
      document.querySelector(".filter-default").setAttribute("aria-pressed", guideState.categories.length === 0);
      renderSongList();
    });
  });
  document.getElementById("song-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-song-id]");
    if (btn) location.hash = "#/song/" + encodeURIComponent(btn.dataset.songId);
  });
}

/* ===== 歌曲詳細頁 ===== */
let toggleState = loadToggleState();
function loadToggleState() {
  const defaults = { onlyCall: false, simple: false, romaji: false, original: true, zh: true, kongEr: false, autoScroll: true };
  try {
    return Object.assign(defaults, JSON.parse(localStorage.getItem("bg_cosmos_toggles") || "{}"));
  } catch (e) { return defaults; }
}
function saveToggleState() {
  localStorage.setItem("bg_cosmos_toggles", JSON.stringify(toggleState));
}

const playerState = { ytPlayer: null, pollTimer: null };

function songStripHtml(currentId) {
  return `<div class="song-strip" id="song-strip">
    ${SONGS.map((s) => `<button class="strip-chip ${s.id === currentId ? "active" : ""}" data-song-id="${s.id}" title="${escapeHtml(s.title)}">${String(s.order).padStart(2, "0")}</button>`).join("")}
  </div>`;
}

function renderSong(id) {
  const idx = SONGS.findIndex((s) => s.id === id);
  const song = idx >= 0 ? SONGS[idx] : SONGS[0];
  const prev = SONGS[(idx <= 0 ? SONGS.length : idx) - 1];
  const next = SONGS[(idx + 1) % SONGS.length];
  editingLineIndex = null;
  return `
    ${isEditModeOn() ? `
      <div class="edit-mode-banner">
        ✏️ 編輯模式：點歌詞旁的鉛筆改字，改完點別的地方（讓欄位失去焦點）就會自動存回 GitHub
        <button id="btn-exit-edit">退出編輯模式</button>
      </div>
      <div id="edit-save-toast" class="edit-save-toast" hidden></div>
    ` : ""}
    <div class="song-top-bar">
      <button class="icon-btn" onclick="location.hash='#/guide'">${ICONS.back}</button>
      <h1>${escapeHtml(song.title)}</h1>
      ${themeToggleHtml()}
    </div>
    ${songStripHtml(song.id)}
    <div class="song-layout">
      <div class="song-media">
        <div class="video-wrap" id="video-wrap">
          ${song.youtubeId ? `<div id="yt-player"></div>` : `<div class="video-empty">尚未設定影片 ID<br>請在 data.js 幫「${escapeHtml(song.title)}」填入 youtubeId</div>`}
        </div>
        <div class="sync-hint"><span class="dot"></span>點選歌詞跳至影片位置，醒目歌詞隨影片同步。</div>
        <div class="legend small">${song.chantTypes.map(legendItem).join("")}</div>
        <div class="display-settings" id="display-settings">
          <div class="settings-panel" id="settings-panel" hidden>
            <button id="tg-onlyCall" aria-pressed="${toggleState.onlyCall}">只聽大合唱</button>
            <button id="tg-simple" aria-pressed="${toggleState.simple}">簡潔模式</button>
            <button id="tg-original" aria-pressed="${toggleState.original}">原文</button>
            <button id="tg-romaji" aria-pressed="${toggleState.romaji}">羅馬拼音</button>
            <button id="tg-zh" aria-pressed="${toggleState.zh}">中文</button>
            <button id="tg-kongEr" aria-pressed="${toggleState.kongEr}">空耳</button>
            <button id="tg-autoscroll" aria-pressed="${toggleState.autoScroll}">自動捲動</button>
          </div>
          <button id="settings-toggle" class="settings-toggle-btn" aria-expanded="false" aria-label="顯示設定">${ICONS.sliders}<span class="settings-toggle-label">顯示設定</span></button>
        </div>
      </div>
      <div class="song-lyrics-panel">
        <ul class="lyrics-list" id="lyrics-list"></ul>
      </div>
    </div>
  `;
}

function lyricLineHtml(line, index) {
  if (isEditModeOn() && index === editingLineIndex) {
    return `
      <li class="lyric-line-edit" data-edit-index="${index}">
        <div class="line-edit-fields">
          <input type="number" step="0.1" data-field="time" value="${line.time}" placeholder="秒數" class="le-time">
          <input type="text" data-field="original" value="${escapeHtml(line.original)}" placeholder="原文">
          <input type="text" data-field="romaji" value="${escapeHtml(line.romaji)}" placeholder="羅馬拼音">
          <input type="text" data-field="zh" value="${escapeHtml(line.zh)}" placeholder="中文">
          <input type="text" data-field="kongEr" value="${escapeHtml(line.kongEr)}" placeholder="空耳">
        </div>
      </li>`;
  }
  const chantBadge = line.chant ? `<span class="badge ${line.chant} chant-tag">${ICONS[line.chant]}${CHANT_TYPES[line.chant].label}</span>` : "";
  const hideByFilter = toggleState.onlyCall && line.chant !== "call";
  const classes = [
    "lyric-line",
    toggleState.simple ? "simple-mode" : "",
    hideByFilter ? "hidden-by-filter" : "",
  ].filter(Boolean).join(" ");
  return `
    <li><button class="${classes}" data-time="${line.time}" data-index="${index}">
      ${chantBadge}
      ${isEditModeOn() ? `<span class="edit-pencil" data-edit-pencil="${index}" title="編輯這句">✏️</span>` : ""}
      ${toggleState.original && line.original ? `<div class="original">${renderChantText(line.original, line.chant)}</div>` : ""}
      ${toggleState.romaji && line.romaji ? `<div class="romaji">${renderChantText(line.romaji, line.chant)}</div>` : ""}
      ${toggleState.zh && line.zh ? `<div class="zh">${renderChantText(line.zh, line.chant)}</div>` : ""}
      ${toggleState.kongEr && line.kongEr ? `<div class="kong-er">${renderChantText(line.kongEr, line.chant)}</div>` : ""}
    </button></li>`;
}
function renderLyricsList(song) {
  const el = document.getElementById("lyrics-list");
  if (el) el.innerHTML = song.lyrics.map((l, i) => lyricLineHtml(l, i)).join("");
}
function wireLyricsClick() {
  const el = document.getElementById("lyrics-list");
  if (!el) return;
  el.addEventListener("click", (e) => {
    const line = e.target.closest(".lyric-line");
    if (!line) return;
    const time = parseFloat(line.dataset.time);
    if (playerState.ytPlayer && playerState.ytPlayer.seekTo) {
      playerState.ytPlayer.seekTo(time, true);
      playerState.ytPlayer.playVideo();
    }
  });
}

/* ===== 隱藏編輯模式：點鉛筆進入行內編輯，離開那一行（focusout）自動存回 GitHub ===== */
let editSaveToastTimer = null;
function showEditSaveToast(text, kind) {
  const el = document.getElementById("edit-save-toast");
  if (!el) return;
  el.textContent = text;
  el.className = "edit-save-toast" + (kind ? " " + kind : "");
  el.hidden = false;
  clearTimeout(editSaveToastTimer);
  if (kind !== "saving") {
    editSaveToastTimer = setTimeout(() => { el.hidden = true; }, 3000);
  }
}
async function saveEditedLine(song, index, fields) {
  const line = song.lyrics[index];
  if (!line) return;
  line.time = fields.time;
  line.original = fields.original;
  line.romaji = fields.romaji;
  line.zh = fields.zh;
  line.kongEr = fields.kongEr;
  editingLineIndex = null;
  renderLyricsList(song); // 先樂觀更新畫面，不等網路回應

  if (!ghEnabled()) {
    showEditSaveToast("⚠️ 還沒設定 GitHub 存檔，這次改的字只留在畫面上，重新整理就不見了", "error");
    alert("還沒設定 GitHub 存檔（先去 tools/lyrics-builder.html 設定一次帳號/repo/token），這次改的字只留在畫面上，重新整理就不見了。");
    return;
  }
  showEditSaveToast("存檔中…", "saving");
  try {
    await ghSaveSong(song, `編輯歌詞：${song.title} 第 ${index + 1} 句`);
    showEditSaveToast(`✓ 第 ${index + 1} 句已存回 GitHub`, "ok");
  } catch (e) {
    showEditSaveToast("✕ 存檔失敗：" + e.message, "error");
    alert("存檔失敗：" + e.message);
  }
}
function wireLyricsEdit(song) {
  const el = document.getElementById("lyrics-list");
  if (!el || !isEditModeOn()) return;

  // 用 capture 階段攔截鉛筆點擊，搶在 wireLyricsClick 的「點歌詞跳影片位置」之前處理
  el.addEventListener("click", (e) => {
    const pencil = e.target.closest("[data-edit-pencil]");
    if (!pencil) return;
    e.preventDefault();
    e.stopPropagation();
    editingLineIndex = Number(pencil.dataset.editPencil);
    renderLyricsList(song);
    const input = el.querySelector(`.lyric-line-edit[data-edit-index="${editingLineIndex}"] input`);
    if (input) input.focus();
  }, true);

  el.addEventListener("focusout", (e) => {
    const group = e.target.closest(".line-edit-fields");
    if (!group) return;
    if (group.contains(e.relatedTarget)) return; // 還在同一組欄位裡切換，不算離開
    const li = group.closest(".lyric-line-edit");
    const index = Number(li.dataset.editIndex);
    const fields = {
      time: parseFloat(group.querySelector('[data-field="time"]').value) || 0,
      original: group.querySelector('[data-field="original"]').value,
      romaji: group.querySelector('[data-field="romaji"]').value,
      zh: group.querySelector('[data-field="zh"]').value,
      kongEr: group.querySelector('[data-field="kongEr"]').value,
    };
    saveEditedLine(song, index, fields);
  });
}
function wireEditModeBanner() {
  const btn = document.getElementById("btn-exit-edit");
  if (btn) btn.addEventListener("click", exitEditMode);
}
function wireToolbar(song) {
  const map = {
    "tg-onlyCall": "onlyCall", "tg-simple": "simple", "tg-original": "original",
    "tg-romaji": "romaji", "tg-zh": "zh", "tg-kongEr": "kongEr", "tg-autoscroll": "autoScroll",
  };
  Object.entries(map).forEach(([btnId, key]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      toggleState[key] = !toggleState[key];
      saveToggleState();
      btn.setAttribute("aria-pressed", toggleState[key]);
      renderLyricsList(song);
    });
  });
}
function wireSongStrip() {
  const strip = document.getElementById("song-strip");
  if (!strip) return;
  strip.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-song-id]");
    if (btn) location.hash = "#/song/" + encodeURIComponent(btn.dataset.songId);
  });
  const active = strip.querySelector(".strip-chip.active");
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
}
function wireSettingsPanel() {
  const toggle = document.getElementById("settings-toggle");
  const panel = document.getElementById("settings-panel");
  if (!toggle || !panel) return;
  toggle.addEventListener("click", () => {
    const isOpen = !panel.hasAttribute("hidden");
    if (isOpen) { panel.setAttribute("hidden", ""); toggle.setAttribute("aria-expanded", "false"); }
    else { panel.removeAttribute("hidden"); toggle.setAttribute("aria-expanded", "true"); }
    toggle.classList.toggle("is-open", !isOpen);
  });
}

/* ===== YouTube 同步 ===== */
function ensureYouTubeAPI(callback) {
  if (window.YT && window.YT.Player) { callback(); return; }
  window.onYouTubeIframeAPIReady = callback;
  if (!document.getElementById("yt-iframe-api")) {
    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}
function setupPlayer(song) {
  stopPolling();
  if (playerState.ytPlayer) {
    try { playerState.ytPlayer.destroy(); } catch (e) {}
    playerState.ytPlayer = null;
  }
  if (!song.youtubeId || !document.getElementById("yt-player")) return;
  ensureYouTubeAPI(() => {
    if (!document.getElementById("yt-player")) return;
    playerState.ytPlayer = new YT.Player("yt-player", {
      videoId: song.youtubeId,
      playerVars: { rel: 0 },
      events: {
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) startPolling(song);
          else stopPolling();
        },
      },
    });
  });
}
function startPolling(song) {
  stopPolling();
  playerState.pollTimer = setInterval(() => {
    if (!playerState.ytPlayer || !playerState.ytPlayer.getCurrentTime) return;
    updateActiveLine(song, playerState.ytPlayer.getCurrentTime());
  }, 250);
}
function stopPolling() {
  if (playerState.pollTimer) { clearInterval(playerState.pollTimer); playerState.pollTimer = null; }
}
function updateActiveLine(song, currentTime) {
  let activeIndex = -1;
  for (let i = 0; i < song.lyrics.length; i++) {
    if (song.lyrics[i].time <= currentTime) activeIndex = i; else break;
  }
  const lines = document.querySelectorAll(".lyric-line");
  lines.forEach((lineEl, i) => {
    lineEl.classList.toggle("active", i === activeIndex);
  });
  if (toggleState.autoScroll && activeIndex >= 0 && lines[activeIndex]) {
    lines[activeIndex].scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

/* ===== 啟動 ===== */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  render();
});
