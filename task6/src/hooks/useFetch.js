import { useState, useEffect, useCallback } from "react";

export function useFetch(requestFn, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  // we keep the whole Error object, so a page can check error.status === 404
  const [error, setError] = useState(null);
  // "Try again" button: changing this number starts the effect one more time
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await requestFn(controller.signal);
        setData(result);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") {
          return; // outdated request, a newer one is already running
        }
        setError(err);
        setLoading(false);
      }
    }

    load();

    return () => controller.abort(); // cleanup: cancel the previous request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  const reload = useCallback(() => setReloadCount((prev) => prev + 1), []);

  return { data, setData, loading, error, reload };
}
