import { useState, useEffect } from "react";

/**
 * Custom hook: returns the value with a delay.
 * The user types "react" letter by letter, but we send only ONE request,
 * 400 ms after the last keystroke.
 *
 * How it works: every time `value` changes, the old timer is cleared in the
 * cleanup function and a new one starts.
 */
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer); // cleanup: cancel the previous timer
  }, [value, delay]);

  return debounced;
}
