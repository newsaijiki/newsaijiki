// ニュ・歳時記 用のサービスワーカー（アプリとして開く／一度開いた画面を通信なしでも表示）
var CACHE = "nyu-saijiki-v1";
var FILES = ["./nyu-saijiki.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES).catch(function () {}); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

// 同じサイト内のファイルだけを扱う（Supabase など外部への通信には触れない）。
// まず通信して最新を取り、できないときだけ保存済みのものを使う。
self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(r, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(r).then(function (m) {
        return m || (r.mode === "navigate" ? caches.match("./nyu-saijiki.html") : undefined);
      });
    })
  );
});
