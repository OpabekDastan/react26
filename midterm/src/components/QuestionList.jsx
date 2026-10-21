import { useState } from "react";
import { levels } from "../options.js";
import Filters from "./Filters.jsx";
import QuestionCard from "./QuestionCard.jsx";
import Pagination from "./Pagination.jsx";

const pageSize = 6;

export default function QuestionList(props) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState("title");
  const [page, setPage] = useState(1);

  function changeSearch(event) {
    setSearch(event.target.value);
    setPage(1);
  }
  function changeTopic(event) {
    setTopic(event.target.value);
    setPage(1);
  }
  function changeLevel(event) {
    setLevel(event.target.value);
    setPage(1);
  }
  function changeSort(event) {
    setSort(event.target.value);
    setPage(1);
  }

  function reset() {
    setSearch("");
    setTopic("All");
    setLevel("All");
    setSort("title");
    setPage(1);
  }

  const result = props.questions.filter(function (question) {
    if (!question.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (topic !== "All" && question.topic !== topic) return false;
    if (level !== "All" && question.difficulty !== level) return false;
    return true;
  });

  result.sort(function (first, second) {
    if (sort === "newest") return second.createdAt.localeCompare(first.createdAt);
    if (sort === "level")
      return levels.indexOf(first.difficulty) - levels.indexOf(second.difficulty);
    return first.title.localeCompare(second.title);
  });

  const pages = Math.max(1, Math.ceil(result.length / pageSize));
  const currentPage = Math.min(page, pages);
  const start = (currentPage - 1) * pageSize;
  const shown = result.slice(start, start + pageSize);

  function card(question) {
    return <QuestionCard key={question.id} question={question} onOpen={props.onOpen} />;
  }

  return (
    <>
      <h2>Questions ({result.length})</h2>
      <Filters
        search={search}
        topic={topic}
        level={level}
        sort={sort}
        onSearch={changeSearch}
        onTopic={changeTopic}
        onLevel={changeLevel}
        onSort={changeSort}
        onReset={reset}
      />
      {result.length === 0 && (
        <p className="empty" role="status">
          No questions found. Try another search or reset the filters.
        </p>
      )}
      <div className="cards">{shown.map(card)}</div>
      {result.length > 0 && (
        <Pagination page={currentPage} pages={pages} onChange={setPage} />
      )}
    </>
  );
}
