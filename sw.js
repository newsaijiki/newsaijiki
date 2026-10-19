// ニュ・歳時記 用のサービスワーカー（自分自身を片づけるだけの版）
// 以前の版が保存した古い画面が原因で、アプリとして開けない場合があったため、保存をやめました。
// このファイルは、古いサービスワーカーを、自動で入れ替えて削除するために置いています。
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    await self.registration.unregister();
    var cs = await self.clients.matchAll({ type: "window" });
    cs.forEach(function (c) { try { c.navigate(c.url); } catch (e) {} });
  })());
});
