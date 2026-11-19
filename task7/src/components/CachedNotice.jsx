import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

// tells the user that the data on the screen is a saved copy (shown only offline)
function CachedNotice() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <p className="message cached">
      You are offline — this is a saved copy of the data. It will refresh when
      the connection returns.
    </p>
  );
}

export default CachedNotice;
