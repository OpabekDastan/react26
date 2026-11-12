import { API_CONFIG, DATA_KEY } from "./settings.js";
import { initialDataSample } from "./initial-data-sample.js";

// error object with name "AbortError", exactly like a cancelled fetch() gives
function createAbortError() {
  const error = new Error("Request aborted");
  error.name = "AbortError";
  return error;
}

// every "request" is a Promise with a random delay and a small chance of error
function fakeRequest(operation, options = {}) {
  const {
    minDelay = API_CONFIG.minDelay,
    maxDelay = API_CONFIG.maxDelay,
    errorChance = API_CONFIG.errorChance,
    signal, // AbortSignal from AbortController (optional)
  } = options;

  return new Promise((resolve, reject) => {
    // request was cancelled before it even started
    if (signal && signal.aborted) {
      reject(createAbortError());
      return;
    }

    const delayMS =
      Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

    const timer = setTimeout(() => {
      if (signal) {
        signal.removeEventListener("abort", handleAbort);
      }

      if (Math.random() < errorChance) {
        reject(new Error("Simulated server error"));
        return;
      }

      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, delayMS);

    // controller.abort() -> we stop the timer and reject with AbortError
    function handleAbort() {
      clearTimeout(timer);
      reject(createAbortError());
    }

    if (signal) {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  });
}

function initializeDatabase() {
  if (!localStorage.getItem(DATA_KEY)) {
    localStorage.setItem(DATA_KEY, JSON.stringify(initialDataSample));
  }
}

function readData() {
  return JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
}

function writeData(items) {
  localStorage.setItem(DATA_KEY, JSON.stringify(items));
}

initializeDatabase();

// High / Medium / Low -> number, so we can sort by priority
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

export async function getItemsList(query = "", options = {}) {
  return fakeRequest(() => {
    const params = new URLSearchParams(query);

    const search = params.get("search") || "";
    const category = params.get("category") || "";
    const priority = params.get("priority") || "";
    const status = params.get("status") || ""; // "done" | "active"
    const sort = params.get("sort") || "name";
    const page = Number(params.get("page")) || 1;
    const limit = Number(params.get("limit")) || 10;

    let items = readData();

    // SEARCH by name and description
    if (search) {
      const text = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(text) ||
          item.description.toLowerCase().includes(text),
      );
    }

    // FILTER 1: category
    if (category) {
      items = items.filter((item) => item.category === category);
    }

    // FILTER 2: priority
    if (priority) {
      items = items.filter((item) => item.priority === priority);
    }

    // FILTER 3: status (done / active)
    if (status === "done") {
      items = items.filter((item) => item.completed === true);
    }
    if (status === "active") {
      items = items.filter((item) => item.completed === false);
    }

    // SORT
    items = [...items].sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "deadline":
          return a.deadline.localeCompare(b.deadline);
        case "deadline-desc":
          return b.deadline.localeCompare(a.deadline);
        case "priority":
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        case "hours":
          return b.estimatedHours - a.estimatedHours;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // PAGINATION
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    // if the user asks for page 5 but after filtering there are only 2 pages
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * limit;

    return {
      data: items.slice(start, start + limit),
      total,
      page: safePage,
      limit,
      totalPages,
    };
  }, options);
}

// GET /items/:id
export async function getItem(id, options = {}) {
  return fakeRequest(() => {
    const items = readData();
    const item = items.find((item) => item.id === Number(id));

    if (!item) {
      const error = new Error("Item not found");
      error.status = 404; // so the page can show "task not found", not "server error"
      throw error;
    }

    return item;
  }, options);
}

// POST /items
export async function createItem(data, options = {}) {
  return fakeRequest(() => {
    const items = readData();
    const nextId =
      items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

    const newItem = { ...data, id: nextId };

    writeData([...items, newItem]);

    return newItem;
  }, options);
}

// PATCH /items/:id
export async function updateItem(id, changes, options = {}) {
  return fakeRequest(() => {
    const numericId = Number(id);
    const items = readData();

    if (!items.some((item) => item.id === numericId)) {
      const error = new Error("Item not found");
      error.status = 404;
      throw error;
    }

    const updatedItems = items.map((item) =>
      item.id === numericId ? { ...item, ...changes, id: numericId } : item,
    );

    writeData(updatedItems);

    return updatedItems.find((item) => item.id === numericId);
  }, options);
}

// DELETE /items/:id
export async function deleteItem(id, options = {}) {
  return fakeRequest(() => {
    const numericId = Number(id);
    const items = readData();

    if (!items.some((item) => item.id === numericId)) {
      const error = new Error("Item not found");
      error.status = 404;
      throw error;
    }

    writeData(items.filter((item) => item.id !== numericId));

    return { success: true, id: numericId };
  }, options);
}
