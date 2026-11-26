import { createSelector } from "@reduxjs/toolkit";
import { tasksAdapter } from "./tasksSlice.js";

// ready selectors of the entity adapter: selectById, selectEntities, ...
const adapterSelectors = tasksAdapter.getSelectors((state) => state.tasks);

// ---------- simple selectors ----------
export const selectTaskEntities = adapterSelectors.selectEntities;

export const selectTaskById = (state, id) => adapterSelectors.selectById(state, Number(id));

export const selectListEntry = (state, key) => state.tasks.lists[key];

export const selectTaskDetailsEntry = (state, id) => state.tasks.details[String(id)];

export const selectTaskMutation = (state) => state.tasks.mutation;

// ---------- memoized selector ----------
// ids of the list + entities -> the object that the list page shows.
// The result is recalculated only when the list or a task changes, so the page does not re-render for nothing
export const selectTasksListResult = createSelector(
  [selectListEntry, selectTaskEntities],
  (entry, entities) => {
    if (!entry || !entry.fetchedAt) {
      return null;
    }

    return {
      data: entry.ids.map((id) => entities[id]).filter(Boolean),
      total: entry.total,
      page: entry.page,
      totalPages: entry.totalPages,
    };
  },
);
