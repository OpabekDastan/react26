import { useState } from "react";

function TaskForm({ mode, initialTask, saving, error, onSave, onCancel }) {
  const [name, setName] = useState(initialTask.name || "");
  const [description, setDescription] = useState(initialTask.description || "");
  const [category, setCategory] = useState(initialTask.category || "Study");
  const [priority, setPriority] = useState(initialTask.priority || "Medium");
  const [assignee, setAssignee] = useState(initialTask.assignee || "");
  const [deadline, setDeadline] = useState(initialTask.deadline || "");
  const [estimatedHours, setEstimatedHours] = useState(
    initialTask.estimatedHours || 1,
  );
  const [localError, setLocalError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (name.trim() === "") {
      setLocalError("Name is required");
      return;
    }

    setLocalError("");

    onSave({
      name: name.trim(),
      description: description.trim(),
      category: category,
      priority: priority,
      assignee: assignee.trim(),
      deadline: deadline,
      estimatedHours: Number(estimatedHours),
    });
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{mode === "create" ? "New task" : "Edit task #" + initialTask.id}</h2>

      <div className="form-grid">
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>

        <label>
          Assignee
          <input value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        </label>

        <label className="full">
          Description
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Study</option>
            <option>Project</option>
            <option>Personal</option>
            <option>Health</option>
          </select>
        </label>

        <label>
          Priority
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>

        <label>
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          Estimated hours
          <input
            type="number"
            min="1"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
          />
        </label>
      </div>

      {localError !== "" && <p className="state error">{localError}</p>}
      {error !== "" && <p className="state error">Error: {error}</p>}

      <div className="actions">
        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
