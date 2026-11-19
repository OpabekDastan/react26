import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/service.js";

// query keys: every filter is a part of the key, so every combination has its own cache entry
export const taskKeys = {
  all: ["tasks"],
  lists: () => ["tasks", "list"],
  list: (filters) => ["tasks", "list", filters],
  stats: () => ["tasks", "stats"],
  statsFor: (category) => ["tasks", "stats", { category }],
  detail: (id) => ["tasks", "detail", String(id)],
};

// TanStack Query gives a signal: an outdated request is aborted, its result never reaches the page

export function useTasksList(filters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: ({ signal }) => getTasks(filters, signal),
  });
}

export function useAllTasks(category) {
  return useQuery({
    queryKey: taskKeys.statsFor(category),
    queryFn: ({ signal }) => getAllTasks({ category }, signal),
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: ({ signal }) => getTaskById(id, signal),
  });
}

// lists and dashboard statistics depend on every task, so they become outdated after any change
function invalidateLists(queryClient) {
  queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
  queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createTask(formData),
    onSuccess: (created) => {
      queryClient.setQueryData(taskKeys.detail(created.id), created);
      invalidateLists(queryClient);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }) => updateTask(id, changes),
    onSuccess: (updated) => {
      // API returns the new task -> we put it into the cache without one more request
      queryClient.setQueryData(taskKeys.detail(updated.id), updated);
      invalidateLists(queryClient);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      invalidateLists(queryClient);
    },
  });
}
