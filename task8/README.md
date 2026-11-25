# Task 7 — Progressive Web App

Task Manager SPA (React + React Router + TanStack Query + Firebase Auth) turned into an
**installable PWA** that works offline and on phones from 320px.
All features from tasks 4–6 are preserved.

**Live demo:** https://opabekdastan.github.io/react26/task7/

## Run

```bash
npm install
cp .env.example .env.local   # fill in your Firebase config (see task 6)
npm run dev
```

The Service Worker is registered **only in the built app**. To test the PWA locally:

```bash
npm run build
npx vite preview
```

## Deploy (GitHub Pages)

```bash
npm run deploy
```

The build is copied into the `task7` folder of the `gh-pages` branch. Every build gets a new
Service Worker version, so users see the "new version" banner after a deploy.

## 1. Manifest & installation

- `public/manifest.json` — `name`, `short_name`, `start_url: "./"`, `scope: "./"`,
  `display: "standalone"`, `theme_color`, `background_color`.
- Icons `public/icons/icon-192.png` and `icon-512.png` (+ the 512 icon as `maskable` for Android).
- `index.html` links the manifest, sets `theme-color` and the iOS `apple-touch-icon`.
- Installable because: HTTPS (GitHub Pages) + valid manifest + Service Worker with a `fetch` handler.

## 2. Service Worker lifecycle — `public/sw.js`

| Event      | What it does                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------- |
| `install`  | pre-caches the app shell: `index.html`, all built JS/CSS, icons, manifest, `offline.html`    |
| `activate` | deletes caches of old versions (`static-<old version>`), takes control of open tabs          |
| `fetch`    | chooses a caching strategy for each request (see below)                                      |
| `message`  | `"SKIP_WAITING"` from the page activates the waiting new version                             |

**How the file list gets into the SW.** JS/CSS files have hashes in their names
(`index-K83CSKo-.js`), so they are not known in advance. A small plugin in `vite.config.js`
runs after `vite build`, reads all files in `dist/` and writes them into `dist/sw.js` together
with a new `BUILD_VERSION` (build time).

**Versioned caches.** The static cache is called `static-<BUILD_VERSION>`. A new build means a new
name, and `activate` removes every cache that is not in the list of current caches.

**Update mechanism** (`src/services/swService.js`, `src/hooks/useSwUpdate.js`, `UpdateBanner.jsx`):

1. The browser downloads a changed `sw.js` (on every visit + we call `registration.update()` every 30 min).
2. The new SW installs and **waits** (no `skipWaiting` in `install`), the old one keeps serving the page.
3. The page notices the waiting worker and shows the banner *"A new version of the app is available"* with an **Update now** button.
4. The button sends `SKIP_WAITING` → the new SW activates, deletes old caches → `controllerchange` → the page reloads once with the new files.

Users never need to clear storage manually: old caches are removed automatically in `activate`.

## 3. Runtime caching

| Requests                                   | Strategy           | Cache          | Limit        |
| ------------------------------------------ | ------------------ | -------------- | ------------ |
| App shell (our JS, CSS, html, icons)       | precache → cache-first | `static-<version>` | replaced every version |
| Images and fonts (recipe photos, icons)    | **cache-first**    | `images-v1`    | 60 entries   |
| Public API `https://dummyjson.com/recipes` (list + details) | **network-first** | `api-v1` | 50 entries |
| Page navigation (`index.html`)             | network-first → cached shell → `offline.html` | — | — |
| Everything else (Firebase Auth, Google tokens, POST/PUT/DELETE) | **not cached** | — | — |

- **Cache-first**: images do not change, so the saved copy is used at once and the network is used only for new images.
- **Network-first**: API data should be fresh, so we try the network first; if there is no connection,
  the last saved answer is returned. That is why recipes opened before are available offline.
- **Limits**: after every save the oldest entries are deleted when the cache is bigger than the limit.
- **Private data is never cached by the SW**: only the public recipes API is in the runtime cache.
  Firebase requests (`identitytoolkit`, `securetoken`) and all non-GET requests pass through untouched.
  Tasks are stored in `localStorage` by the fake API, not in shared caches.
- **Failed requests**: if there is no network and no saved copy, the SW passes the error to the page,
  the page shows an error box or redirects to `/offline` — the app never crashes.
- **Showing cached data**: when offline, the recipe pages show *"You are offline — this is a saved copy of the data"*
  and a red banner under the navbar says that saved data is shown.
- TanStack Query uses `networkMode: "always"`, so requests are sent even offline and the SW can answer them from cache.

## 4. Offline

- `/offline` (`src/pages/Offline.jsx`) — dedicated page with a message, styling and a **Retry Connection** button.
  The button really checks the network (`checkConnection()` downloads `manifest.json?check=<time>` with `cache: "no-store"`),
  because `navigator.onLine` can say "online" without internet. On success the user returns to the page they wanted.
- When a recipe page cannot be loaded (offline and never opened before), the app redirects to `/offline`.
- `public/offline.html` — static fallback the SW returns if even the app shell cannot be loaded.
- Online/offline indicator in the navbar (`useOnlineStatus` hook, `online` / `offline` events) + offline banner.
- When the connection returns, TanStack Query refetches the data automatically (`refetchOnReconnect`).
- Available offline: all pages of the app (shell is pre-cached), tasks and dashboard (localStorage),
  recipes and photos that were opened before, the logged in session (Firebase keeps it in the browser).

## 5. Mobile

- Works from **320px**: no horizontal scroll, long words wrap (`overflow-wrap: anywhere`).
- **Responsive navigation**: below 760px the links move into a hamburger menu (☰ / ✕), the menu closes after a click
  and scrolls in landscape mode.
- Cards, filters, task form, dashboard, task and recipe details become one column; stat cards 2 per row.
- Touch-friendly: buttons, inputs and menu links are at least 44px high, inputs use 16px text (no zoom on iOS).
- Tested in portrait (320×640, 375×812) and landscape (740×360).

## Routes

| Route           | Page                                          |
| --------------- | --------------------------------------------- |
| `/`             | Home                                          |
| `/about`        | About                                         |
| `/recipes`      | Public recipes list (cached, works offline)   |
| `/recipes/:id`  | Recipe details (cached, works offline)        |
| `/offline`      | Offline page with Retry Connection            |
| `/login`        | Email/password + Google sign-in               |
| `/signup`       | Sign up with validation                       |
| `/profile`      | **Protected**: email, UID, logout             |
| `/items`        | **Protected**: tasks list with filters        |
| `/items/:id`    | **Protected**: task details                   |
| `/dashboard`    | **Protected**: statistics                     |
| `*`             | Custom 404                                    |

## New files in task 7

```
public/
├── manifest.json        PWA manifest
├── icons/               192 and 512 icons
├── sw.js                Service Worker (install / activate / fetch / message)
└── offline.html         fallback page of the Service Worker
src/
├── services/
│   ├── swService.js         register SW, detect and apply updates
│   ├── recipesService.js    public API (fetch)
│   └── networkService.js    real connection check
├── hooks/
│   ├── useOnlineStatus.js   online / offline
│   ├── useSwUpdate.js       "new version available"
│   └── useRecipes.js        TanStack Query hooks for recipes
├── components/
│   ├── UpdateBanner.jsx     banner with the Update button
│   └── CachedNotice.jsx     "this is a saved copy" message
└── pages/
    ├── Recipes.jsx / RecipeDetails.jsx
    └── Offline.jsx
vite.config.js               plugin that writes the file list + version into dist/sw.js
```

## Preserved from previous homeworks

- Firebase Auth (email/password, Google), persistent session, protected routes, auth-aware navbar (task 6)
- TanStack Query cache with query keys, invalidation after create / update / delete (task 6)
- Search, 3 filters, 6 sorting options, pagination in the URL, task CRUD, dashboard, lazy pages, 404 (tasks 4–5)
