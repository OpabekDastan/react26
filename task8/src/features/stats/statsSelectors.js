import { createSelector } from "@reduxjs/toolkit";
import { statsKey } from "./statsThunks.js";
import { selectTaskEntities } from "../tasks/tasksSelectors.js";
import { isOverdue } from "../../utils/format.js";

const NO_TASKS = []; // the same empty array every time -> memoization keeps working

// ---------- simple selector ----------
export const selectStatsEntry = (state, category) => state.stats.byCategory[statsKey(category)];

// ---------- memoized selector 1: ids of the category -> the tasks themselves ----------
export const selectStatsTasks = createSelector(
  [selectStatsEntry, selectTaskEntities],
  (entry, entities) =>
    entry ? entry.ids.map((id) => entities[id]).filter(Boolean) : NO_TASKS,
);

// counts how many times every value of `field` appears: { Study: 4, Work: 2 }
function countBy(tasks, field) {
  const result = {};

  tasks.forEach((task) => {
    const key = task[field];
    result[key] = (result[key] || 0) + 1;
  });

  return result;
}

// ---------- memoized selector 2: tasks -> every number of the dashboard ----------
// the numbers are NOT stored in the state (that would be duplicated data), they are derived here
export const selectDashboardStats = createSelector([selectStatsTasks], (tasks) => {
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);

  const byCategory = countBy(tasks, "category");
  const byPriority = countBy(tasks, "priority");
  const byAssignee = countBy(tasks, "assignee");

  return {
    total,
    done,
    active: total - done,
    overdue: tasks.filter(isOverdue).length,
    completionRate,
    totalHours,
    averageHours: total === 0 ? 0 : (totalHours / total).toFixed(1),

    categoryRows: Object.keys(byCategory)
      .sort()
      .map((key) => ({ label: key, value: byCategory[key], to: "/items?category=" + key })),

    priorityRows: ["High", "Medium", "Low"]
      .filter((key) => byPriority[key])
      .map((key) => ({ label: key, value: byPriority[key], to: "/items?priority=" + key })),

    assigneeRows: Object.keys(byAssignee)
      .sort((a, b) => byAssignee[b] - byAssignee[a])
      .map((key) => ({ label: key, value: byAssignee[key] })),

    // five nearest deadlines among the active tasks
    upcoming: tasks
      .filter((task) => !task.completed)
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 5),
  };
});
