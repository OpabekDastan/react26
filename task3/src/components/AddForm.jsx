import { useState } from 'react'
import { roles } from '../data'

export default function AddForm({ onAdd }) {
  const [name, setName] = useState('')
  const [role, setRole] = useState(roles[0])

  console.log('AddForm render')

  function handleSubmit() {
    if (name.trim() === '') {
      return
    }
    onAdd(name.trim(), role)
    setName('')
  }

  return (
    <div className="add-form">
      <input
        className="input"
        type="text"
        placeholder="Имя персонажа"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <select className="select" value={role} onChange={(event) => setRole(event.target.value)}>
        {roles.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={handleSubmit}>
        Добавить
      </button>
    </div>
  )
}
