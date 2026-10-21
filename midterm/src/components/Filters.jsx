import { topics, levels } from "../options.js";

export default function Filters(props) {
  function option(value) {
    return (
      <option key={value} value={value}>
        {value}
      </option>
    );
  }

  return (
    <div className="filters">
      <label>
        Search
        <input
          type="search"
          value={props.search}
          onChange={props.onSearch}
          placeholder="Question title"
        />
      </label>
      <label>
        Topic
        <select value={props.topic} onChange={props.onTopic}>
          <option value="All">All topics</option>
          {topics.map(option)}
        </select>
      </label>
      <label>
        Level
        <select value={props.level} onChange={props.onLevel}>
          <option value="All">All levels</option>
          {levels.map(option)}
        </select>
      </label>
      <label>
        Sort
        <select value={props.sort} onChange={props.onSort}>
          <option value="title">Title A-Z</option>
          <option value="newest">Newest first</option>
          <option value="level">Easy first</option>
        </select>
      </label>
      <button className="secondary" onClick={props.onReset}>
        Reset
      </button>
    </div>
  );
}
