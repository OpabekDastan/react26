import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";

// value of every filter when it is NOT in the URL
const DEFAULTS = {
  search: "",
  category: "",
  priority: "",
  status: "",
  sort: "name",
  page: 1,
};

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") || DEFAULTS.search,
      category: searchParams.get("category") || DEFAULTS.category,
      priority: searchParams.get("priority") || DEFAULTS.priority,
      status: searchParams.get("status") || DEFAULTS.status,
      sort: searchParams.get("sort") || DEFAULTS.sort,
      page: Number(searchParams.get("page")) || DEFAULTS.page,
    }),
    [searchParams],
  );

  const setFilters = useCallback(
    (changes, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);

          Object.entries(changes).forEach(([key, value]) => {
            const isEmpty = value === "" || value === null || value === undefined;

            if (isEmpty || String(value) === String(DEFAULTS[key])) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });

          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  // one filter; any filter except "page" returns the user to the first page
  const setFilter = useCallback(
    (key, value, options) => {
      const changes = key === "page" ? { page: value } : { [key]: value, page: 1 };
      setFilters(changes, options);
    },
    [setFilters],
  );

  const resetFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  const hasFilters =
    filters.search !== DEFAULTS.search ||
    filters.category !== DEFAULTS.category ||
    filters.priority !== DEFAULTS.priority ||
    filters.status !== DEFAULTS.status ||
    filters.sort !== DEFAULTS.sort;

  return { filters, setFilter, setFilters, resetFilters, hasFilters };
}
