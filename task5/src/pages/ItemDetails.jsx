import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import {
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/service.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import { formatDate, daysLeft, isOverdue } from "../utils/format.js";
import TaskForm from "../components/TaskForm.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

function ItemDetails() {
  /**
   * useParams reads the dynamic part of the route.
   * Route is <Route path=":id" />, URL is /items/7 -> id === "7" (always a string).
   */
  const { id } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  usePageTitle(task ? task.name : "Task " + id);

  // "abc" or "-3" is not a valid id -> we do not even call the API
  const isValidId = /^\d+$/.test(id);

  /**
   * Loading of one task by id.
   * The effect depends on [id], so clicking another task reloads the data.
   *
   * AbortController + the cleanup function solve the stale request problem:
   * if the user opens task 1 and then quickly task 2, the first request is
   * cancelled and its late answer can never be written into the state.
   */
  useEffect(() => {
    if (!isValidId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadTask() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getTaskById(id, controller.signal);
        setTask(data);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") {
          return; // outdated request, a newer one is already running
        }

        if (err.status === 404) {
          setNotFound(true); // the id is correct but there is no such task
        } else {
          setError(err.message); // network / server problem
        }

        setLoading(false);
      }
    }

    loadTask();

    return () => controller.abort(); // cleanup: cancel the previous request
  }, [id, reloadCount, isValidId]);

  // "Back" works only if we really came from another page of the app
  const canGoBack = location.key !== "default";

  async function handleToggle() {
    setBusy(true);
    setActionError("");

    try {
      const updated = await updateTask(task.id, { completed: !task.completed });
      setTask(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(formData) {
    setSaving(true);
    setActionError("");

    try {
      const updated = await updateTask(task.id, formData);
      setTask(updated);
      setEditing(false);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete task #" + task.id + "?")) {
      return;
    }

    setBusy(true);
    setActionError("");

    try {
      await deleteTask(task.id);
      navigate("/items"); // after deleting there is nothing to show here
    } catch (err) {
      setActionError(err.message);
      setBusy(false);
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

  if (error) {
    return (
      <section className="page details">
        <ErrorBox
          message={error}
          onRetry={() => setReloadCount((prev) => prev + 1)}
        />
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
