import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listKey,
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../features/tasks/tasksThunks.js";
import {
  selectListEntry,
  selectTasksListResult,
  selectTaskById,
  selectTaskDetailsEntry,
  selectTaskMutation,
} from "../features/tasks/tasksSelectors.js";

// ---------- list of tasks for the current filters ----------
export function useTasksList(filters) {
  const dispatch = useDispatch();
  const key = listKey(filters);

  const entry = useSelector((state) => selectListEntry(state, key));
  const result = useSelector((state) => selectTasksListResult(state, key));
  const stale = Boolean(entry?.stale);

  useEffect(() => {
    // condition in the thunk skips the request when the list is still fresh
    const request = dispatch(fetchTasks({ filters }));

    // filters changed / page closed -> the old request is cancelled (stale request)
    return () => request.abort();
    // key describes the filters completely; stale = a mutation changed the data -> load again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, key, stale]);

  const reload = useCallback(
    () => dispatch(fetchTasks({ filters, force: true })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch, key],
  );

  const failed = entry?.status === "failed";

  return {
    data: result, // null until the first answer
    loading: !result && !failed, // first load: nothing to show yet
    fetching: entry?.status === "loading", // also true while old data is shown
    error: failed ? entry.error : null,
    reload,
  };
}

// ---------- one task ----------
export function useTask(id) {
  const dispatch = useDispatch();

  // a task that is already in a list is shown at once, the details are checked in the background
  const task = useSelector((state) => selectTaskById(state, id));
  const entry = useSelector((state) => selectTaskDetailsEntry(state, id));

  useEffect(() => {
    const request = dispatch(fetchTaskById({ id }));
    return () => request.abort();
  }, [dispatch, id]);

  const reload = useCallback(() => dispatch(fetchTaskById({ id, force: true })), [dispatch, id]);

  const failed = entry?.status === "failed";

  return {
    task,
    loading: !task && !failed,
    error: failed ? entry.error : null,
    reload,
  };
}

// ---------- create / update / delete ----------
export function useTaskActions() {
  const dispatch = useDispatch();
  const mutation = useSelector(selectTaskMutation);

  // unwrap(): the page gets the result or a thrown error and can show it in its own UI
  const create = useCallback((formData) => dispatch(createTask(formData)).unwrap(), [dispatch]);

  const update = useCallback(
    (id, changes) => dispatch(updateTask({ id, changes })).unwrap(),
    [dispatch],
  );

  const remove = useCallback((id) => dispatch(deleteTask(id)).unwrap(), [dispatch]);

  const busy = mutation.status === "loading";

  return {
    create,
    update,
    remove,
    busy,
    creating: busy && mutation.operation === "create",
    updating: busy && mutation.operation === "update",
  };
}
