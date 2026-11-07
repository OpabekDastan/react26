function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  // [1, 2, 3, ...] – the list is small, so we can show all the pages
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>

      {pages.map((item) => (
        <button
          key={item}
          className={item === page ? "btn page-btn active" : "btn page-btn"}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}

      <button
        className="btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next →
      </button>
    </nav>
  );
}

export default Pagination;
