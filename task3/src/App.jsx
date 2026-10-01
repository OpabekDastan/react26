import { useState } from 'react'
import AddForm from './components/AddForm'
import Toolbar from './components/Toolbar'
import CharacterList from './components/CharacterList'
import { initialCharacters } from './data'
import './styles.css'

let nextId = 100

export default function App() {
  const [characters, setCharacters] = useState(initialCharacters)
  const [filter, setFilter] = useState('all')
  const [reversed, setReversed] = useState(false)
  const [useIndexKeys, setUseIndexKeys] = useState(false)
  const [resetKeys, setResetKeys] = useState({})

  console.log('App render')

  function handleAdd(name, role) {
    const newCharacter = {
      id: nextId++,
      name: name,
      role: role,
      level: 1,
      hp: 100,
      status: 'active',
    }
    setCharacters([newCharacter, ...characters])
  }

  function handleRemove(id) {
    setCharacters(characters.filter((character) => character.id !== id))
  }

  function handleToggleStatus(id) {
    setCharacters(
      characters.map((character) =>
        character.id === id
          ? { ...character, status: character.status === 'active' ? 'resting' : 'active' }
          : character
      )
    )
  }

  function handleLevelUp(id) {
    setCharacters(
      characters.map((character) =>
        character.id === id
          ? { ...character, level: character.level + 1, hp: character.hp + 10 }
          : character
      )
    )
  }

  function handleReset(id) {
    setResetKeys({ ...resetKeys, [id]: (resetKeys[id] || 0) + 1 })
  }

  let visibleCharacters = characters
  if (filter !== 'all') {
    visibleCharacters = characters.filter((character) => character.status === filter)
  }
  if (reversed) {
    visibleCharacters = [...visibleCharacters].reverse()
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Отряд героев</h1>
        <p className="subtitle">
          Всего: {characters.length} · Показано: {visibleCharacters.length}
        </p>
      </header>

      <AddForm onAdd={handleAdd} />

      <Toolbar
        filter={filter}
        onFilterChange={setFilter}
        reversed={reversed}
        onToggleOrder={() => setReversed(!reversed)}
        useIndexKeys={useIndexKeys}
        onToggleKeys={() => setUseIndexKeys(!useIndexKeys)}
      />

      <CharacterList
        characters={visibleCharacters}
        useIndexKeys={useIndexKeys}
        resetKeys={resetKeys}
        onToggleStatus={handleToggleStatus}
        onLevelUp={handleLevelUp}
        onRemove={handleRemove}
        onReset={handleReset}
      />
    </div>
  )
}