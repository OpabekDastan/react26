import { useQuery } from "@tanstack/react-query";
import { getRecipes, getRecipe } from "../services/recipesService.js";

// own query keys, separate from the tasks cache
export const recipeKeys = {
  list: (page) => ["recipes", "list", page],
  detail: (id) => ["recipes", "detail", String(id)],
};

export function useRecipes(page) {
  return useQuery({
    queryKey: recipeKeys.list(page),
    queryFn: ({ signal }) => getRecipes(page, signal),
  });
}

export function useRecipe(id) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: ({ signal }) => getRecipe(id, signal),
  });
}
