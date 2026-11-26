import { createSlice } from "@reduxjs/toolkit";
import { statsKey, fetchStats } from "./statsThunks.js";
import { createTask, updateTask, deleteTask } from "../tasks/tasksThunks.js";
import { errorFromAction } from "../shared/requestHelpers.js";

// only ids are stored here: the tasks themselves live in tasks.entities,
// the numbers of the dashboard are calculated by selectors (see statsSelectors.js)
const initialState = {
  // "all" | category -> { ids, status, error, requestId, fetchedAt, stale }
  byCategory: {},
};

function markAllStale(state) {
  Object.values(state.byCategory).forEach((entry) => {
    entry.stale = true;
  });
}

const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state, action) => {
        const key = statsKey(action.meta.arg.category);
        const entry = state.byCategory[key] ?? {
          ids: [],
          status: "idle",
          error: null,
          requestId: null,
          fetchedAt: null,
          stale: false,
        };

        entry.status = "loading";
        entry.error = null;
        entry.requestId = action.meta.requestId;
        state.byCategory[key] = entry;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        const entry = state.byCategory[statsKey(action.meta.arg.category)];
        if (!entry || entry.requestId !== action.meta.requestId) return; // old request

        entry.ids = action.payload.tasks.map((task) => task.id);
        entry.fetchedAt = action.payload.fetchedAt;
        entry.stale = action.payload.outdated;
        entry.status = "succeeded";
      })
      .addCase(fetchStats.rejected, (state, action) => {
        const entry = state.byCategory[statsKey(action.meta.arg.category)];
        if (!entry || entry.requestId !== action.meta.requestId) return;

        if (action.meta.aborted) {
          entry.status = entry.fetchedAt ? "succeeded" : "idle";
          return;
        }
        entry.status = "failed";
        entry.error = errorFromAction(action);
      })

      // after a mutation the statistics are recalculated on the next visit of the dashboard
      .addCase(createTask.fulfilled, markAllStale)
      .addCase(updateTask.fulfilled, markAllStale)
      .addCase(deleteTask.fulfilled, (state, action) => {
        Object.values(state.byCategory).forEach((entry) => {
          entry.ids = entry.ids.filter((id) => id !== action.payload.id);
        });
        markAllStale(state);
      });
  },
});

export default statsSlice.reducer;
