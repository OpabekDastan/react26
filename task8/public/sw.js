// Service Worker of the Task Manager
// BUILD_VERSION and PRECACHE_FILES are filled in by vite.config.js after "npm run build"
const BUILD_VERSION = "__BUILD_VERSION__";
const PRECACHE_FILES = "__PRECACHE_FILES__";

// task5..task8 live on the same origin (github.io) and share Cache Storage,
// so every cache name starts with the name of this app
const PREFIX = "task8-";

// versioned caches: every build has its own static cache
const STATIC_CACHE = PREFIX + "static-" + BUILD_VERSION;
const IMAGE_CACHE = PREFIX + "images-v1";
const API_CACHE = PREFIX + "api-v1";
const KNOWN_CACHES = [STATIC_CACHE, IMAGE_CACHE, API_CACHE];

// limits, so runtime caches do not grow forever
const MAX_IMAGES = 60;
const MAX_API_RESPONSES = 50;

// the only API we cache: public recipes (no login, no private data)
const PUBLIC_API = "https://dummyjson.com/recipes";

// ---------- install: save the app shell (html, js, css, icons, offline page) ----------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_FILES)),
  );
  // no skipWaiting() here: a new version waits until the user presses "Update"
});

// ---------- activate: delete caches of old versions ----------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            // only OUR old caches: caches of the other homeworks are not touched
            .filter((name) => name.startsWith(PREFIX) && !KNOWN_CACHES.includes(name))
            .map((name) => caches.delete(name)),
        ),
      )
      .then(() => self.clients.claim()), // control the open tabs right away
  );
});

// the page sends this message when the user presses "Update"
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ---------- fetch: choose a strategy for every request ----------
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // POST / PUT / DELETE are never cached
  if (request.method !== "GET") {
    return;
  }

  // opening the app (index.html) -> network first, offline -> cached shell
  if (request.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(pageNetworkFirst(request));
    return;
  }

  // public API -> network first, offline -> saved answer
  if (url.href.startsWith(PUBLIC_API)) {
    event.respondWith(networkFirst(request, API_CACHE, MAX_API_RESPONSES));
    return;
  }

  // images and fonts -> cache first
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGES));
    return;
  }

  // our own js / css / json -> from the precache, otherwise network
  if (url.origin === self.location.origin) {
    event.respondWith(fromCacheOrNetwork(request));
    return;
  }

  // everything else (Firebase auth, Google tokens) goes to the network and is NOT cached
});

// ---------- strategies ----------

async function pageNetworkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    // HashRouter: every page of the app is the same index.html
    const shell = await caches.match("./index.html");
    return shell || caches.match("./offline.html");
  }
}

async function networkFirst(request, cacheName, maxEntries) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      await saveToCache(cacheName, request, response.clone(), maxEntries);
    }

    return response;
  } catch (error) {
    const cached = await findInCache(request);

    if (cached) {
      return cached;
    }

    throw error; // no saved copy -> the page shows its offline / error state
  }
}

async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await findInCache(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    // no await: the image is shown at once, saving happens in the background
    saveToCache(cacheName, request, response.clone(), maxEntries);
  }

  return response;
}

async function fromCacheOrNetwork(request) {
  const cached = await findInCache(request);
  return cached || fetch(request);
}

// ---------- helpers ----------

// ignoreVary: a saved file matches even if the server answer had "Vary: Origin"
function findInCache(request) {
  return caches.match(request, { ignoreVary: true });
}

async function saveToCache(cacheName, request, response, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);

    // cache.keys() is in insertion order -> delete the oldest entries
    const keys = await cache.keys();
    for (let i = 0; i < keys.length - maxEntries; i++) {
      await cache.delete(keys[i]);
    }
  } catch {
    // cache is full or not available: the app still works, just without this copy
  }
}
