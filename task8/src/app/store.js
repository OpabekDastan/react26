import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasks/tasksSlice.js";
import statsReducer from "../features/stats/statsSlice.js";
import recipesReducer from "../features/recipes/recipesSlice.js";

// one store for the whole app; every feature owns its part of the state
// (auth stays in AuthContext: the Firebase user object is not serializable)
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    stats: statsReducer,
    recipes: recipesReducer,
  },
});
