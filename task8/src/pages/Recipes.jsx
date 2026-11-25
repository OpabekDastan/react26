import { Link, Navigate, useLocation, useSearchParams } from "react-router";
import { useRecipes } from "../hooks/useRecipes.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import Pagination from "../components/Pagination.jsx";
import CachedNotice from "../components/CachedNotice.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

function Recipes() {
  usePageTitle("Recipes");

  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const { data, isPending, error, refetch } = useRecipes(page);

  function handlePageChange(nextPage) {
    setSearchParams(nextPage === 1 ? {} : { page: nextPage });
  }

  // offline and this page was never opened before -> dedicated offline page
  if (error?.offline && !data) {
    return (
      <Navigate
        to="/offline"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return (
    <section className="page recipes">
      <div className="page-head">
        <div>
          <h1>Recipes</h1>
          <p className="muted">
            Public API (dummyjson.com). Opened pages stay available offline.
          </p>
        </div>
      </div>

      <CachedNotice />

      {isPending && <Loader text="Loading recipes..." />}

      {error && !data && <ErrorBox message={error.message} onRetry={() => refetch()} />}

      {data && data.recipes.length === 0 && <EmptyBox text="No recipes on this page" />}

      {data && data.recipes.length > 0 && (
        <>
          <div className="card-grid">
            {data.recipes.map((recipe) => (
              <article className="card recipe-card" key={recipe.id}>
                <img
                  className="recipe-image"
                  src={recipe.image}
                  alt={recipe.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                <div className="card-top">
                  <span className="badge category">{recipe.cuisine}</span>
                  <span className="badge">{recipe.difficulty}</span>
                </div>
                <h3 className="card-title">{recipe.name}</h3>
                <p className="muted">
                  ★ {recipe.rating} · {recipe.prepTimeMinutes} min prep
                </p>
                <Link className="btn btn-primary card-link" to={"/recipes/" + recipe.id}>
                  Open recipe
                </Link>
              </article>
            ))}
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}

export default Recipes;
