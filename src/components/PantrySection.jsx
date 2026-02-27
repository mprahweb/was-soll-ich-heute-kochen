export default function PantrySection({ pantry, onRemove, onClear, onGenerate, loading }) {
  const items = [...pantry].sort()

  return (
    <div className="container">
      <div className="section pantry-section">
        <div className="section-header">
          <h2 className="section-title">
            <span>✅</span>
            Mein Vorrat
            {items.length > 0 && <span className="badge">{items.length}</span>}
          </h2>
          {items.length > 0 && (
            <button className="btn-ghost-sm danger" onClick={onClear}>
              Alle entfernen
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="pantry-empty">
            Noch nichts im Vorrat. Tippe auf Lebensmittel oben, um sie hinzuzufügen.
          </p>
        ) : (
          <div className="pantry-tags">
            {items.map((item) => (
              <span key={item} className="pantry-tag">
                {item}
                <button
                  className="tag-remove"
                  onClick={() => onRemove(item)}
                  title="Entfernen"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <button
          className="generate-btn"
          onClick={onGenerate}
          disabled={items.length === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner">⏳</span>
              Rezepte werden generiert...
            </>
          ) : (
            <>
              ✨ 5 Rezeptvorschläge generieren
            </>
          )}
        </button>
        {items.length === 0 && (
          <p className="generate-hint">
            Wähle mindestens ein Lebensmittel aus deinem Vorrat, um Rezeptvorschläge zu erhalten.
          </p>
        )}
      </div>
    </div>
  )
}
