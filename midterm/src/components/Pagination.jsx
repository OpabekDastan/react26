export default function Pagination(props) {
  function previous() {
    props.onChange(props.page - 1);
  }
  function next() {
    props.onChange(props.page + 1);
  }

  return (
    <nav className="pages" aria-label="Question pages">
      <button className="secondary" onClick={previous} disabled={props.page === 1}>
        Previous
      </button>
      <span>
        Page {props.page} of {props.pages}
      </span>
      <button className="secondary" onClick={next} disabled={props.page === props.pages}>
        Next
      </button>
    </nav>
  );
}
