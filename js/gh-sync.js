/*
 * GitHub 存檔共用邏輯：讀寫 js/data.js、解析/重組 SONGS 陣列裡單首歌的程式碼區塊。
 * 同時給 tools/lyrics-builder.html 跟正式網站的歌曲頁（app.js 的隱藏編輯模式）共用，
 * 只維護這一份，兩邊行為才會一直一致。
 *
 * 設定存在 localStorage（GH_STORAGE_KEY），兩邊共用同一組設定：
 * 只要在其中一個地方（例如 lyrics-builder）設定過 GitHub 帳號/repo/token，
 * 同一台裝置的瀏覽器上，另一邊（正式網站的隱藏編輯模式）會自動讀到同一組設定。
 */
const GH_STORAGE_KEY = "bg_cosmos_lyrics_gh_settings";
const GH_DATA_JS_PATH = "js/data.js";

function ghSettings() {
  try {
    const raw = localStorage.getItem(GH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function ghSaveSettings(settings) {
  localStorage.setItem(GH_STORAGE_KEY, JSON.stringify(settings));
}
function ghClearSettings() {
  localStorage.removeItem(GH_STORAGE_KEY);
}
function ghEnabled() {
  const s = ghSettings();
  return !!(s && s.owner && s.repo && s.token);
}
function ghApiBase() {
  const s = ghSettings();
  return `https://api.github.com/repos/${encodeURIComponent(s.owner)}/${encodeURIComponent(s.repo)}`;
}
function ghHeaders() {
  const s = ghSettings();
  return {
    "Authorization": "Bearer " + s.token,
    "Accept": "application/vnd.github+json",
  };
}
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

async function ghGetDataJs() {
  const s = ghSettings();
  const url = `${ghApiBase()}/contents/${GH_DATA_JS_PATH}?ref=${encodeURIComponent(s.branch || "main")}&t=${Date.now()}`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`讀取失敗（HTTP ${res.status}）：${body.message || "請檢查帳號/repo/分支/Token"}`);
  }
  const data = await res.json();
  return { text: base64ToUtf8(data.content), sha: data.sha };
}

async function ghPutDataJs(newText, sha, message) {
  const s = ghSettings();
  const url = `${ghApiBase()}/contents/${GH_DATA_JS_PATH}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message || "更新歌詞",
      content: utf8ToBase64(newText),
      sha,
      branch: s.branch || "main",
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 409) throw new Error("存檔衝突：data.js 在別的裝置剛被改過，請重新整理頁面再試一次。");
    throw new Error(`存檔失敗（HTTP ${res.status}）：${body.message || "請檢查 Token 權限"}`);
  }
  return res.json();
}

/* 找出 data.js 裡 SONGS 陣列每一首歌的程式碼區塊（純字串掃描，跟 tools/dev_server.py 的 Python 版邏輯一致） */
function findArraySpan(text, marker) {
  const start = text.indexOf(marker);
  if (start === -1) throw new Error(`data.js 裡找不到「${marker}」，格式可能被改過`);
  const bracketStart = start + marker.length - 1;
  let depth = 0;
  let i = bracketStart;
  while (i < text.length) {
    const c = text[i];
    if (c === "[") depth++;
    else if (c === "]") { depth--; if (depth === 0) return [bracketStart, i]; }
    i++;
  }
  throw new Error("找不到 SONGS 陣列的結尾");
}
function findSongBlocks(text) {
  const [arrStart, arrEnd] = findArraySpan(text, "const SONGS = [");
  const blocks = [];
  let i = arrStart + 1;
  while (i < arrEnd) {
    while (i < arrEnd && " \t\r\n,".includes(text[i])) i++;
    if (i >= arrEnd) break;
    if (text[i] !== "{") { i++; continue; }
    const objStart = i;
    let depth = 0, inStr = null, j = i;
    while (j < arrEnd) {
      const c = text[j];
      if (inStr) {
        if (c === "\\") { j += 2; continue; }
        if (c === inStr) inStr = null;
      } else {
        if (c === '"' || c === "'" || c === "`") inStr = c;
        else if (c === "{") depth++;
        else if (c === "}") { depth--; if (depth === 0) break; }
      }
      j++;
    }
    const objEnd = j + 1;
    const blockText = text.slice(objStart, objEnd);
    const idM = blockText.match(/id\s*:\s*"([^"]*)"/);
    const titleM = blockText.match(/title\s*:\s*"([^"]*)"/);
    const orderM = blockText.match(/order\s*:\s*(\d+)/);
    blocks.push({
      id: idM ? idM[1] : null,
      title: titleM ? titleM[1] : "",
      order: orderM ? parseInt(orderM[1], 10) : null,
      start: objStart,
      end: objEnd,
      text: blockText,
    });
    i = objEnd;
  }
  return { blocks, arrStart, arrEnd };
}
function buildNewDataJs(text, songId, newCode) {
  let code = newCode.trim();
  if (code.endsWith(",")) code = code.slice(0, -1);
  const { blocks, arrEnd } = findSongBlocks(text);
  const match = blocks.find((b) => b.id === songId);
  if (match) {
    return text.slice(0, match.start) + code + text.slice(match.end);
  }
  let prefix = text.slice(0, arrEnd);
  const stripped = prefix.replace(/\s+$/, "");
  if (!stripped.endsWith("[") && !stripped.endsWith(",")) prefix = stripped + ",\n";
  return prefix + "  " + code + ",\n" + text.slice(arrEnd);
}

/* 把一首歌的物件（id/order/title/titleOriginal/youtubeId/categories/lyrics）序列化成可以貼進 data.js 的程式碼字串。
   chantTypes 一律從 lyrics 裡實際用到的 chant 重新算，不吃呼叫端傳進來的舊值，確保跟內容一致。 */
function jsStringLiteral(s) {
  return JSON.stringify(String(s || ""));
}
function songToCode(song) {
  const usedChants = [];
  ["call", "cheer", "clap"].forEach((k) => {
    if (song.lyrics.some((l) => l.chant === k)) usedChants.push(k);
  });
  const lyricsCode = song.lyrics.map((l) => {
    return `      { time: ${l.time}, original: ${jsStringLiteral(l.original)}, romaji: ${jsStringLiteral(l.romaji)}, zh: ${jsStringLiteral(l.zh)}, kongEr: ${jsStringLiteral(l.kongEr)}, chant: ${l.chant ? jsStringLiteral(l.chant) : "null"} },`;
  }).join("\n");
  const categories = Array.isArray(song.categories) ? song.categories : [];
  return `  {
    id: ${jsStringLiteral(song.id)},
    order: ${song.order || 1},
    title: ${jsStringLiteral(song.title)},
    titleOriginal: ${jsStringLiteral(song.titleOriginal)},
    youtubeId: ${jsStringLiteral(song.youtubeId)},
    chantTypes: [${usedChants.map(jsStringLiteral).join(", ")}],
    categories: [${categories.map(jsStringLiteral).join(", ")}],
    lyrics: [
${lyricsCode}
    ],
  },`;
}

/* 把單首歌的異動存回 GitHub：抓最新版本 → 用 newSong 重新產生那首歌的程式碼 → 換掉 → PUT 回去。
   呼叫端負責準備好完整的 newSong 物件（包含沒改到的欄位）。 */
async function ghSaveSong(newSong, commitMessage) {
  const { text, sha } = await ghGetDataJs();
  const code = songToCode(newSong);
  const newText = buildNewDataJs(text, newSong.id, code);
  await ghPutDataJs(newText, sha, commitMessage || `更新歌詞：${newSong.title || newSong.id}`);
}
