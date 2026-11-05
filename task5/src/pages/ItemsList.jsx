import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { getTasks, createTask, PAGE_SIZE } from "../services/service.js";
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

function ItemsList() {
  usePageTitle("Tasks");

  /**
   * useSearchParams works like useState, but the state lives in the URL:
   *   /items?search=react&category=Study&page=2
   * Because of that the Back / Forward buttons, a page refresh and a copied
   * link all restore exactly the same view. The URL is our single source of
   * truth — we never keep filters in a separate useState.
   */
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "name";
  const page = Number(searchParams.get("page")) || 1;

  // list state
  const [result, setResult] = useState({ data: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // create form state
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  // the input is typed fast, but the URL and the request are updated with a delay
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // writes the new values into the URL; empty values are removed from it
  function updateParams(changes, replace = false) {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    setSearchParams(next, { replace });
  }

  // typing -> URL (replace: true, so typing does not fill the history)
  useEffect(() => {
    if (debouncedSearch !== search) {
      updateParams({ search: debouncedSearch, page: 1 }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // URL -> input (needed when the user presses Back or opens a ready link)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  /**
   * Loading of the list.
   * The effect depends on every value from the URL: as soon as the user
   * changes a filter, the URL changes, the effect runs again and asks the API.
   *
   * AbortController cancels the previous request, so a slow old answer
   * can never overwrite a fresh one (stale request problem).
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadTasks() {
      setLoading(true);
      setError("");

      try {
        const response = await getTasks(
          { search, category, priority, status, sort, page },
          controller.signal,
        );

        setResult(response);
        setLoading(false);

        // the API clamps the page (for example page 5 but only 2 pages left)
        if (response.page !== page) {
          updateParams({ page: response.page }, true);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return; // the request was cancelled, a newer one is already running
        }
        setError(err.message);
        setLoading(false);
      }
    }

    loadTasks();

    return () => controller.abort(); // cleanup: cancel the old request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, priority, status, sort, page, reloadCount]);

  function handleFilterChange(name, value) {
    // any new filter returns the user to the first page
    updateParams({ [name]: value, page: 1 });
  }

  function handleReset() {
    setSearchInput("");
    setSearchParams({});
  }

  async function handleCreate(formData) {
    setSaving(true);
    setFormError("");

    try {
      const created = await createTask(formData);

      setFormOpen(false);
      setMessage('Task "' + created.name + '" was created');
      setReloadCount((prev) => prev + 1); // reload the list from the API
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const hasFilters =
    search !== "" ||
    category !== "" ||
    priority !== "" ||
    status !== "" ||
    sort !== "name";

  const firstOnPage = (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(page * PAGE_SIZE, result.total);

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
        category={category}
        priority={priority}
        status={status}
        sort={sort}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        showReset={hasFilters}
      />

      {/* three states: loading / error / empty, and only then the data */}
      {loading && <Loader text="Loading tasks..." />}

      {!loading && error && (
        <ErrorBox
          message={error}
          onRetry={() => setReloadCount((prev) => prev + 1)}
        />
      )}

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
            onChange={(nextPage) => updateParams({ page: nextPage })}
          />
        </>
      )}
    </section>
  );
}

export default ItemsList;
