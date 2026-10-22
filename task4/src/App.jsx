import { useState, useEffect } from "react";
import {
  getItemsList,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "./api/fakeApi";
import { API_CONFIG } from "./api/settings";
import TaskList from "./components/TaskList";
import TaskDetails from "./components/TaskDetails";
import TaskForm from "./components/TaskForm";
import "./App.css";

const emptyTask = {
  name: "",
  description: "",
  category: "Study",
  priority: "Medium",
  assignee: "",
  deadline: "",
  estimatedHours: 1,
};

function App() {
  // ---------- list state ----------
  const [tasks, setTasks] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // ---------- details state ----------
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsReloadCount, setDetailsReloadCount] = useState(0);

  // ---------- actions state ----------
  const [busyId, setBusyId] = useState(null); // id of task that is updating now
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // ---------- form state ----------
  const [formMode, setFormMode] = useState(null); // null, "create" or "edit"
  const [editingTask, setEditingTask] = useState(null); // copy of task we edit
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // 1. Load task list
  // runs on first render, when search changes and when Reload is clicked
  useEffect(() => {
    let ignore = false;

    async function loadTasks() {
      setListLoading(true);
      setListError("");

      try {
        const result = await getItemsList(
          "?limit=100&search=" + encodeURIComponent(search),
        );
        if (!ignore) {
          setTasks(result.data);
        }
      } catch (error) {
        if (!ignore) {
          setListError(error.message);
        }
      } finally {
        if (!ignore) {
          setListLoading(false);
        }
      }
    }

    loadTasks();

    // cleanup: old request result will be ignored
    return () => {
      ignore = true;
    };
  }, [search, reloadCount]);

  // 2. Load details of selected task
  // runs every time selectedId changes
  useEffect(() => {
    if (selectedId === null) {
      setDetails(null);
      setDetailsError("");
      setDetailsLoading(false);
      return;
    }

    let ignore = false;

    async function loadDetails() {
      setDetails(null);
      setDetailsLoading(true);
      setDetailsError("");

      try {
        const task = await getItem(selectedId);
        if (!ignore) {
          setDetails(task);
        }
      } catch (error) {
        if (!ignore) {
          setDetailsError(error.message);
        }
      } finally {
        if (!ignore) {
          setDetailsLoading(false);
        }
      }
    }

    loadDetails();

    // cleanup: if user selects another task, this old response is ignored
    // so outdated details are never shown (race condition fix)
    return () => {
      ignore = true;
    };
  }, [selectedId, detailsReloadCount]);

  function handleReload() {
    setReloadCount(reloadCount + 1);
  }

  function handleSelect(id) {
    setSelectedId(id);
    setActionMessage("");
    setActionError("");
  }

  // 3. Mark complete / not complete (update through API)
  async function handleToggleComplete() {
    if (details === null || busyId !== null) {
      return;
    }

    // capture id and new value NOW (stale closure fix)
    const taskId = details.id;
    const newValue = !details.completed;

    setBusyId(taskId);
    setActionMessage("");
    setActionError("");

    try {
      const updated = await updateItem(taskId, { completed: newValue });

      // update the correct task in list (use prev, not old "tasks")
      setTasks((prev) =>
        prev.map((task) => (task.id === updated.id ? updated : task)),
      );

      // update details only if the same task is still opened
      setDetails((prev) =>
        prev !== null && prev.id === updated.id ? updated : prev,
      );

      setActionMessage("Task #" + taskId + " was updated");
    } catch (error) {
      setActionError("Task #" + taskId + ": " + error.message);
    } finally {
      setBusyId(null);
    }
  }

  // 4. Delete
  async function handleDelete() {
    if (details === null || busyId !== null) {
      return;
    }

    const taskId = details.id;

    if (!window.confirm("Delete task #" + taskId + "?")) {
      return;
    }

    setBusyId(taskId);
    setActionMessage("");
    setActionError("");

    try {
      await deleteItem(taskId);

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setSelectedId((prev) => (prev === taskId ? null : prev));

      setActionMessage("Task #" + taskId + " was deleted");
    } catch (error) {
      setActionError("Task #" + taskId + ": " + error.message);
    } finally {
      setBusyId(null);
    }
  }

  // 5. Open form
  function openCreateForm() {
    setFormMode("create");
    setEditingTask(null);
    setFormError("");
  }

  function openEditForm() {
    if (details === null) {
      return;
    }
    setFormMode("edit");
    setEditingTask(details); // remember which task we edit
    setFormError("");
  }

  function closeForm() {
    setFormMode(null);
    setEditingTask(null);
    setFormError("");
  }

  // 6. Save form (create or edit)
  async function handleSave(formData) {
    setSaving(true);
    setFormError("");

    try {
      if (formMode === "create") {
        // fake API createItem saves only name and description,
        // so other fields are saved with updateItem after it
        const created = await createItem({
          name: formData.name,
          description: formData.description,
        });

        const today = new Date().toISOString().slice(0, 10);

        await updateItem(created.id, {
          ...formData,
          completed: false,
          createdAt: today,
        });

        closeForm();
        setReloadCount(reloadCount + 1);
        setSelectedId(created.id);
        setActionMessage("Task #" + created.id + " was created");
      } else {
        const taskId = editingTask.id;
        const updated = await updateItem(taskId, formData);

        setTasks((prev) =>
          prev.map((task) => (task.id === updated.id ? updated : task)),
        );
        setDetails((prev) =>
          prev !== null && prev.id === updated.id ? updated : prev,
        );

        closeForm();
        setActionMessage("Task #" + taskId + " was saved");
      }
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Task Manager</h1>
          <p className="hint">
            Fake API: delay {API_CONFIG.minDelay}–{API_CONFIG.maxDelay} ms,
            error chance {API_CONFIG.errorChance * 100}%
          </p>
        </div>

        <div className="header-buttons">
          <button onClick={handleReload}>Reload</button>
          <button
            className="primary"
            onClick={openCreateForm}
            disabled={formMode !== null}
          >
            + New task
          </button>
        </div>
      </header>

      <input
        className="search"
        type="text"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {actionMessage !== "" && <p className="message success">{actionMessage}</p>}
      {actionError !== "" && <p className="message error">{actionError}</p>}

      {formMode !== null && (
        <TaskForm
          key={formMode === "edit" ? "edit-" + editingTask.id : "create"}
          mode={formMode}
          initialTask={formMode === "edit" ? editingTask : emptyTask}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      <main className="layout">
        <TaskList
          tasks={tasks}
          loading={listLoading}
          error={listError}
          selectedId={selectedId}
          onSelect={handleSelect}
          onRetry={handleReload}
        />

        <TaskDetails
          selectedId={selectedId}
          task={details}
          loading={detailsLoading}
          error={detailsError}
          busyId={busyId}
          formOpen={formMode !== null}
          onRetry={() => setDetailsReloadCount(detailsReloadCount + 1)}
          onToggle={handleToggleComplete}
          onEdit={openEditForm}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
}

export default App;