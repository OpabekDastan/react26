import { useState, useEffect } from "react";
import { getTasks, createTask, PAGE_SIZE } from "../services/service.js";
import { useTaskFilters } from "../hooks/useTaskFilters.js";
import { useFetch } from "../hooks/useFetch.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Card from "../components/Card.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import TaskForm from "../components/TaskForm.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

const emptyTask = {
  name: "",
  description: "",
  category: "Study",
  priority: "Medium",
  assignee: "",
  deadline: "",
  estimatedHours: 1,
};

// what we show before the first answer of the API
const EMPTY_RESULT = { data: [], total: 0, page: 1, totalPages: 1 };

function ItemsList() {
  usePageTitle("Tasks");

  const { filters, setFilter, resetFilters, hasFilters } = useTaskFilters();

  const {
    data,
    loading,
    error,
    reload,
  } = useFetch((signal) => getTasks(filters, signal), [filters]);

  const result = data || EMPTY_RESULT;

  // create form state
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // typing -> URL (replace: true, so typing does not fill the history)
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilter("search", debouncedSearch, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // URL -> input (needed when the user presses Back or opens a ready link)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (data && data.page !== filters.page) {
      setFilter("page", data.page, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function handleReset() {
    setSearchInput("");
    resetFilters();
  }

  async function handleCreate(formData) {
    setSaving(true);
    setFormError("");

    try {
      const created = await createTask(formData);

      setFormOpen(false);
      setMessage('Task "' + created.name + '" was created');
      reload(); // load the list from the API again
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const firstOnPage = (result.page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(result.page * PAGE_SIZE, result.total);

  return (
    <section className="page items">
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <p className="muted">
            Search, filters, sorting and pagination are stored in the URL.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setFormOpen((prev) => !prev);
            setMessage("");
          }}
        >
          {formOpen ? "Close form" : "+ New task"}
        </button>
      </div>

      {formOpen && (
        <TaskForm
          mode="create"
          initialTask={emptyTask}
          saving={saving}
          error={formError}
          onSave={handleCreate}
          onCancel={() => setFormOpen(false)}
        />
      )}

      {message && <p className="message success">{message}</p>}

      <Filters
        search={searchInput}
        onSearchChange={setSearchInput}
        category={filters.category}
        priority={filters.priority}
        status={filters.status}
        sort={filters.sort}
        onFilterChange={setFilter}
        onReset={handleReset}
        showReset={hasFilters}
      />

      {/* three states: loading / error / empty, and only then the data */}
      {loading && <Loader text="Loading tasks..." />}

      {!loading && error && <ErrorBox message={error.message} onRetry={reload} />}

      {!loading && !error && result.data.length === 0 && (
        <EmptyBox text="No tasks match your filters">
          {hasFilters && (
            <button className="btn" onClick={handleReset}>
              Reset filters
            </button>
          )}
        </EmptyBox>
      )}

      {!loading && !error && result.data.length > 0 && (
        <>
          <p className="muted result-count">
            Showing {firstOnPage}–{lastOnPage} of {result.total} tasks
          </p>

          <div className="card-grid">
            {result.data.map((task) => (
              <Card key={task.id} task={task} />
            ))}
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={(nextPage) => setFilter("page", nextPage)}
          />
        </>
      )}
    </section>
  );
}

export default ItemsList;
