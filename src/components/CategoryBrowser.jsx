import { useState, useRef, useEffect } from 'react'
import { FOOD_DATABASE, ALL_CATEGORIES } from '../data/foods'

function FoodItem({ name, inPantry, inShopping, onTogglePantry, onToggleShopping }) {
  return (
    <div
      className={`food-item ${inPantry ? 'in-pantry' : ''} ${inShopping ? 'in-shopping' : ''}`}
    >
      <button
        className="food-item-main"
        onClick={() => onTogglePantry(name)}
        title={inPantry ? 'Aus Vorrat entfernen' : 'Zum Vorrat hinzufügen'}
      >
        {inPantry && <span className="food-check">✓</span>}
        <span className="food-name">{name}</span>
      </button>
      <button
        className={`food-cart-btn ${inShopping ? 'active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleShopping(name) }}
        title={inShopping ? 'Aus Einkaufsliste entfernen' : 'Zur Einkaufsliste hinzufügen'}
      >
        🛒
      </button>
    </div>
  )
}

export default function CategoryBrowser({ pantry, shopping, onTogglePantry, onToggleShopping, activeCategory, onCategoryChange }) {
  const [search, setSearch] = useState('')
  const tabsRef = useRef(null)

  const firstCategory = ALL_CATEGORIES[0]
  const currentCategory = activeCategory || firstCategory

  useEffect(() => {
    if (!activeCategory) onCategoryChange(firstCategory)
  }, [activeCategory, firstCategory, onCategoryChange])

  const handleCategoryClick = (cat) => {
    onCategoryChange(cat)
    setSearch('')
  }

  const getFilteredItems = () => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const results = []
      for (const cat of ALL_CATEGORIES) {
        for (const item of FOOD_DATABASE[cat].items) {
          if (item.toLowerCase().includes(q)) results.push(item)
        }
      }
      return results
    }
    return FOOD_DATABASE[currentCategory]?.items || []
  }

  const items = getFilteredItems()
  const catData = FOOD_DATABASE[currentCategory]

  // Count selected per category for badges
  const categoryCounts = {}
  for (const cat of ALL_CATEGORIES) {
    const count = FOOD_DATABASE[cat].items.filter(item => pantry.has(item)).length
    if (count > 0) categoryCounts[cat] = count
  }

  return (
    <div className="container">
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">
            <span>🔍</span>
            Lebensmittel
          </h2>
        </div>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Lebensmittel suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {!search && (
          <div className="category-tabs" ref={tabsRef}>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`cat-tab ${cat === currentCategory ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <span>{FOOD_DATABASE[cat].icon}</span>
                <span>{cat}</span>
                {categoryCounts[cat] > 0 && (
                  <span className="cat-badge">{categoryCounts[cat]}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {search ? (
          <div className="search-results-header">
            {items.length} Ergebnis{items.length !== 1 ? 'se' : ''} für „{search}"
          </div>
        ) : (
          <div className="category-header">
            <span>{catData?.icon}</span>
            <span>{currentCategory}</span>
            <span className="category-count">{items.length} Artikel</span>
          </div>
        )}

        <div className="food-grid">
          {items.map((item) => (
            <FoodItem
              key={item}
              name={item}
              inPantry={pantry.has(item)}
              inShopping={shopping.has(item)}
              onTogglePantry={onTogglePantry}
              onToggleShopping={onToggleShopping}
            />
          ))}
          {items.length === 0 && (
            <div className="no-results-inline">Keine Lebensmittel gefunden.</div>
          )}
        </div>

        <div className="food-legend">
          <span className="legend-item">
            <span className="legend-dot pantry"></span>
            Grün = im Vorrat
          </span>
          <span className="legend-item">
            <span className="legend-dot shopping">🛒</span>
            Warenkorb = Einkaufsliste
          </span>
        </div>
      </div>
    </div>
  )
}
