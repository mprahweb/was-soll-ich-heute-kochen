import { useState } from 'react'

function RecipeCard({ recipe, index, pantry, shopping, onAddMissing, onToggleShopping }) {
  const [expanded, setExpanded] = useState(false)

  const available = recipe.availableIngredients || []
  const missing = recipe.missingIngredients || []
  const steps = recipe.steps || []

  const difficultyColor = {
    'Einfach': 'diff-easy',
    'Mittel': 'diff-medium',
    'Aufwendig': 'diff-hard',
  }[recipe.difficulty] || 'diff-easy'

  return (
    <div className="recipe-card" style={{ animationDelay: `${index * 0.08}s` }}>
      <div className="recipe-card-header">
        <div className="recipe-number">{index + 1}</div>
        <div className="recipe-meta">
          <span className={`difficulty-badge ${difficultyColor}`}>{recipe.difficulty}</span>
          {recipe.time && <span className="time-badge">⏱ {recipe.time}</span>}
          {recipe.servings && <span className="servings-badge">👥 {recipe.servings} Pers.</span>}
        </div>
      </div>

      <div className="recipe-card-body">
        <h3 className="recipe-name">{recipe.name}</h3>
        <p className="recipe-desc">{recipe.description}</p>

        {available.length > 0 && (
          <div className="ingredient-group">
            <div className="ingredient-group-label">
              <span className="ig-dot available"></span>
              Vorhandene Zutaten ({available.length})
            </div>
            <div className="ingredient-chips">
              {available.map((ing) => (
                <span key={ing} className="chip chip-available">{ing}</span>
              ))}
            </div>
          </div>
        )}

        {missing.length > 0 && (
          <div className="ingredient-group">
            <div className="ingredient-group-label">
              <span className="ig-dot missing"></span>
              Fehlende Zutaten ({missing.length})
            </div>
            <div className="ingredient-chips">
              {missing.map((ing) => (
                <span
                  key={ing}
                  className={`chip chip-missing ${shopping.has(ing) ? 'in-shopping' : ''}`}
                  onClick={() => onToggleShopping(ing)}
                  title={shopping.has(ing) ? 'Aus Einkaufsliste entfernen' : 'Zur Einkaufsliste hinzufügen'}
                  style={{ cursor: 'pointer' }}
                >
                  {shopping.has(ing) ? '🛒 ' : ''}{ing}
                </span>
              ))}
            </div>
            <button
              className="btn-add-all"
              onClick={() => onAddMissing(missing)}
            >
              🛒 Alle fehlenden Zutaten zur Einkaufsliste hinzufügen
            </button>
          </div>
        )}

        {steps.length > 0 && (
          <div className="steps-section">
            <button
              className="steps-toggle"
              onClick={() => setExpanded(!expanded)}
            >
              <span>{expanded ? '▲' : '▼'}</span>
              {expanded ? 'Zubereitung ausblenden' : 'Zubereitung anzeigen'}
            </button>
            {expanded && (
              <ol className="steps-list">
                {steps.map((step, i) => (
                  <li key={i} className="step-item">
                    <span className="step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecipeSection({ recipes, pantry, shopping, onAddMissing, onToggleShopping, onRegenerate, loading }) {
  if (!recipes || recipes.length === 0) return null

  // Collect all missing ingredients across recipes
  const allMissing = [...new Set(recipes.flatMap(r => r.missingIngredients || []))]

  return (
    <div className="container">
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">
            <span>✨</span>
            Rezeptvorschläge
            <span className="badge">{recipes.length}</span>
          </h2>
          <button
            className="btn-ghost-sm"
            onClick={onRegenerate}
            disabled={loading}
          >
            🔄 Neu generieren
          </button>
        </div>

        <div className="recipes-grid">
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              index={i}
              pantry={pantry}
              shopping={shopping}
              onAddMissing={onAddMissing}
              onToggleShopping={onToggleShopping}
            />
          ))}
        </div>

        {allMissing.length > 0 && (
          <div className="all-missing-section">
            <button
              className="btn-primary-outline"
              onClick={() => onAddMissing(allMissing)}
            >
              🛒 Alle fehlenden Zutaten aller Rezepte zur Einkaufsliste hinzufügen ({allMissing.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
