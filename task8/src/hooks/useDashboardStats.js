import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStats } from "../features/stats/statsThunks.js";
import { selectStatsEntry, selectDashboardStats } from "../features/stats/statsSelectors.js";

// all numbers of the dashboard for one category ("" = all categories)
export function useDashboardStats(category) {
  const dispatch = useDispatch();

  const entry = useSelector((state) => selectStatsEntry(state, category));
  const stats = useSelector((state) => selectDashboardStats(state, category));
  const stale = Boolean(entry?.stale);

  useEffect(() => {
    const request = dispatch(fetchStats({ category }));
    return () => request.abort();
  }, [dispatch, category, stale]);

  const reload = useCallback(
    () => dispatch(fetchStats({ category, force: true })),
    [dispatch, category],
  );

  const loaded = Boolean(entry?.fetchedAt);
  const failed = entry?.status === "failed";

  return {
    stats,
    loading: !loaded && !failed,
    error: failed && !loaded ? entry.error : null, // a failed refresh keeps the old numbers
    reload,
  };
}
