import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAllTasks } from "../../services/service.js";
import { isFresh, withRetry, rejectRequest } from "../shared/requestHelpers.js";

// "" (all categories) is stored under the key "all"
export function statsKey(category) {
  return category || "all";
}

// all tasks of one category: the dashboard calculates its numbers from them
export const fetchStats = createAsyncThunk(
  "stats/fetch",
  async ({ category }, { signal, getState, rejectWithValue }) => {
    const startVersion = getState().tasks.version;

    try {
      const result = await withRetry(() => getAllTasks({ category }, signal), signal);
      return {
        tasks: result.data,
        fetchedAt: Date.now(),
        outdated: getState().tasks.version !== startVersion,
      };
    } catch (error) {
      return rejectRequest(error, signal, rejectWithValue);
    }
  },
  {
    condition: ({ category, force }, { getState }) =>
      force || !isFresh(getState().stats.byCategory[statsKey(category)]),
  },
);
