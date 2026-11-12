import {
  getItemsList,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "../api/fakeApi.js";

// how many cards we show on one page of /tasks
export const PAGE_SIZE = 6;

// options for the <select> elements (used by filters and by the task form)
export const CATEGORIES = ["Study", "Work", "Project", "Personal", "Health"];
export const PRIORITIES = ["High", "Medium", "Low"];

export const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
];

export const SORT_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "deadline", label: "Deadline: soonest first" },
  { value: "deadline-desc", label: "Deadline: latest first" },
  { value: "priority", label: "Priority: high first" },
  { value: "hours", label: "Estimated hours: most first" },
];

// { search: "react", page: 2 } -> "search=react&page=2" (empty values are skipped)
function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export function getTasks(params = {}, signal) {
  return getItemsList(buildQuery({ limit: PAGE_SIZE, ...params }), { signal });
}

// all tasks at once (used by the dashboard to calculate statistics)
export function getAllTasks(params = {}, signal) {
  return getItemsList(buildQuery({ ...params, page: 1, limit: 1000 }), {
    signal,
  });
}

export function getTaskById(id, signal) {
  if (!/^\d+$/.test(String(id))) {
    const error = new Error("Item not found");
    error.status = 404;
    return Promise.reject(error);
  }

  return getItem(id, { signal });
}

// create a task: we add the fields that the form does not ask about
export function createTask(formData, signal) {
  const today = new Date().toISOString().slice(0, 10);

  return createItem(
    {
      ...formData,
      estimatedHours: Number(formData.estimatedHours) || 1,
      completed: false,
      createdAt: today,
    },
    { signal },
  );
}

export function updateTask(id, changes, signal) {
  return updateItem(id, changes, { signal });
}

export function deleteTask(id, signal) {
  return deleteItem(id, { signal });
}
