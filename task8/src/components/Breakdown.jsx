import { Link } from "react-router";

function Breakdown({ title, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <section className="breakdown">
      <h3>{title}</h3>

      <ul className="breakdown-list">
        {rows.map((row) => (
          <li key={row.label} className="breakdown-row">
            <span className="breakdown-label">
              {row.to ? <Link to={row.to}>{row.label}</Link> : row.label}
            </span>

            <span className="bar">
              <span
                className="bar-fill"
                style={{ width: (row.value / max) * 100 + "%" }}
              />
            </span>

            <span className="breakdown-value">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Breakdown;
