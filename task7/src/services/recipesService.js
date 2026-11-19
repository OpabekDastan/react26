// PUBLIC API (no login, no private data) — the Service Worker caches these responses
export const RECIPES_API = "https://dummyjson.com/recipes";
export const RECIPES_PAGE_SIZE = 6;

// fetch + readable errors; error.offline = there is no internet and no saved copy
async function fetchJson(url, signal) {
  let response;

  try {
    response = await fetch(url, { signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw err; // outdated request, TanStack Query ignores it
    }
    const error = new Error("No internet connection and no saved copy of this data");
    error.offline = true;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 404 ? "Recipe not found" : "Server error " + response.status,
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export async function getRecipes(page, signal) {
  const skip = (page - 1) * RECIPES_PAGE_SIZE;
  const fields = "name,image,cuisine,difficulty,rating,prepTimeMinutes";
  const url = `${RECIPES_API}?limit=${RECIPES_PAGE_SIZE}&skip=${skip}&select=${fields}`;

  const data = await fetchJson(url, signal);

  return {
    recipes: data.recipes,
    total: data.total,
    page,
    totalPages: Math.ceil(data.total / RECIPES_PAGE_SIZE),
  };
}

export function getRecipe(id, signal) {
  if (!/^\d+$/.test(String(id))) {
    const error = new Error("Recipe not found");
    error.status = 404;
    return Promise.reject(error);
  }

  return fetchJson(`${RECIPES_API}/${id}`, signal);
}
