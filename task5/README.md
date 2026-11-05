# Task 4 — Async React: Effects & API

Task Manager app that works with a fake async API (Promises, random delay, random errors, localStorage).

## Run

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages)

## Link https://opabekdastan.github.io/react26/task4

```bash
npm run deploy
```

The app is built into `dist` and copied into the `task4` folder of the `gh-pages` branch.

## Features

- List of tasks loaded with `useEffect`
- Search and Reload button
- Details of a task loaded asynchronously (10 fields)
- Create, Edit, Delete
- Mark as done / not done through the API
- Loading, error, empty and success states

## Defense notes

**useEffect** — runs code after render. I use it to load the list and to load details.

**Dependencies** — `[search, reloadCount]` for the list, `[selectedId, detailsReloadCount]` for details. When one of them changes, the effect runs again.

**Cleanup** — every effect returns a function that sets `ignore = true`. React calls it before the next run, so the old request result is not used.

**Race condition** — I click task 1, then quickly task 2. Request 1 can finish later than request 2. Because of `ignore`, the old answer is ignored and I always see task 2.

**Stale closure** — in `handleToggleComplete` I save `taskId` and `newValue` at the start. All buttons are disabled while `busyId` is not null. When the answer comes, I update the list with `prev.map(...)` by `updated.id`, and I update details only if the same task is still opened.

**localStorage** — components do not use it. Only `src/api/fakeApi.js` uses it.
