import CharacterCard from './CharacterCard'

export default function CharacterList({
  characters,
  useIndexKeys,
  resetKeys,
  onToggleStatus,
  onLevelUp,
  onRemove,
  onReset,
}) {
  console.log('CharacterList render')

  if (characters.length === 0) {
    return <p className="empty">Здесь пока никого нет</p>
  }

  return (
    <div className="list">
      {characters.map((character, index) => {
        const stableKey = character.id + '-' + (resetKeys[character.id] || 0)

        return (
          <CharacterCard
            key={useIndexKeys ? index : stableKey}
            character={character}
            onToggleStatus={onToggleStatus}
            onLevelUp={onLevelUp}
            onRemove={onRemove}
            onReset={onReset}
          />
        )
      })}
    </div>
  )
}
