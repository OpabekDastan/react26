import { useState, useEffect } from "react";

export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer); // cleanup: cancel the previous timer
  }, [value, delay]);

  return debounced;
}
