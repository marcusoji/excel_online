// Excel Magic Academy — service worker
//
// Design notes (please read before editing):
//
// 1. No Background Sync API. It isn't implemented in iOS Safari, and this
//    app has to behave the same on Windows, macOS, and iOS. There is
//    nothing to sync anyway — every write goes straight to IndexedDB on
//    the device. The `online` window event (see ServiceWorkerRegister.tsx)
//    is our only "back online" hook, and all it does is ask this worker to
//    top up its cache.
//
// 2. Precaching is manifest-driven, not hand-listed. `precache-manifest.json`
//    is generated at build time (see scripts/generate-precache-manifest.mjs)
//    from the real contents of the static export, so every hashed
//    `_next/static/...` chunk and every prerendered lesson page gets
//    cached — not just a guessed subset.
//
// 3. iOS may evict this entire cache storage after ~7 days of the site
//    being unused (Safari's "Intelligent Tracking Prevention" storage
//    eviction). That's a platform limit no service worker can override;
//    OfflineIndicator.tsx and the dashboard are honest about progress
//    living "on this device" rather than promising permanence.

const CACHE_VERSION = "v1"; // bump this on any deploy where cached assets should be invalidated
const CACHE_NAME = `excel-magic-academy-${CACHE_VERSION}`;
const OFFLINE_FALLBACK_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const res = await fetch("/precache-manifest.json", { cache: "no-store" });
        if (res.ok) {
          const files = await res.json();
          // Don't let one missing file abort the whole install.
          await Promise.allSettled(files.map((url) => cache.add(url)));
        }
      } catch (err) {
        // No manifest yet (e.g. local `next dev`, which isn't a static
        // export) — fall back to caching just the shell as we go.
        await cache.add("/").catch(() => {});
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

async function refreshCache() {
  const cache = await caches.open(CACHE_NAME);
  const res = await fetch("/precache-manifest.json", { cache: "no-store" });
  if (!res.ok) return;
  const files = await res.json();
  await Promise.allSettled(
    files.map(async (url) => {
      const fresh = await fetch(url, { cache: "no-store" });
      if (fresh.ok) await cache.put(url, fresh);
    })
  );
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "REFRESH_CACHE") {
    event.waitUntil(refreshCache());
  }
});

function isNavigationRequest(request) {
  return request.mode === "navigate" || (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

/** Static export + trailingSlash:true means "/dashboard/" maps to the file "/dashboard/index.html". */
function candidateUrlsFor(pathname) {
  if (pathname.endsWith("/")) return [pathname, pathname + "index.html"];
  return [pathname, pathname + "/", pathname + "/index.html", pathname + ".html"];
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't intercept cross-origin requests

  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        for (const candidate of candidateUrlsFor(url.pathname)) {
          const cached = await cache.match(candidate);
          if (cached) {
            // Serve the cached shell instantly, then quietly refresh it for next time.
            fetch(request)
              .then((fresh) => fresh.ok && cache.put(candidate, fresh))
              .catch(() => {});
            return cached;
          }
        }
        try {
          const fresh = await fetch(request);
          if (fresh.ok) cache.put(url.pathname.endsWith("/") ? url.pathname + "index.html" : url.pathname, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(OFFLINE_FALLBACK_URL)) ?? Response.error();
        }
      })()
    );
    return;
  }

  // Static assets: cache-first, filling the cache on future visits.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) cache.put(request, fresh.clone());
        return fresh;
      } catch (err) {
        if (cached) return cached;
        throw err;
      }
    })()
  );
});
