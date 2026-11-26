import { createSelector } from "@reduxjs/toolkit";
import { recipesAdapter } from "./recipesSlice.js";

const adapterSelectors = recipesAdapter.getSelectors((state) => state.recipes);

// ---------- simple selectors ----------
export const selectRecipePageEntry = (state, page) => state.recipes.pages[String(page)];

export const selectRecipeDetailsEntry = (state, id) => state.recipes.details[String(id)];

export const selectRecipeById = (state, id) => adapterSelectors.selectById(state, Number(id));

// ---------- memoized selector: ids of the page -> recipes + pagination ----------
export const selectRecipesPage = createSelector(
  [selectRecipePageEntry, adapterSelectors.selectEntities, (_state, page) => page],
  (entry, entities, page) => {
    if (!entry || !entry.fetchedAt) {
      return null;
    }

    return {
      recipes: entry.ids.map((id) => entities[id]).filter(Boolean),
      total: entry.total,
      page,
      totalPages: entry.totalPages,
    };
  },
);
