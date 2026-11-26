// helpers that every feature uses for its async thunks

// data younger than 30s is "fresh": a new request for it is not sent
export const FRESH_TIME = 30 * 1000;

// Redux state must be serializable, so we keep a plain object instead of an Error
export function toRequestError(error) {
  return {
    message: error?.message || "Something went wrong",
    status: error?.status ?? null, // 404 -> "not found" screen
    offline: Boolean(error?.offline), // no internet and no saved copy -> /offline page
  };
}

// true when the entry was loaded recently and nothing changed after that
export function isFresh(entry) {
  return Boolean(
    entry && entry.fetchedAt && !entry.stale && Date.now() - entry.fetchedAt < FRESH_TIME,
  );
}

function isAbort(error, signal) {
  return error?.name === "AbortError" || Boolean(signal?.aborted);
}

// one more try for random server errors; 404, offline and cancelled requests are not repeated
export async function withRetry(request, signal, retries = 1) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await request();
    } catch (error) {
      const canRetry =
        attempt < retries && !isAbort(error, signal) && error?.status !== 404 && !error?.offline;

      if (!canRetry) {
        throw error;
      }
    }
  }
}

// inside a thunk: a cancelled request stays "aborted", every other error goes to rejectWithValue
export function rejectRequest(error, signal, rejectWithValue) {
  if (isAbort(error, signal)) {
    throw error; // -> rejected action with meta.aborted = true
  }
  return rejectWithValue(toRequestError(error));
}

// error that the page can show: the thunk payload, or the serialized error as a fallback
export function errorFromAction(action) {
  return action.payload ?? toRequestError(action.error);
}
