// Small reusable "loading" block, used on every page
function Loader({ text = "Loading..." }) {
  return (
    <div className="state-box">
      <span className="spinner" aria-hidden="true" />
      <p>{text}</p>
    </div>
  );
}

export default Loader;
