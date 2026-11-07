# Task 5 — Routing & Application Architecture

Task Manager SPA built with React + React Router on top of the fake async API from task 4.

**Live demo:** https://opabekdastan.github.io/react26/task5/

## Run

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

```bash
npm run deploy
```

The app is built into `dist` and copied into the `task5` folder of the `gh-pages` branch.

## Routes

| Route          | Page                             |
| -------------- | -------------------------------- |
| `/`            | Home                             |
| `/about`       | About (me + the project)          |
| `/items`       | Tasks list                       |
| `/items/:id`   | Task details                     |
| `/dashboard`   | Dashboard with statistics        |
| `/login`       | Login placeholder                |
| `*`            | Custom 404                       |

## Project structure

```
src/
├── api/                    fake backend (not imported by components)
│   ├── fakeApi.js          delay, random errors, filters, sort, pagination, abort
│   ├── initial-data-sample.js  24 seed tasks, 10 fields each
│   └── settings.js
├── services/
│   └── service.js          ALL requests of the app live here
├── hooks/
│   ├── useTaskFilters.js       filters <-> URL (useSearchParams)
│   ├── useFetch.js             loading / error / data + AbortController
│   ├── useDebouncedValue.js    delay before sending the search request
│   └── usePageTitle.js         changes the browser tab title
├── components/
│   ├── RootLayout.jsx      NavBar + <Outlet /> + <Suspense>
│   ├── NavBar.jsx          NavLink with active highlighting
│   ├── Card.jsx            reusable task card
│   ├── Filters.jsx         search + 3 filters + sorting
│   ├── Pagination.jsx
│   ├── TaskForm.jsx        one form for create and edit
│   ├── StatCard.jsx        one number on the dashboard
│   ├── Breakdown.jsx       bar list for the dashboard
│   ├── Loader.jsx / ErrorBox.jsx / EmptyBox.jsx
├── pages/                  one file per route
├── styles/                 index.css (tokens) + App.css (components)
├── utils/format.js         date helpers
├── App.jsx                 ONLY the routes
└── main.jsx                Router + StrictMode
```

## Features

- Nested routes: `RootLayout` → pages, and `/items` → `/items/:id`
- Search, 3 filters (category, priority, status), 6 sorting options, pagination — all stored in the URL
- Task details with 10 fields loaded by id
- Dashboard: 6 statistics, 3 breakdowns, interactive category filter
- Lazy loading of 5 pages, custom 404
- Create / edit / delete / mark as done — all functionality from task 4 is preserved
- Loading, error, empty and "not found" states everywhere
- Responsive layout, light and dark theme
