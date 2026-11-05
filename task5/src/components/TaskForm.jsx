import { useState } from "react";
import { CATEGORIES, PRIORITIES } from "../services/service.js";

/**
 * One form for both "create" and "edit".
 * It is a controlled form: every input value is taken from the `form` state.
 */
function TaskForm({ mode, initialTask, saving, error, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initialTask.name || "",
    description: initialTask.description || "",
    category: initialTask.category || CATEGORIES[0],
    priority: initialTask.priority || "Medium",
    assignee: initialTask.assignee || "",
    deadline: initialTask.deadline || "",
    estimatedHours: initialTask.estimatedHours || 1,
  });

  const [validationError, setValidationError] = useState("");

  // one handler for all the fields: the input name = the key in the state
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // without this the browser reloads the page

    if (form.name.trim() === "" || form.description.trim() === "") {
      setValidationError("Name and description are required");
      return;
    }

    setValidationError("");
    onSave({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      assignee: form.assignee.trim() || "Dastan",
      deadline: form.deadline || new Date().toISOString().slice(0, 10),
      estimatedHours: Number(form.estimatedHours) || 1,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{mode === "create" ? "New task" : "Edit task"}</h2>

      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input
            className="input"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Task name"
          />
        </label>

        <label className="field">
          <span>Assignee</span>
          <input
            className="input"
            name="assignee"
            value={form.assignee}
            onChange={handleChange}
            placeholder="Who does it"
          />
        </label>

        <label className="field full">
          <span>Description</span>
          <textarea
            className="input"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
          />
        </label>

        <label className="field">
          <span>Category</span>
          <select
            className="input"
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Priority</span>
          <select
            className="input"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Deadline</span>
          <input
            className="input"
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
          />
        </label>

        <label className="field">
          <span>Estimated hours</span>
          <input
            className="input"
            type="number"
            min="1"
            max="40"
            name="estimatedHours"
            value={form.estimatedHours}
            onChange={handleChange}
          />
        </label>
      </div>

      {validationError && <p className="message error">{validationError}</p>}
      {error && <p className="message error">{error}</p>}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          className="btn"
          type="button"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
