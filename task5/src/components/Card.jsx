import { Link } from "react-router";
import { formatDate, isOverdue } from "../utils/format.js";

function Card({ task }) {
  const overdue = isOverdue(task);

  return (
    <article className="card">
      <div className="card-top">
        <span className={"badge priority-" + task.priority.toLowerCase()}>
          {task.priority}
        </span>
        <span className="badge category">{task.category}</span>
        <span className={"badge " + (task.completed ? "done" : "active")}>
          {task.completed ? "Done" : "Active"}
        </span>
      </div>

      <h3 className="card-title">{task.name}</h3>
      <p className="card-text">{task.description}</p>

      <dl className="card-meta">
        <div>
          <dt>Deadline</dt>
          <dd className={overdue ? "overdue" : ""}>
            {formatDate(task.deadline)}
            {overdue && " (overdue)"}
          </dd>
        </div>
        <div>
          <dt>Hours</dt>
          <dd>{task.estimatedHours}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{task.assignee}</dd>
        </div>
      </dl>

      <Link className="btn btn-primary card-link" to={"/items/" + task.id}>
        Open details
      </Link>
    </article>
  );
}

export default Card;
