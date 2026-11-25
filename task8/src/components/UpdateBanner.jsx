import { useSwUpdate } from "../hooks/useSwUpdate.js";

// bottom banner: "a new version is available" + button that activates it
function UpdateBanner() {
  const { updateAvailable, applyUpdate } = useSwUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="update-banner" role="status">
      <span>A new version of the app is available.</span>
      <button className="btn btn-primary" onClick={applyUpdate}>
        Update now
      </button>
    </div>
  );
}

export default UpdateBanner;
