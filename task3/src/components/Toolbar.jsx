export default function Toolbar({
  filter,
  onFilterChange,
  reversed,
  onToggleOrder,
  useIndexKeys,
  onToggleKeys,
}) {
  console.log('Toolbar render')

  const filters = [
    { value: 'all', label: 'Все' },
    { value: 'active', label: 'В бою' },
    { value: 'resting', label: 'Отдыхают' },
  ]

  return (
    <div className="toolbar">
      <div className="filters">
        {filters.map((item) => (
          <button
            key={item.value}
            className={filter === item.value ? 'btn btn-filter active' : 'btn btn-filter'}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button className="btn" onClick={onToggleOrder}>
        {reversed ? 'Обычный порядок' : 'Перевернуть список'}
      </button>

      <label className="switch">
        <input type="checkbox" checked={useIndexKeys} onChange={onToggleKeys} />
        key = index (демо бага)
      </label>
    </div>
  )
}
