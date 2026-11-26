import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecipes, fetchRecipeById } from "../features/recipes/recipesThunks.js";
import {
  selectRecipePageEntry,
  selectRecipesPage,
  selectRecipeById,
  selectRecipeDetailsEntry,
} from "../features/recipes/recipesSelectors.js";

export function useRecipes(page) {
  const dispatch = useDispatch();

  const entry = useSelector((state) => selectRecipePageEntry(state, page));
  const data = useSelector((state) => selectRecipesPage(state, page));

  useEffect(() => {
    const request = dispatch(fetchRecipes({ page }));
    return () => request.abort();
  }, [dispatch, page]);

  const reload = useCallback(() => dispatch(fetchRecipes({ page, force: true })), [dispatch, page]);

  const failed = entry?.status === "failed";

  return {
    data,
    loading: !data && !failed,
    error: failed ? entry.error : null,
    reload,
  };
}

export function useRecipe(id) {
  const dispatch = useDispatch();

  const entry = useSelector((state) => selectRecipeDetailsEntry(state, id));
  const recipe = useSelector((state) => selectRecipeById(state, id));

  useEffect(() => {
    const request = dispatch(fetchRecipeById({ id }));
    return () => request.abort();
  }, [dispatch, id]);

  const reload = useCallback(() => dispatch(fetchRecipeById({ id, force: true })), [dispatch, id]);

  // a recipe from the list has only some fields: the details page waits for the full one
  const loaded = Boolean(entry?.fetchedAt);
  const failed = entry?.status === "failed";

  return {
    recipe: loaded ? recipe : undefined,
    loading: !loaded && !failed,
    error: failed ? entry.error : null,
    reload,
  };
}
