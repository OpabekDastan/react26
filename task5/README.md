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

---

## Шпаргалка для защиты

### Почему App.jsx такой короткий

В `App.jsx` только `<Routes>`. Вся общая обвязка (шапка, подвал) вынесена в `RootLayout`,
который является **родительским маршрутом**. Вложенные маршруты рисуются внутри него
в месте, где стоит `<Outlet />`.

```
<Route path="/" element={<RootLayout />}>   ← родитель: NavBar + Outlet
  <Route index element={<Home />} />        ← index = сам путь "/"
  <Route path="items">                      ← второй уровень вложенности
    <Route index element={<ItemsList />} />      /items
    <Route path=":id" element={<ItemDetails />} /> /items/5
  </Route>
  <Route path="*" element={<NotFound />} />  ← всё, что не совпало
</Route>
```

### useSearchParams — фильтры в адресной строке

`useSearchParams` работает как `useState`, но состояние хранится **в URL**:

```
/items?search=react&category=Study&priority=High&sort=deadline&page=2
```

Благодаря этому работают кнопки Назад/Вперёд, F5 и обычная отправка ссылки другу —
вид страницы восстанавливается полностью. Отдельного `useState` для фильтров нет,
URL — единственный источник правды. При смене любого фильтра `page` сбрасывается на 1.

Поиск — единственное исключение: пока пользователь печатает, значение лежит в локальном
`useState` (чтобы ввод не тормозил), и только через 400 мс (хук `useDebouncedValue`)
попадает в URL с флагом `{ replace: true }`, чтобы каждая буква не засоряла историю.

### useParams — динамический URL

```jsx
const { id } = useParams();   // маршрут :id, адрес /items/7 → id === "7" (строка!)
```

Дальше `id` передаётся в `getTaskById(id)`. Эффект зависит от `[id]`, поэтому при
переходе на другую задачу данные перезагружаются.

### AbortController — отмена устаревших запросов

Проблема: открыл задачу 1, быстро открыл задачу 2. Запрос №1 может прийти позже
запроса №2 и перезатереть правильные данные.

```jsx
useEffect(() => {
  const controller = new AbortController();

  async function loadTask() {
    try {
      const data = await getTaskById(id, controller.signal);
      setTask(data);
    } catch (err) {
      if (err.name === "AbortError") return;  // старый ответ — просто игнорируем
      setError(err.message);
    }
  }

  loadTask();
  return () => controller.abort();   // cleanup: React вызывает перед новым запуском
}, [id]);
```

Фейковое API это честно поддерживает: в `fakeApi.js` при событии `abort`
очищается `setTimeout` и промис отклоняется ошибкой с `name === "AbortError"`.

### React.lazy и Suspense

```jsx
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
```

Vite собирает каждую такую страницу в отдельный файл, и браузер скачивает её только
когда пользователь туда зашёл. Это видно в выводе `npm run build`:
`About`, `Login`, `Dashboard`, `ItemDetails`, `NotFound` — пять отдельных чанков.

`<Suspense fallback={...}>` стоит в `RootLayout` вокруг `<Outlet />`, поэтому во время
загрузки чанка показывается лоадер, а NavBar остаётся на месте.

### Слой сервисов

Компоненты **никогда** не импортируют `api/fakeApi.js`. Они зовут функции из
`services/service.js` (`getTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`).
Если завтра заменить фейковое API на настоящий `fetch`, поменяется только один файл.

Фильтрация, сортировка и пагинация считаются **на стороне API** (как у настоящего
сервера): сервис собирает query-строку, API возвращает `{ data, total, page, totalPages }`.

### Почему HashRouter, а не BrowserRouter

GitHub Pages — статический сервер. С `BrowserRouter` обновление страницы на
`/task5/items/3` заставило бы GitHub искать файл `items/3` и вернуть 404.
`HashRouter` держит маршрут после `#` (`/task5/#/items/3`), сервер всегда отдаёт
`index.html`, и прямые ссылки, F5 и Назад/Вперёд работают везде.

На хостинге с SPA-fallback (Netlify, Vercel) достаточно заменить в `main.jsx`
`HashRouter` на `BrowserRouter` — больше ничего менять не нужно.

### Обработка состояний

Каждая страница с данными проходит одинаковый путь: `loading` → `error` → `empty` → данные.
У деталей есть ещё отдельное состояние `notFound` (ошибка со `status: 404`), чтобы
отличать «такой задачи нет» от «сервер упал». Нечисловой id (`/items/abc`) отсеивается
регуляркой **до** запроса — API зря не дёргается.
