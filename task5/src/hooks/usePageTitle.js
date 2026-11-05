import { useEffect } from "react";

/**
 * Custom hook: changes the title of the browser tab.
 * Every page calls it, so the tab title changes together with the route.
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title + " — Task Manager";
  }, [title]);
}
