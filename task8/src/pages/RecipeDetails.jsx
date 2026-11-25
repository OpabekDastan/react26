import { Link, Navigate, useLocation, useParams } from "react-router";
import { useRecipe } from "../hooks/useRecipes.js";
import { usePageTitle } from "../hooks/usePageTitle.js";
import CachedNotice from "../components/CachedNotice.jsx";
import Loader from "../components/Loader.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import EmptyBox from "../components/EmptyBox.jsx";

function RecipeDetails() {
  const { id } = useParams();
  const location = useLocation();

  const { data: recipe, isPending, error, refetch } = useRecipe(id);

  usePageTitle(recipe ? recipe.name : "Recipe " + id);

  // offline and this recipe was never opened before -> dedicated offline page
  if (error?.offline && !recipe) {
    return <Navigate to="/offline" replace state={{ from: location.pathname }} />;
  }

  if (isPending) {
    return (
      <section className="page details">
        <Loader text={"Loading recipe #" + id + "..."} />
      </section>
    );
  }

  if (error?.status === 404) {
    return (
      <section className="page details">
        <EmptyBox text={'Recipe "' + id + '" does not exist'}>
          <Link className="btn btn-primary" to="/recipes">
            All recipes
          </Link>
        </EmptyBox>
      </section>
    );
  }

  if (error && !recipe) {
    return (
      <section className="page details">
        <ErrorBox message={error.message} onRetry={() => refetch()} />
      </section>
    );
  }

  return (
    <section className="page details">
      <div className="details-nav">
        <Link className="btn" to="/recipes">
          ← All recipes
        </Link>
      </div>

      <CachedNotice />

      <div className="panel recipe-details">
        <img
          className="recipe-cover"
          src={recipe.image}
          alt={recipe.name}
          crossOrigin="anonymous"
        />

        <div className="card-top">
          <span className="badge category">{recipe.cuisine}</span>
          <span className="badge">{recipe.difficulty}</span>
        </div>

        <h1>{recipe.name}</h1>

        <dl className="details-grid">
          <div>
            <dt>Rating</dt>
            <dd>★ {recipe.rating}</dd>
          </div>
          <div>
            <dt>Prep time</dt>
            <dd>{recipe.prepTimeMinutes} min</dd>
          </div>
          <div>
            <dt>Cook time</dt>
            <dd>{recipe.cookTimeMinutes} min</dd>
          </div>
          <div>
            <dt>Servings</dt>
            <dd>{recipe.servings}</dd>
          </div>
          <div>
            <dt>Calories</dt>
            <dd>{recipe.caloriesPerServing} per serving</dd>
          </div>
        </dl>

        <div className="recipe-columns">
          <div>
            <h3>Ingredients</h3>
            <ul className="list">
              {recipe.ingredients.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Instructions</h3>
            <ol className="list">
              {recipe.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RecipeDetails;
