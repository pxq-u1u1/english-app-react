export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="pagination">
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>‹</button>
      <span>{page} / {totalPages}</span>
      <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>›</button>
    </div>
  )
}
