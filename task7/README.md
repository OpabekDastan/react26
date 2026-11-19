# Task 6 — Server Data, Caching & Firebase Authentication

Task Manager SPA built with React + React Router on top of task 5.
New in this homework: Firebase Authentication (Email/Password + Google), protected routes,
environment variables and server-data caching with TanStack Query.

**Live demo:** https://opabekdastan.github.io/react26/task6/

## Run

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase config
npm run dev
```

## Firebase setup

1. Create a project in the [Firebase console](https://console.firebase.google.com/) and add a **Web app**.
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Authentication → Settings → Authorized domains**: add `localhost` and `opabekdastan.github.io`.
4. Copy the web app config into `.env.local`:

| Variable                             | Where to find it        |
| ------------------------------------ | ----------------------- |
| `VITE_FIREBASE_API_KEY`              | `apiKey`                |
| `VITE_FIREBASE_AUTH_DOMAIN`          | `authDomain`            |
| `VITE_FIREBASE_PROJECT_ID`           | `projectId`             |
| `VITE_FIREBASE_STORAGE_BUCKET`       | `storageBucket`         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`  | `messagingSenderId`     |
| `VITE_FIREBASE_APP_ID`               | `appId`                 |

`.env.local` is in `.gitignore`, only the template `.env.example` is committed.
Vite exposes to the browser only the variables with the `VITE_` prefix.

## Deploy (GitHub Pages)

```bash
npm run deploy
```

The app is built into `dist` and copied into the `task6` folder of the `gh-pages` branch.
Vite puts the values from `.env.local` into the bundle at build time, so the file must exist when you deploy.

## Routes

| Route          | Page                                         |
| -------------- | -------------------------------------------- |
| `/`            | Home                                         |
| `/about`       | About (me + the project)                     |
| `/items`       | Tasks list                                   |
| `/items/:id`   | Task details                                 |
| `/dashboard`   | Dashboard with statistics                    |
| `/login`       | Email/password login + Google sign-in        |
| `/signup`      | Email, password, confirm password            |
| `/profile`     | **Protected**: email, UID, logout            |
| `*`            | Custom 404                                   |

A guest who opens `/profile` is redirected to `/login`; after signing in they are sent back to the page they wanted.
The NavBar shows **Login / Sign up** for guests and **Profile / Logout** for logged in users.

## Authentication

- `src/firebase.js` — initializes Firebase from the env variables, sets `browserLocalPersistence`.
- `src/services/authService.js` — all Firebase auth calls + readable error messages.
- `src/context/AuthContext.jsx` — `AuthProvider` and `useAuth()`:
  - `user` is tracked with `onAuthStateChanged`;
  - `loading` is `true` until Firebase restores the saved session (so a refresh does not log the user out and protected pages do not "flash" to `/login`);
  - `pending` / `error` — state of the current login / signup / logout request;
  - `signup`, `login`, `loginWithGoogle`, `logout`, `clearError`.
- `src/components/ProtectedRoute.jsx` — wrapper route that redirects guests to `/login`.

## Caching strategy

Server data is cached with **TanStack Query** (`src/services/queryClient.js`, `src/hooks/useTasks.js`).

**Query keys** — every request has its own cache entry:

| Key                                      | Data                                     |
| ---------------------------------------- | ---------------------------------------- |
| `["tasks", "list", filters]`             | one page of `/items` for these filters   |
| `["tasks", "stats", { category }]`       | all tasks for the dashboard              |
| `["tasks", "detail", id]`                | one task                                 |

Because the filters (search, category, priority, status, sort, page) are part of the key,
going back to a page or filter that was already opened shows the data at once, without a loader.

**Expiration / revalidation**

- `staleTime: 30s` — during 30 seconds cached data is fresh and no request is sent.
- After that the data is *stale*: it is still shown immediately, but a background request revalidates it
  (when the page is opened again or the browser tab gets focus). The list shows "· updating..." meanwhile.
- `gcTime: 5 min` — a cache entry nobody uses for 5 minutes is removed from memory.
- `retry` — one retry for random server errors, no retry for 404.

**When the cache is invalidated**

| Operation                         | What happens to the cache                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------- |
| Create task                       | new task is put into `detail`, all `list` and `stats` entries are invalidated               |
| Update task (edit / mark as done) | `detail` is replaced with the API answer, all `list` and `stats` entries are invalidated    |
| Delete task                       | `detail` entry is removed, all `list` and `stats` entries are invalidated                   |

Invalidated entries that are on the screen are refetched right away, the others — the next time they are opened.

**Outdated requests** — TanStack Query passes an `AbortSignal` to every request (our fake API supports it).
When the filters change, the request for the old key is cancelled, and its result can be written only into
the old key, so it never overwrites the newer result on the screen.

**Loading / error / empty states** — loader on the first load, error box with "Try again" (only when there is no
cached data to show), "No tasks match your filters" / "There are no tasks in this category" for empty results.

## Project structure

```
src/
├── api/                    fake backend (not imported by components)
│   ├── fakeApi.js          delay, random errors, filters, sort, pagination, abort
│   ├── initial-data-sample.js  24 seed tasks, 10 fields each
│   └── settings.js
├── services/
│   ├── service.js          ALL task requests of the app live here
│   ├── authService.js      ALL Firebase auth calls
│   └── queryClient.js      TanStack Query cache settings
├── context/
│   └── AuthContext.jsx     AuthProvider + useAuth
├── hooks/
│   ├── useTasks.js             query keys, cached queries and mutations with invalidation
│   ├── useTaskFilters.js       filters <-> URL (useSearchParams)
│   ├── useDebouncedValue.js    delay before sending the search request
│   └── usePageTitle.js         changes the browser tab title
├── components/
│   ├── RootLayout.jsx      NavBar + <Outlet /> + <Suspense>
│   ├── NavBar.jsx          links depend on the auth state
│   ├── ProtectedRoute.jsx  redirect guests to /login
│   ├── Card.jsx / Filters.jsx / Pagination.jsx / TaskForm.jsx
│   ├── StatCard.jsx / Breakdown.jsx
│   └── Loader.jsx / ErrorBox.jsx / EmptyBox.jsx
├── pages/                  one file per route
├── styles/                 index.css (tokens) + App.css (components)
├── utils/format.js         date helpers
├── firebase.js             Firebase initialization
├── App.jsx                 ONLY the routes
└── main.jsx                QueryClientProvider + AuthProvider + Router
```

## Features

- Firebase auth: signup, login, Google sign-in, logout, persistent session, readable errors
- Protected `/profile` route and auth-aware NavBar
- Cached server data with query keys, revalidation and invalidation after create / update / delete
- Everything from task 5 is preserved: nested routes, search, 3 filters, 6 sorting options and pagination in the URL,
  task details, dashboard with statistics, lazy loading, custom 404, light and dark theme
