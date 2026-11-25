// registration of the Service Worker + "new version available" logic

let waitingWorker = null; // new SW that is installed and waits for the user
let updating = false; // true after the user pressed "Update"

export const UPDATE_EVENT = "sw-update-available";

function setWaiting(worker) {
  waitingWorker = worker;
  window.dispatchEvent(new Event(UPDATE_EVENT)); // UpdateBanner listens to it
}

export function registerServiceWorker() {
  // only in the built app: in "npm run dev" files change all the time
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");

      // a new version was downloaded earlier and is still waiting
      if (registration.waiting && navigator.serviceWorker.controller) {
        setWaiting(registration.waiting);
      }

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;

        worker.addEventListener("statechange", () => {
          // "installed" while an old SW controls the page = this is an UPDATE, not the first visit
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setWaiting(worker);
          }
        });
      });

      // look for a new version every 30 min (the browser also checks on every visit)
      setInterval(() => registration.update().catch(() => {}), 30 * 60 * 1000);
    } catch (error) {
      console.error("Service Worker registration failed", error);
    }
  });

  // the new SW took control -> reload once, so the page uses the new files
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (updating) {
      window.location.reload();
    }
  });
}

export function hasWaitingUpdate() {
  return waitingWorker !== null;
}

// "Update" button: tell the waiting SW to activate
export function applyUpdate() {
  if (waitingWorker) {
    updating = true;
    waitingWorker.postMessage("SKIP_WAITING");
  }
}
