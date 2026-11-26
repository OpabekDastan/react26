import { createAsyncThunk } from "@reduxjs/toolkit";
import { getRecipes, getRecipe } from "../../services/recipesService.js";
import { isFresh, withRetry, rejectRequest } from "../shared/requestHelpers.js";

// one page of recipes (the Service Worker keeps a copy of every opened page for offline)
export const fetchRecipes = createAsyncThunk(
  "recipes/fetchPage",
  async ({ page }, { signal, rejectWithValue }) => {
    try {
      const result = await withRetry(() => getRecipes(page, signal), signal);
      return { ...result, fetchedAt: Date.now() };
    } catch (error) {
      return rejectRequest(error, signal, rejectWithValue); // error.offline survives here
    }
  },
  {
    condition: ({ page, force }, { getState }) =>
      force || !isFresh(getState().recipes.pages[String(page)]),
  },
);

export const fetchRecipeById = createAsyncThunk(
  "recipes/fetchById",
  async ({ id }, { signal, rejectWithValue }) => {
    try {
      const recipe = await withRetry(() => getRecipe(id, signal), signal);
      return { recipe, fetchedAt: Date.now() };
    } catch (error) {
      return rejectRequest(error, signal, rejectWithValue);
    }
  },
  {
    condition: ({ id, force }, { getState }) =>
      force || !isFresh(getState().recipes.details[String(id)]),
  },
);
