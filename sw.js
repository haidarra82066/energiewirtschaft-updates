/* Vronis Energierecht-Atlas – Service Worker
   ------------------------------------------------------------------
   Zwei Aufgaben:
   1. Offline: index.html und die Icons liegen im Cache. Für die Seite selbst
      gilt "erst Netz, dann Cache" – so ist online immer der neueste Stand da.
   2. Benachrichtigungen: Diese Seite hat keinen Push-Server, echtes Web-Push
      ist damit nicht möglich. Wo der Browser periodicSync unterstützt
      (Chrome/Android, installierte App), prüft dieser Worker aber selbst,
      ob im Briefing neue Beiträge stehen, und meldet sie. Auf iOS/Safari
      gibt es das nicht – dort prüft die Seite beim Öffnen (siehe index.html).
      Der push-Handler ist trotzdem vorhanden: käme später ein Push-Server
      dazu, funktioniert er ohne Änderung hier.
   Einstellungen kommen per postMessage aus der Seite und liegen im Cache
   "vroni-state", damit sie auch beim Hintergrund-Start verfügbar sind. */
"use strict";

const CACHE = "vroni-app-v1";
const SCACHE = "vroni-state";
const ASSETS = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png",
                "./icon-maskable-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async a => {
      const r = await fetch(new Request(a, { cache: "reload" }));
      if (r.ok) await c.put(a, r);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k.startsWith("vroni-") && k !== CACHE && k !== SCACHE) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.search) return;   /* die Update-Prüfung (./?v=…) läuft immer direkt ans Netz */
  const isPage = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isPage) {
    /* Seite: erst Netz (frischer Stand), Cache nur als Notnagel */
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        if (r && r.ok) { const c = await caches.open(CACHE); await c.put("./", r.clone()); }
        return r;
      } catch (err) {
        return (await caches.match("./")) || (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    const r = await fetch(req);
    if (r && r.ok) { const c = await caches.open(CACHE); await c.put(req, r.clone()); }
    return r;
  })());
});

/* ---------- Zustand (Einstellungen + gesehene Beiträge) ---------- */
async function getState() {
  try {
    const c = await caches.open(SCACHE);
    const r = await c.match("state");
    return r ? await r.json() : {};
  } catch (e) { return {}; }
}
async function setState(s) {
  try {
    const c = await caches.open(SCACHE);
    await c.put("state", new Response(JSON.stringify(s), { headers: { "content-type": "application/json" } }));
  } catch (e) { /* egal – dann prüft die Seite beim Öffnen */ }
}

/* ---------- Briefing aus dem ausgelieferten HTML lesen ---------- */
function parseNews(html) {
  const out = [], re = /^\{d:"([^"]*)",cat:"([^"]*)",t:"((?:[^"\\]|\\.)*)"/gm;
  let m;
  while ((m = re.exec(html))) out.push({ d: m[1], cat: m[2], t: m[3] });
  return out;
}
function quietNow() { const h = new Date().getHours(); return h >= 22 || h < 7; }

async function tell(title, body, tag) {
  await self.registration.showNotification(title, {
    body: body, tag: tag, lang: "de",
    icon: "./icon-192.png", badge: "./icon-192.png",
    data: { u: "./#briefing" }
  });
}

async function check() {
  const st = await getState();
  const cfg = st.cfg || {};
  if (!cfg.on) return;                       /* nicht aktiviert → nichts tun */
  if (cfg.quiet !== false && quietNow()) return;
  let html;
  try {
    const res = await fetch("./?sw=" + Date.now(), { cache: "no-store" });
    if (!res.ok) return;
    html = await res.text();
  } catch (e) { return; }
  const items = parseNews(html);
  if (!items.length) return;                 /* Format unbekannt → lieber nichts melden */
  const stand = (html.match(/id="newsstamp">([^<]*)</) || [])[1] || "";
  const seen = (st.seen && st.seen.titles) || [];
  const done = st.notified || [];
  const cats = cfg.cats || {};
  const fresh = items.filter(i => seen.indexOf(i.t) < 0 && done.indexOf(i.t) < 0 && cats[i.cat] !== false);
  if (fresh.length) {
    await tell(fresh.length === 1 ? "Neu im Energie-Briefing" : fresh.length + " neue Beiträge im Energie-Briefing",
      fresh.slice(0, 3).map(i => "• " + i.t).join("\n") + (fresh.length > 3 ? "\n… und " + (fresh.length - 3) + " weitere" : ""),
      "vroni-news");
    st.notified = done.concat(fresh.map(i => i.t)).slice(-80);
    await setState(st);
    const wins = await self.clients.matchAll({ type: "window" });
    wins.forEach(w => w.postMessage({ type: "news", items: fresh }));
    return;
  }
  if (stand && st.seen && st.seen.stand && stand !== st.seen.stand && cfg.acts !== false && st.standNotified !== stand) {
    await tell("Vroni hat den Atlas geprüft", "Neuer Stand: " + stand, "vroni-stand");
    st.standNotified = stand;
    await setState(st);
  }
}

self.addEventListener("periodicsync", e => { if (e.tag === "vroni-check") e.waitUntil(check()); });
self.addEventListener("sync", e => { if (e.tag === "vroni-check") e.waitUntil(check()); });

self.addEventListener("message", e => {
  const d = e.data || {};
  if (d.type === "state") {
    e.waitUntil((async () => {
      const st = await getState();
      st.cfg = d.cfg || st.cfg;
      st.seen = d.seen || st.seen;
      await setState(st);
    })());
  }
  if (d.type === "check") e.waitUntil(check());
});

/* Käme später ein Push-Server dazu, landen dessen Nachrichten hier. */
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(tell(d.title || "Vronis Energie-Briefing", d.body || "Es gibt neue Beiträge.", d.tag || "vroni-push"));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const u = (e.notification.data && e.notification.data.u) || "./";
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.indexOf(self.registration.scope) === 0) {
        await w.focus();
        w.postMessage({ type: "focus" });
        return;
      }
    }
    await self.clients.openWindow(u);
  })());
});
