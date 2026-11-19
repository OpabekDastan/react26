import { useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import { useTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { formatDate, daysLeft, isOverdue } from "../utils/format.js";
import TaskForm from "../components/TaskForm.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

function ItemDetails() {
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  // a task opened before is shown from the cache at once
  const {
    data: task,
    isPending: loading,
    error,
    refetch: reload,
  } = useTask(id);

  // mutations update the cache of this task and invalidate the lists
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  // 404 = the id is fine but there is no such task; anything else = server problem
  const notFound = error?.status === 404;

  const [editing, setEditing] = useState(false);
  const [actionError, setActionError] = useState("");

  const saving = updateMutation.isPending;
  const busy = updateMutation.isPending || deleteMutation.isPending;

  usePageTitle(task ? task.name : "Task " + id);

  // "Back" works only if we really came from another page of the app
  const canGoBack = location.key !== "default";

  async function handleToggle() {
    setActionError("");

    try {
      await updateMutation.mutateAsync({
        id: task.id,
        changes: { completed: !task.completed },
      });
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSave(formData) {
    setActionError("");

    try {
      await updateMutation.mutateAsync({ id: task.id, changes: formData });
      setEditing(false);
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete task #" + task.id + "?")) {
      return;
    }

    setActionError("");

    try {
      await deleteMutation.mutateAsync(task.id);
      navigate("/items"); // after deleting there is nothing to show here
    } catch (err) {
      setActionError(err.message);
    }
  }

  // ---------- states ----------

  if (loading) {
    return (
      <section className="page details">
        <Loader text={"Loading task #" + id + "..."} />
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="page details">
        <EmptyBox text={'Task "' + id + '" does not exist'}>
          <p className="muted">
            Maybe it was deleted or the address is wrong.
          </p>
          <Link className="btn btn-primary" to="/items">
            All tasks
          </Link>
        </EmptyBox>
      </section>
    );
  }

  // error of a background refetch is not shown if we already have the task in the cache
  if (error && !task) {
    return (
      <section className="page details">
        <ErrorBox message={error.message} onRetry={reload} />
        <p className="center">
          <Link className="btn" to="/items">
            All tasks
          </Link>
        </p>
      </section>
    );
  }

  const left = daysLeft(task.deadline);

  return (
    <section className="page details">
      <div className="details-nav">
        {canGoBack && (
          <button className="btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
        <Link className="btn" to="/items">
          All tasks
        </Link>
      </div>

      <div className="panel">
        <div className="card-top">
          <span className={"badge priority-" + task.priority.toLowerCase()}>
            {task.priority}
          </span>
          <span className="badge category">{task.category}</span>
          <span className={"badge " + (task.completed ? "done" : "active")}>
            {task.completed ? "Done" : "Active"}
          </span>
          {isOverdue(task) && <span className="badge overdue-badge">Overdue</span>}
        </div>

        <h1>{task.name}</h1>
        <p className="lead">{task.description}</p>

        {/* 10 fields of the task */}
        <dl className="details-grid">
          <div>
            <dt>ID</dt>
            <dd>#{task.id}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>
              <Link to={"/items?category=" + task.category}>{task.category}</Link>
            </dd>
          </div>
          <div>
            <dt>Priority</dt>
            <dd>
              <Link to={"/items?priority=" + task.priority}>{task.priority}</Link>
            </dd>
          </div>
          <div>
            <dt>Assignee</dt>
            <dd>{task.assignee}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{task.completed ? "Done" : "Active"}</dd>
          </div>
          <div>
            <dt>Deadline</dt>
            <dd className={isOverdue(task) ? "overdue" : ""}>
              {formatDate(task.deadline)}
            </dd>
          </div>
          <div>
            <dt>Days left</dt>
            <dd>
              {task.completed
                ? "—"
                : left < 0
                  ? Math.abs(left) + " days overdue"
                  : left + " days"}
            </dd>
          </div>
          <div>
            <dt>Estimated hours</dt>
            <dd>{task.estimatedHours} h</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(task.createdAt)}</dd>
          </div>
          <div>
            <dt>Description length</dt>
            <dd>{task.description.length} characters</dd>
          </div>
        </dl>

        {actionError && <p className="message error">{actionError}</p>}

        <div className="form-actions">
          <button className="btn btn-primary" onClick={handleToggle} disabled={busy}>
            {task.completed ? "Mark as active" : "Mark as done"}
          </button>
          <button
            className="btn"
            onClick={() => setEditing((prev) => !prev)}
            disabled={busy}
          >
            {editing ? "Close editor" : "Edit"}
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <TaskForm
          mode="edit"
          initialTask={task}
          saving={saving}
          error=""
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </section>
  );
}

export default ItemDetails;
