function TaskList({ tasks, loading, error, selectedId, onSelect, onRetry }) {
  // loading state
  if (loading) {
    return (
      <section className="card">
        <h2>Tasks</h2>
        <p className="state">Loading tasks...</p>
      </section>
    );
  }

  // error state
  if (error !== "") {
    return (
      <section className="card">
        <h2>Tasks</h2>
        <p className="state error">Error: {error}</p>
        <button onClick={onRetry}>Try again</button>
      </section>
    );
  }

  // empty state
  if (tasks.length === 0) {
    return (
      <section className="card">
        <h2>Tasks</h2>
        <p className="state">No tasks found.</p>
      </section>
    );
  }

  // success state
  return (
    <section className="card">
      <h2>Tasks ({tasks.length})</h2>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <button
              className={
                task.id === selectedId ? "task-item selected" : "task-item"
              }
              onClick={() => onSelect(task.id)}
            >
              <span className={task.completed ? "task-name done" : "task-name"}>
                {task.name}
              </span>
              <span className="badges">
                <span className={"badge " + task.priority}>{task.priority}</span>
                <span className={task.completed ? "badge ok" : "badge"}>
                  {task.completed ? "Done" : "Open"}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TaskList;
