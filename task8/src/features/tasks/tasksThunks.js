import { createAsyncThunk } from "@reduxjs/toolkit";
import * as taskService from "../../services/service.js";
import { isFresh, withRetry, rejectRequest } from "../shared/requestHelpers.js";

// every combination of filters is a separate list in the store
export function listKey(filters) {
  return JSON.stringify([
    filters.search,
    filters.category,
    filters.priority,
    filters.status,
    filters.sort,
    filters.page,
  ]);
}

// true when a task was created / changed / deleted while this request was running:
// its answer can be older than the data in the store
function isOutdated(getState, startVersion) {
  return getState().tasks.version !== startVersion;
}

// ---------- 1. list (search, filters, sorting, pagination) ----------
export const fetchTasks = createAsyncThunk(
  "tasks/fetchList",
  async ({ filters }, { signal, getState, rejectWithValue }) => {
    const startVersion = getState().tasks.version;

    try {
      const result = await withRetry(() => taskService.getTasks(filters, signal), signal);
      return { ...result, fetchedAt: Date.now(), outdated: isOutdated(getState, startVersion) };
    } catch (error) {
      return rejectRequest(error, signal, rejectWithValue);
    }
  },
  {
    // no request if the same list was loaded less than 30s ago (force = "Retry" button)
    condition: ({ filters, force }, { getState }) =>
      force || !isFresh(getState().tasks.lists[listKey(filters)]),
  },
);

// ---------- 2. details of one task ----------
export const fetchTaskById = createAsyncThunk(
  "tasks/fetchById",
  async ({ id }, { signal, getState, rejectWithValue }) => {
    const startVersion = getState().tasks.version;

    try {
      const task = await withRetry(() => taskService.getTaskById(id, signal), signal);
      return { task, fetchedAt: Date.now(), outdated: isOutdated(getState, startVersion) };
    } catch (error) {
      return rejectRequest(error, signal, rejectWithValue);
    }
  },
  {
    condition: ({ id, force }, { getState }) =>
      force || !isFresh(getState().tasks.details[String(id)]),
  },
);

// ---------- 3. mutations (not repeated automatically: the user decides) ----------
export const createTask = createAsyncThunk(
  "tasks/create",
  async (formData, { rejectWithValue }) => {
    try {
      const task = await taskService.createTask(formData);
      return { task, fetchedAt: Date.now() };
    } catch (error) {
      return rejectRequest(error, null, rejectWithValue);
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      const task = await taskService.updateTask(id, changes);
      return { task, fetchedAt: Date.now() };
    } catch (error) {
      return rejectRequest(error, null, rejectWithValue);
    }
  },
);

export const deleteTask = createAsyncThunk("tasks/delete", async (id, { rejectWithValue }) => {
  try {
    await taskService.deleteTask(id);
    return { id: Number(id) };
  } catch (error) {
    return rejectRequest(error, null, rejectWithValue);
  }
});
