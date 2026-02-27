export default function ShoppingList({ items, onRemove, onClear }) {
  const itemArray = [...items].sort()

  if (itemArray.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Einkaufsliste ist leer</h2>
          <p>
            Füge Lebensmittel zur Einkaufsliste hinzu, indem du im Bereich
            „Mein Vorrat" auf das Warenkorb-Symbol tippst.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">
            <span>🛒</span>
            Einkaufsliste
            <span className="badge">{itemArray.length}</span>
          </h2>
          <button className="btn-ghost-sm danger" onClick={onClear}>
            Alle löschen
          </button>
        </div>
        <ul className="shopping-list">
          {itemArray.map((item) => (
            <li key={item} className="shopping-item">
              <span className="shopping-item-name">{item}</span>
              <button
                className="shopping-remove"
                onClick={() => onRemove(item)}
                title="Aus Liste entfernen"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
