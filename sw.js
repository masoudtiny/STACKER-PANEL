/* Service worker: لازم برای نصب روی گوشی + کار کردن بدون اینترنت */
const CACHE = "hmi-stacker-v2";
const SHELL = ["./", "index.html", "manifest.json", "images/icon-192.png", "images/icon-512.png", "images/logo.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /jsdelivr|gstatic|googleapis/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  const isPage = req.mode === "navigate" || /\.(html|json|js)$/.test(url.pathname) || url.pathname.endsWith("/");
  const save = res => { if (res && (res.ok || res.type === "opaque")) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; };
  if (isPage) {   /* صفحه و فایل‌های کد: اول اینترنت، اگر نبود کش */
    e.respondWith(fetch(req).then(save).catch(() => caches.match(req).then(h => h || caches.match("index.html"))));
  } else {        /* عکس و فونت: اول کش، پشت‌صحنه به‌روز می‌شود */
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(save)));
  }
});
