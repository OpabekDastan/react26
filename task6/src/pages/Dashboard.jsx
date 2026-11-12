import { Link } from "react-router";
import { getAllTasks, CATEGORIES } from "../services/service.js";
import { useTaskFilters } from "../hooks/useTaskFilters.js";
import { useFetch } from "../hooks/useFetch.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { formatDate, isOverdue } from "../utils/format.js";
import StatCard from "../components/StatCard.jsx";
import Breakdown from "../components/Breakdown.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

// counts how many times every value of `field` appears: { Study: 4, Work: 2 }
function countBy(tasks, field) {
  const result = {};

  tasks.forEach((task) => {
    const key = task[field];
    result[key] = (result[key] || 0) + 1;
  });

  return result;
}

function Dashboard() {
  usePageTitle("Dashboard");

  const { filters, setFilter } = useTaskFilters();
  const category = filters.category;

  const { data, loading, error, reload } = useFetch(
    (signal) => getAllTasks({ category }, signal),
    [category],
  );

  const tasks = data ? data.data : [];

  function handleCategoryChange(value) {
    setFilter("category", value);
  }

  if (loading) {
    return (
      <section className="page dashboard">
        <Loader text="Calculating statistics..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page dashboard">
        <ErrorBox message={error.message} onRetry={reload} />
      </section>
    );
  }

  // ---------- statistics (calculated from the API data) ----------
  const total = tasks.length;
  const done = tasks.filter((task) => task.completed).length;
  const active = total - done;
  const overdue = tasks.filter(isOverdue).length;
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100);
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const averageHours = total === 0 ? 0 : (totalHours / total).toFixed(1);

  // ---------- breakdowns ----------
  const byCategory = countBy(tasks, "category");
  const byPriority = countBy(tasks, "priority");
  const byAssignee = countBy(tasks, "assignee");

  const categoryRows = Object.keys(byCategory)
    .sort()
    .map((key) => ({
      label: key,
      value: byCategory[key],
      to: "/items?category=" + key,
    }));

  const priorityRows = ["High", "Medium", "Low"]
    .filter((key) => byPriority[key])
    .map((key) => ({
      label: key,
      value: byPriority[key],
      to: "/items?priority=" + key,
    }));

  const assigneeRows = Object.keys(byAssignee)
    .sort((a, b) => byAssignee[b] - byAssignee[a])
    .map((key) => ({ label: key, value: byAssignee[key] }));

  // five nearest deadlines among the active tasks -> links to the details page
  const upcoming = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 5);

  return (
    <section className="page dashboard">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            All numbers are calculated from the data returned by the API.
          </p>
        </div>

        {/* INTERACTIVE FILTER: it changes every statistic on this page */}
        <label className="field">
          <span>Category filter</span>
          <select
            className="input"
            value={category}
            onChange={(event) => handleCategoryChange(event.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {total === 0 ? (
        <EmptyBox text="There are no tasks in this category">
          <button className="btn" onClick={() => handleCategoryChange("")}>
            Show all categories
          </button>
        </EmptyBox>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard label="Total tasks" value={total} />
            <StatCard label="Done" value={done} hint={completionRate + "% of all"} />
            <StatCard label="Active" value={active} />
            <StatCard label="Overdue" value={overdue} hint="deadline in the past" />
            <StatCard label="Estimated hours" value={totalHours} hint="sum of all tasks" />
            <StatCard label="Average hours" value={averageHours} hint="per task" />
          </div>

          <div className="progress-block">
            <p className="muted">Completion: {completionRate}%</p>
            <span className="bar big">
              <span className="bar-fill" style={{ width: completionRate + "%" }} />
            </span>
          </div>

          <div className="breakdown-grid">
            <Breakdown title="By category" rows={categoryRows} />
            <Breakdown title="By priority" rows={priorityRows} />
            <Breakdown title="By assignee" rows={assigneeRows} />
          </div>

          <section className="panel">
            <h3>Next deadlines</h3>

            {upcoming.length === 0 ? (
              <p className="muted">All tasks in this category are done.</p>
            ) : (
              <ul className="list deadline-list">
                {upcoming.map((task) => (
                  <li key={task.id}>
                    <Link to={"/items/" + task.id}>{task.name}</Link>
                    <span className={isOverdue(task) ? "overdue" : "muted"}>
                      {formatDate(task.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <p>
              <Link className="btn btn-primary" to="/items?status=active&sort=deadline">
                Open these tasks in the list
              </Link>
            </p>
          </section>
        </>
      )}
    </section>
  );
}

export default Dashboard;
