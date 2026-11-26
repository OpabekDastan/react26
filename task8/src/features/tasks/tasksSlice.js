import { createSlice, createEntityAdapter, isPending, isRejected } from "@reduxjs/toolkit";
import {
  listKey,
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "./tasksThunks.js";
import { fetchStats } from "../stats/statsThunks.js";
import { errorFromAction } from "../shared/requestHelpers.js";

// every task is stored ONCE in entities { [id]: task }; lists keep only ids -> no duplicated data
export const tasksAdapter = createEntityAdapter();

const initialState = tasksAdapter.getInitialState({
  // key of the filters -> { ids, total, page, totalPages, status, error, requestId, fetchedAt, stale }
  lists: {},
  // id -> { status, error, requestId, fetchedAt, stale }
  details: {},
  // create / update / delete that is running now
  mutation: { status: "idle", operation: null, error: null },
  // +1 after every successful mutation (thunks use it to detect outdated answers)
  version: 0,
});

function emptyEntry() {
  return { status: "idle", error: null, requestId: null, fetchedAt: null, stale: false };
}

function markListsStale(state) {
  Object.values(state.lists).forEach((list) => {
    list.stale = true; // the list is shown, but loaded again when it is opened
  });
}

// an answer of an old request (user typed further, changed a filter) is ignored
function isCurrent(entry, action) {
  return Boolean(entry) && entry.requestId === action.meta.requestId;
}

// a cancelled request returns the entry to the state it had before
function finishAborted(entry) {
  entry.status = entry.fetchedAt ? "succeeded" : "idle";
}

// an answer that started before a mutation may hold old versions of tasks: do not overwrite newer ones
function saveTasks(state, tasks, outdated) {
  if (outdated) {
    tasksAdapter.addMany(state, tasks);
  } else {
    tasksAdapter.upsertMany(state, tasks);
  }
}

const MUTATIONS = [createTask, updateTask, deleteTask];

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------- list ----------
      .addCase(fetchTasks.pending, (state, action) => {
        const key = listKey(action.meta.arg.filters);
        const entry = state.lists[key] ?? { ...emptyEntry(), ids: [], total: 0, page: 1, totalPages: 1 };

        entry.status = "loading";
        entry.error = null;
        entry.requestId = action.meta.requestId; // only this request may write the result
        state.lists[key] = entry;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const entry = state.lists[listKey(action.meta.arg.filters)];
        if (!isCurrent(entry, action)) return;

        const { data, total, page, totalPages, fetchedAt, outdated } = action.payload;
        saveTasks(state, data, outdated);

        entry.ids = data.map((task) => task.id);
        entry.total = total;
        entry.page = page;
        entry.totalPages = totalPages;
        entry.fetchedAt = fetchedAt;
        entry.stale = outdated;
        entry.status = "succeeded";
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        const entry = state.lists[listKey(action.meta.arg.filters)];
        if (!isCurrent(entry, action)) return;

        if (action.meta.aborted) {
          finishAborted(entry);
          return;
        }
        entry.status = "failed";
        entry.error = errorFromAction(action);
      })

      // ---------- details ----------
      .addCase(fetchTaskById.pending, (state, action) => {
        const key = String(action.meta.arg.id);
        const entry = state.details[key] ?? emptyEntry();

        entry.status = "loading";
        entry.error = null;
        entry.requestId = action.meta.requestId;
        state.details[key] = entry;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        const entry = state.details[String(action.meta.arg.id)];
        if (!isCurrent(entry, action)) return;

        const { task, fetchedAt, outdated } = action.payload;
        saveTasks(state, [task], outdated);

        entry.fetchedAt = fetchedAt;
        entry.stale = outdated;
        entry.status = "succeeded";
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        const key = String(action.meta.arg.id);
        const entry = state.details[key];
        if (!isCurrent(entry, action)) return;

        if (action.meta.aborted) {
          finishAborted(entry);
          return;
        }
        entry.status = "failed";
        entry.error = errorFromAction(action);

        // the task does not exist any more -> remove the old copy from the lists' data
        if (entry.error.status === 404) {
          tasksAdapter.removeOne(state, Number(key));
        }
      })

      // ---------- dashboard data also contains tasks: they go to the same entities ----------
      .addCase(fetchStats.fulfilled, (state, action) => {
        saveTasks(state, action.payload.tasks, action.payload.outdated);
      })

      // ---------- mutations: update the changed data in place, mark the lists as stale ----------
      .addCase(createTask.fulfilled, (state, action) => {
        const { task, fetchedAt } = action.payload;

        tasksAdapter.addOne(state, task);
        state.details[String(task.id)] = { ...emptyEntry(), status: "succeeded", fetchedAt };
        markListsStale(state); // the new task can appear in any list
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const { task, fetchedAt } = action.payload;

        tasksAdapter.upsertOne(state, task); // the card, details and dashboard change at once
        state.details[String(task.id)] = { ...emptyEntry(), status: "succeeded", fetchedAt };
        markListsStale(state); // filters / sorting may now put the task somewhere else
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        const { id } = action.payload;

        tasksAdapter.removeOne(state, id);
        delete state.details[String(id)];
        Object.values(state.lists).forEach((list) => {
          list.ids = list.ids.filter((taskId) => taskId !== id);
        });
        markListsStale(state); // totals and pages changed
      })

      // common part of the three mutations
      .addMatcher(isPending(...MUTATIONS), (state, action) => {
        state.mutation = { status: "loading", operation: action.type.split("/")[1], error: null };
      })
      .addMatcher(
        (action) => MUTATIONS.some((thunk) => thunk.fulfilled.match(action)),
        (state) => {
          state.mutation = { status: "succeeded", operation: null, error: null };
          state.version += 1;
        },
      )
      .addMatcher(isRejected(...MUTATIONS), (state, action) => {
        state.mutation = {
          status: "failed",
          operation: action.type.split("/")[1],
          error: errorFromAction(action),
        };
      });
  },
});

export default tasksSlice.reducer;
