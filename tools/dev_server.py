#!/usr/bin/env python3
"""
本機開發伺服器：一般靜態檔案照常提供，另外多兩個 API 給 lyrics-builder.html 用：
  GET  /api/songs       -> 讀 js/data.js，回傳所有歌曲的 id/title/order/程式碼文字
  POST /api/save-song   -> 傳 {id, code}，直接把 data.js 裡對應那首歌的區塊換成新的程式碼並存檔
                            （找不到對應 id 就當作新歌，插在 SONGS 陣列最後面）

每次寫入前都會先把 data.js 備份成 data.js.bak（覆蓋舊備份），純粹本機使用，不對外開放。
"""
import http.server
import json
import os
import re
import shutil
import socket
import socketserver

PORT = 8888


def get_lan_ip():
    """猜這台電腦在區網內的 IP，給平板/手機連線用；猜不到就回傳 None。"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return None
    finally:
        s.close()
TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS_DIR)
DATA_JS = os.path.join(ROOT, "js", "data.js")


def find_array_span(text, marker):
    start = text.index(marker)
    bracket_start = start + len(marker) - 1  # 指向 '['
    depth = 0
    i = bracket_start
    while i < len(text):
        c = text[i]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return bracket_start, i
        i += 1
    raise ValueError("找不到陣列結尾")


def find_song_blocks(text):
    arr_start, arr_end = find_array_span(text, "const SONGS = [")
    blocks = []
    i = arr_start + 1
    while i < arr_end:
        while i < arr_end and text[i] in " \t\r\n,":
            i += 1
        if i >= arr_end:
            break
        if text[i] != "{":
            i += 1
            continue
        obj_start = i
        depth = 0
        in_str = None
        j = i
        while j < arr_end:
            c = text[j]
            if in_str:
                if c == "\\":
                    j += 2
                    continue
                if c == in_str:
                    in_str = None
            else:
                if c in ('"', "'", "`"):
                    in_str = c
                elif c == "{":
                    depth += 1
                elif c == "}":
                    depth -= 1
                    if depth == 0:
                        break
            j += 1
        obj_end = j + 1
        block_text = text[obj_start:obj_end]
        id_m = re.search(r'id\s*:\s*"([^"]*)"', block_text)
        title_m = re.search(r'title\s*:\s*"([^"]*)"', block_text)
        order_m = re.search(r"order\s*:\s*(\d+)", block_text)
        blocks.append({
            "id": id_m.group(1) if id_m else None,
            "title": title_m.group(1) if title_m else "",
            "order": int(order_m.group(1)) if order_m else None,
            "start": obj_start,
            "end": obj_end,
            "text": block_text,
        })
        i = obj_end
    return blocks, arr_start, arr_end


def save_song(song_id, new_code):
    with open(DATA_JS, "r", encoding="utf-8") as f:
        text = f.read()
    shutil.copyfile(DATA_JS, DATA_JS + ".bak")

    new_code = new_code.strip()
    if new_code.endswith(","):
        new_code = new_code[:-1]

    blocks, arr_start, arr_end = find_song_blocks(text)
    match = next((b for b in blocks if b["id"] == song_id), None)

    if match:
        new_text = text[: match["start"]] + new_code + text[match["end"]:]
    else:
        prefix = text[:arr_end]
        stripped = prefix.rstrip()
        if not stripped.endswith("[") and not stripped.endswith(","):
            prefix = stripped + ",\n"
        new_text = prefix + "  " + new_code + ",\n" + text[arr_end:]

    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(new_text)


class Handler(http.server.SimpleHTTPRequestHandler):
    def _json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/songs":
            try:
                with open(DATA_JS, "r", encoding="utf-8") as f:
                    text = f.read()
                blocks, _, _ = find_song_blocks(text)
                payload = [
                    {"id": b["id"], "title": b["title"], "order": b["order"], "code": b["text"]}
                    for b in blocks
                ]
                self._json(200, payload)
            except Exception as e:
                self._json(500, {"error": str(e)})
            return
        super().do_GET()

    def do_POST(self):
        if self.path == "/api/save-song":
            try:
                length = int(self.headers.get("Content-Length", 0))
                raw = self.rfile.read(length)
                data = json.loads(raw.decode("utf-8"))
                song_id = data.get("id")
                code = data.get("code")
                if not song_id or not code:
                    raise ValueError("缺少 id 或 code")
                save_song(song_id, code)
                self._json(200, {"ok": True})
            except Exception as e:
                self._json(500, {"ok": False, "error": str(e)})
            return
        self.send_response(404)
        self.end_headers()

    def log_message(self, fmt, *args):
        pass  # 保持黑色視窗乾淨，不洗每個請求的 log


if __name__ == "__main__":
    os.chdir(ROOT)
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Serving BIGBANG guide site at http://localhost:%d/" % PORT, flush=True)
        lan_ip = get_lan_ip()
        if lan_ip:
            print("平板/手機連同一個 Wi-Fi，瀏覽器輸入這個網址就能用（含歌詞編輯工具）：", flush=True)
            print("  http://%s:%d/" % (lan_ip, PORT), flush=True)
            print("  http://%s:%d/tools/lyrics-builder.html" % (lan_ip, PORT), flush=True)
            print("（第一次連線 Windows 可能會跳防火牆詢問，選「允許」）", flush=True)
        else:
            print("找不到區網 IP，平板連線請自己查這台電腦的 IPv4 位址（cmd 打 ipconfig）", flush=True)
        httpd.serve_forever()
