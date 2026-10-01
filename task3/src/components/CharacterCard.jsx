import { useState } from 'react'

export default function CharacterCard({ character, onToggleStatus, onLevelUp, onRemove, onReset }) {
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState('')

  console.log('CharacterCard render:', character.name, '| open =', isOpen)

  return (
    <div className={isOpen ? 'card card-open' : 'card'}>
      <div className="card-top">
        <div>
          <h3 className="card-name">{character.name}</h3>
          <p className="card-role">{character.role}</p>
        </div>
        <span className={character.status === 'active' ? 'badge badge-active' : 'badge badge-rest'}>
          {character.status === 'active' ? 'В бою' : 'Отдыхает'}
        </span>
      </div>

      <div className="card-stats">
        <span>Уровень {character.level}</span>
        <span>HP {character.hp}</span>
      </div>

      <div className="card-actions">
        <button className="btn btn-small" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Скрыть детали' : 'Показать детали'}
        </button>
        <button className="btn btn-small" onClick={() => onToggleStatus(character.id)}>
          Сменить статус
        </button>
        <button className="btn btn-small" onClick={() => onLevelUp(character.id)}>
          Уровень +1
        </button>
      </div>

      {isOpen && (
        <div className="card-details">
          <p className="details-title">Заметка о персонаже</p>
          <input
            className="input"
            type="text"
            placeholder="Например: держит левый фланг"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <div className="card-actions">
            <button className="btn btn-small" onClick={() => onReset(character.id)}>
              Сбросить состояние
            </button>
            <button className="btn btn-small btn-danger" onClick={() => onRemove(character.id)}>
              Удалить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
