import { createSlice, createEntityAdapter } from "@reduxjs/toolkit";
import { fetchRecipes, fetchRecipeById } from "./recipesThunks.js";
import { errorFromAction } from "../shared/requestHelpers.js";

// recipes from the public API, stored once by id
export const recipesAdapter = createEntityAdapter();

const initialState = recipesAdapter.getInitialState({
  // page -> { ids, total, totalPages, status, error, requestId, fetchedAt }
  pages: {},
  // id -> { status, error, requestId, fetchedAt } (a list item has only some fields)
  details: {},
});

function emptyEntry() {
  return { status: "idle", error: null, requestId: null, fetchedAt: null, stale: false };
}

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state, action) => {
        const key = String(action.meta.arg.page);
        const entry = state.pages[key] ?? { ...emptyEntry(), ids: [], total: 0, totalPages: 1 };

        entry.status = "loading";
        entry.error = null;
        entry.requestId = action.meta.requestId;
        state.pages[key] = entry;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        const entry = state.pages[String(action.meta.arg.page)];
        if (!entry || entry.requestId !== action.meta.requestId) return;

        const { recipes, total, totalPages, fetchedAt } = action.payload;
        // upsert merges fields: a full recipe opened before keeps its ingredients
        recipesAdapter.upsertMany(state, recipes);

        entry.ids = recipes.map((recipe) => recipe.id);
        entry.total = total;
        entry.totalPages = totalPages;
        entry.fetchedAt = fetchedAt;
        entry.status = "succeeded";
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        const entry = state.pages[String(action.meta.arg.page)];
        if (!entry || entry.requestId !== action.meta.requestId) return;

        if (action.meta.aborted) {
          entry.status = entry.fetchedAt ? "succeeded" : "idle";
          return;
        }
        entry.status = "failed";
        entry.error = errorFromAction(action); // { offline: true } -> the page opens /offline
      })

      .addCase(fetchRecipeById.pending, (state, action) => {
        const key = String(action.meta.arg.id);
        const entry = state.details[key] ?? emptyEntry();

        entry.status = "loading";
        entry.error = null;
        entry.requestId = action.meta.requestId;
        state.details[key] = entry;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        const entry = state.details[String(action.meta.arg.id)];
        if (!entry || entry.requestId !== action.meta.requestId) return;

        recipesAdapter.upsertOne(state, action.payload.recipe);
        entry.fetchedAt = action.payload.fetchedAt;
        entry.status = "succeeded";
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        const entry = state.details[String(action.meta.arg.id)];
        if (!entry || entry.requestId !== action.meta.requestId) return;

        if (action.meta.aborted) {
          entry.status = entry.fetchedAt ? "succeeded" : "idle";
          return;
        }
        entry.status = "failed";
        entry.error = errorFromAction(action);
      });
  },
});

export default recipesSlice.reducer;
