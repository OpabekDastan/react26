# Task 8 — Redux Toolkit

Task Manager SPA (React + React Router + Firebase Auth + PWA) refactored to **Redux Toolkit**.
All features from tasks 4–7 are preserved: login, protected routes, CRUD, search, filters,
sorting, pagination, dashboard, installable PWA and offline mode.
TanStack Query was removed: all server data now lives in the Redux store.

**Live demo:** https://opabekdastan.github.io/react26/task8/

## Redux architecture

```
src/
  app/store.js                 configureStore + 3 reducers
  features/
    shared/requestHelpers.js   freshness check, 1 automatic retry, serializable errors
    tasks/                     tasksThunks.js · tasksSlice.js · tasksSelectors.js
    stats/                     statsThunks.js · statsSlice.js · statsSelectors.js
    recipes/                   recipesThunks.js · recipesSlice.js · recipesSelectors.js
  services/                    API calls only (fake API on localStorage, dummyjson recipes)
  hooks/                       useTasks.js · useDashboardStats.js · useRecipes.js
                               (the only place with useSelector / useDispatch)
  pages/, components/          UI only
  context/AuthContext.jsx      authentication (kept in context, see below)
```

### State: what lives where

| State | Where | Why |
| --- | --- | --- |
| Tasks, lists, task details | `tasks` slice | shared by list, details and dashboard |
| Dashboard data | `stats` slice | only ids per category; numbers are computed by selectors |
| Recipes | `recipes` slice | public API, cached by page and id |
| Logged in user | `AuthContext` | the Firebase `User` object is not serializable, Redux needs plain data |
| Filters, search, page | URL (`useTaskFilters`) | links can be shared, Back button works |
| Open forms, menu, input text, messages | `useState` in components | temporary UI state |

### Slices

**`tasks`** — normalized with `createEntityAdapter`: every task is stored once in
`entities`. A list stores only `ids` + `total/page/totalPages` under a key built from the filters
(`listKey(filters)`), so the same task in two lists is not duplicated.
`details[id]` and `mutation` keep request status. `version` grows after every mutation.

**`stats`** — `byCategory["all" | category] = { ids, status, … }`. The tasks themselves are put into
`tasks.entities` (the tasks slice listens to `fetchStats.fulfilled`).

**`recipes`** — entity adapter + `pages[page]` and `details[id]`.

Every request entry has `status` (`idle | loading | succeeded | failed`), `error`, `requestId`,
`fetchedAt` and `stale`.

### Thunks (`createAsyncThunk`)

| Thunk | Type | Notes |
| --- | --- | --- |
| `fetchTasks({ filters, force })` | list | search, 3 filters, sort, pagination |
| `fetchTaskById({ id, force })` | details | 404 -> "task not found" screen |
| `createTask`, `updateTask`, `deleteTask` | mutations | update the affected data, see below |
| `fetchStats({ category, force })` | list | all tasks of a category for the dashboard |
| `fetchRecipes({ page })`, `fetchRecipeById({ id })` | list / details | offline error -> `/offline` page |

Every thunk has `pending / fulfilled / rejected` cases in `extraReducers`.
Errors are stored as plain objects `{ message, status, offline }` via `rejectWithValue`.

**Loading / error / empty** — hooks return `loading` (nothing to show yet), `fetching`
(refresh while old data is shown), `error` and `data`; pages show `Loader`, `ErrorBox` with a
Retry button, `EmptyBox`.

**Retries** — `withRetry` repeats a read request once after a random server error
(not after 404, offline or cancel). The Retry button dispatches the thunk with `force: true`.
Mutations are never repeated automatically.

**Stale requests**
- hooks call `promise.abort()` in the `useEffect` cleanup: typing in search or changing a filter
  cancels the old request (`thunkAPI.signal` is passed to the API);
- reducers save an answer only if `action.meta.requestId` is the latest request of that entry,
  so a slow old answer never overwrites a newer one;
- if a mutation finished while a read request was running (`version` changed), the answer is
  marked `outdated`: it does not overwrite newer tasks and the list stays `stale`.

**No extra requests** — the `condition` option skips a thunk when the entry was loaded less
than 30 s ago and is not `stale`. Opening a task from the list shows it from `entities` at once.

**After mutations**
- `updateTask` -> the task is replaced in `entities` (card, details and dashboard update at once),
  all lists and stats become `stale` and are loaded again when shown;
- `createTask` -> the task is added, lists and stats become `stale`;
- `deleteTask` -> the task is removed from `entities`, every list and the stats.

### Selectors

| Selector | Kind | What it returns |
| --- | --- | --- |
| `selectTaskById`, `selectListEntry`, `selectTaskMutation`, `selectStatsEntry`, `selectRecipeById` | plain | one value from the state |
| `selectTasksListResult(state, key)` | `createSelector` | ids + entities -> `{ data, total, page, totalPages }` |
| `selectStatsTasks(state, category)` | `createSelector` | ids of the category -> tasks |
| `selectDashboardStats(state, category)` | `createSelector` | 6 metrics, 3 breakdowns, next deadlines |
| `selectRecipesPage(state, page)` | `createSelector` | recipes of one page + pagination |

The dashboard numbers are not stored anywhere: they are derived from `entities`, so there is no
duplicated state, and they are recalculated only when the tasks change.

### PWA

`public/sw.js` works as in task 7. All cache names now start with `task8-` and `activate`
deletes only old `task8-` caches: all homeworks share one origin on GitHub Pages.

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

The build is copied into the `task8` folder of the `gh-pages` branch. Every build gets a new
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
| `activate` | deletes caches of old versions (`task8-static-<old version>`), takes control of open tabs          |
| `fetch`    | chooses a caching strategy for each request (see below)                                      |
| `message`  | `"SKIP_WAITING"` from the page activates the waiting new version                             |

**How the file list gets into the SW.** JS/CSS files have hashes in their names
(`index-K83CSKo-.js`), so they are not known in advance. A small plugin in `vite.config.js`
runs after `vite build`, reads all files in `dist/` and writes them into `dist/sw.js` together
with a new `BUILD_VERSION` (build time).

**Versioned caches.** The static cache is called `task8-static-<BUILD_VERSION>`. A new build means a new
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
| App shell (our JS, CSS, html, icons)       | precache → cache-first | `task8-static-<version>` | replaced every version |
| Images and fonts (recipe photos, icons)    | **cache-first**    | `task8-images-v1` | 60 entries   |
| Public API `https://dummyjson.com/recipes` (list + details) | **network-first** | `task8-api-v1` | 50 entries |
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
- Redux thunks always send the request, even offline, so the SW can answer it from the cache.

## 4. Offline

- `/offline` (`src/pages/Offline.jsx`) — dedicated page with a message, styling and a **Retry Connection** button.
  The button really checks the network (`checkConnection()` downloads `manifest.json?check=<time>` with `cache: "no-store"`),
  because `navigator.onLine` can say "online" without internet. On success the user returns to the page they wanted.
- When a recipe page cannot be loaded (offline and never opened before), the app redirects to `/offline`.
- `public/offline.html` — static fallback the SW returns if even the app shell cannot be loaded.
- Online/offline indicator in the navbar (`useOnlineStatus` hook, `online` / `offline` events) + offline banner.
- When the connection returns, data older than 30 s is loaded again the next time a page is opened.
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

## PWA files (task 7)

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
│   └── useRecipes.js        hooks for recipes (Redux since task 8)
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
- PWA: manifest, Service Worker, runtime caching, offline page, update banner, mobile layout (task 7)
- Search, 3 filters, 6 sorting options, pagination in the URL, task CRUD, dashboard, lazy pages, 404 (tasks 4–5)
