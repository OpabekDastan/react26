// real connection check: navigator.onLine can say "online" when there is no internet
export async function checkConnection() {
  try {
    // unique URL + no-store -> the answer can come only from the network, not from a cache
    const response = await fetch("./manifest.json?check=" + Date.now(), {
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
