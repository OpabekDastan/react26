// Small helpers for dates. They are pure functions, so they are easy to test.

// "2026-11-10" -> "10 Nov 2026"
export function formatDate(isoDate) {
  if (!isoDate) {
    return "—";
  }

  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// how many days are left until the deadline (negative number = overdue)
export function daysLeft(isoDate) {
  const oneDay = 24 * 60 * 60 * 1000;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(isoDate);
  deadline.setHours(0, 0, 0, 0);

  return Math.round((deadline - today) / oneDay);
}

// task is overdue if the deadline is in the past and the task is not done
export function isOverdue(task) {
  return !task.completed && daysLeft(task.deadline) < 0;
}
