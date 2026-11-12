// One statistic number on the dashboard
function StatCard({ label, value, hint }) {
  return (
    <div className="stat-card">
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}

export default StatCard;
