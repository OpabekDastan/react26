// Reusable "error" block with an optional Retry button
function ErrorBox({ message, onRetry }) {
  return (
    <div className="state-box error">
      <p className="state-title">Something went wrong</p>
      <p>{message}</p>

      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorBox;
