// Reusable "nothing found" block (empty result of search / filters)
function EmptyBox({ text = "Nothing found", children }) {
  return (
    <div className="state-box">
      <p className="state-title">{text}</p>
      {children}
    </div>
  );
}

export default EmptyBox;
