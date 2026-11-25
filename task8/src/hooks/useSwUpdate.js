import { useState, useEffect } from "react";
import { UPDATE_EVENT, hasWaitingUpdate, applyUpdate } from "../services/swService.js";

// true when a new version of the app is downloaded and waits for activation
export function useSwUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(hasWaitingUpdate);

  useEffect(() => {
    const handleUpdate = () => setUpdateAvailable(true);

    window.addEventListener(UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(UPDATE_EVENT, handleUpdate);
  }, []);

  return { updateAvailable, applyUpdate };
}
