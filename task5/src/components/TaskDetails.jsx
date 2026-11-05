function TaskDetails({
  selectedId,
  task,
  loading,
  error,
  busyId,
  formOpen,
  onRetry,
  onToggle,
  onEdit,
  onDelete,
}) {
  // nothing selected
  if (selectedId === null) {
    return (
      <section className="card">
        <h2>Details</h2>
        <p className="state">Select a task to see details.</p>
      </section>
    );
  }

  // loading state
  if (loading) {
    return (
      <section className="card">
        <h2>Details</h2>
        <p className="state">Loading task #{selectedId}...</p>
      </section>
    );
  }

  // error state
  if (error !== "") {
    return (
      <section className="card">
        <h2>Details</h2>
        <p className="state error">Error: {error}</p>
        <button onClick={onRetry}>Try again</button>
      </section>
    );
  }

  if (task === null) {
    return null;
  }

  // when any action is running, buttons are disabled
  const isBusy = busyId !== null;

  // success state
  return (
    <section className="card">
      <h2>Details</h2>

      <h3 className={task.completed ? "done" : ""}>{task.name}</h3>
      <p className="description">{task.description}</p>

      <table className="details-table">
        <tbody>
          <tr>
            <td>ID</td>
            <td>#{task.id}</td>
          </tr>
          <tr>
            <td>Category</td>
            <td>{task.category || "-"}</td>
          </tr>
          <tr>
            <td>Priority</td>
            <td>{task.priority || "-"}</td>
          </tr>
          <tr>
            <td>Assignee</td>
            <td>{task.assignee || "-"}</td>
          </tr>
          <tr>
            <td>Deadline</td>
            <td>{task.deadline || "-"}</td>
          </tr>
          <tr>
            <td>Estimated time</td>
            <td>{task.estimatedHours ? task.estimatedHours + " h" : "-"}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td>{task.completed ? "Completed" : "Not completed"}</td>
          </tr>
          <tr>
            <td>Created</td>
            <td>{task.createdAt || "-"}</td>
          </tr>
        </tbody>
      </table>

      {isBusy && <p className="state">Updating task #{busyId}...</p>}

      <div className="actions">
        <button className="primary" onClick={onToggle} disabled={isBusy}>
          {task.completed ? "Mark as not done" : "Mark as done"}
        </button>
        <button onClick={onEdit} disabled={isBusy || formOpen}>
          Edit
        </button>
        <button className="danger" onClick={onDelete} disabled={isBusy}>
          Delete
        </button>
      </div>
    </section>
  );
}

export default TaskDetails;
