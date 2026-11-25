import {
  CATEGORIES,
  PRIORITIES,
  STATUS_OPTIONS,
  SORT_OPTIONS,
} from "../services/service.js";

function Filters({
  search,
  onSearchChange,
  category,
  priority,
  status,
  sort,
  onFilterChange,
  onReset,
  showReset,
}) {
  return (
    <section className="filters">
      <input
        className="input search"
        type="search"
        placeholder="Search by name or description..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="filters-row">
        {/* FILTER 1 — category */}
        <label className="field">
          <span>Category</span>
          <select
            className="input"
            value={category}
            onChange={(event) => onFilterChange("category", event.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {/* FILTER 2 — priority */}
        <label className="field">
          <span>Priority</span>
          <select
            className="input"
            value={priority}
            onChange={(event) => onFilterChange("priority", event.target.value)}
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        {/* FILTER 3 — status */}
        <label className="field">
          <span>Status</span>
          <select
            className="input"
            value={status}
            onChange={(event) => onFilterChange("status", event.target.value)}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {/* SORTING */}
        <label className="field">
          <span>Sort by</span>
          <select
            className="input"
            value={sort}
            onChange={(event) => onFilterChange("sort", event.target.value)}
          >
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {showReset && (
          <button className="btn reset-btn" onClick={onReset}>
            Reset all
          </button>
        )}
      </div>
    </section>
  );
}

export default Filters;
