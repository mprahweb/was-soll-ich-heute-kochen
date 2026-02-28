import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import CategoryBrowser from './components/CategoryBrowser'
import PantrySection from './components/PantrySection'
import RecipeSection from './components/RecipeSection'
import ShoppingList from './components/ShoppingList'

const COOKBOOK_URL = 'https://1drv.ms/x/c/8a69bccffe904e20/IQC4RnhYGUwPRItV0-7KGNkiAZ-j_W0sUQ0kugLHYG8E5rA'

function getOneDriveDirectUrl(shareUrl) {
  const encoded = btoa(shareUrl)
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `https://api.onedrive.com/v1.0/shares/u!${encoded}/root/content`
}

function parseCsv(text) {
  const rows = []
  let fields = []
  let field = ''
  let inQuote = false
  const chars = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i <= chars.length; i++) {
    const c = i < chars.length ? chars[i] : null

    if (inQuote) {
      if (c === '"') {
        if (chars[i + 1] === '"') { field += '"'; i++ }
        else { inQuote = false }
      } else if (c === null) {
        fields.push(field); rows.push(fields)
      } else {
        field += c
      }
    } else {
      if (c === '"' && field === '') {
        inQuote = true
      } else if (c === ',') {
        fields.push(field); field = ''
      } else if (c === '\n' || c === null) {
        fields.push(field); field = ''
        if (fields.some(f => f.trim())) rows.push(fields)
        fields = []
      } else {
        field += c
      }
    }
  }

  if (rows.length === 0) return []
  const headers = rows[0].map(h => h.trim())
  return rows.slice(1).map(row =>
    Object.fromEntries(headers.map((h, idx) => [h, (row[idx] ?? '').trim()]))
  )
}

function matchRecipesToPantry(csvRecipes, pantry) {
  const pantryList = [...pantry].map(p => p.toLowerCase())

  return csvRecipes
    .filter(row => (row['Titel'] || row['titel'] || '').trim())
    .map(row => {
      const rawIngredients = row['Zutaten'] || row['zutaten'] || ''
      const rawSteps = row['Zubereitung'] || row['zubereitung'] || ''

      const sep = rawIngredients.includes(';') ? ';' : ','
      const ingredients = rawIngredients.split(sep).map(s => s.trim()).filter(Boolean)

      const available = ingredients.filter(ing =>
        pantryList.some(p => ing.toLowerCase().includes(p))
      )
      const missing = ingredients.filter(ing => !available.includes(ing))

      const steps = rawSteps
        .split('\n')
        .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(s => s.length > 0)

      return {
        name: (row['Titel'] || row['titel'] || '').trim(),
        description: (row['Kategorie'] || row['kategorie'] || '').trim(),
        difficulty: (row['Schwierigkeit'] || row['schwierigkeit'] || '').trim(),
        time: (row['Zeit'] || row['Dauer'] || row['zeit'] || row['dauer'] || '').trim(),
        servings: parseInt(row['Portionen'] || row['portionen'] || '4') || 4,
        availableIngredients: available,
        missingIngredients: missing,
        steps: steps.length > 0 ? steps : ['Alle Zutaten vorbereiten und nach Anleitung zubereiten.'],
        source: 'csv',
        score: ingredients.length > 0 ? available.length / ingredients.length : 0,
      }
    })
    .sort((a, b) => b.score - a.score)
}

const STORAGE = {
  PANTRY: 'wsikh_pantry_v2',
  SHOPPING: 'wsikh_shopping_v2',
  RECIPE_CACHE: 'wsikh_recipe_cache',
}

function pantryKey(pantry) {
  return [...pantry].sort().join('|')
}

function load(key, fallback) {
  try {
    const val = localStorage.getItem(key)
    if (val === null) return fallback
    return JSON.parse(val)
  } catch {
    return fallback
  }
}

export default function App() {
  const [pantry, setPantry] = useState(() => new Set(load(STORAGE.PANTRY, [])))
  const [shopping, setShopping] = useState(() => new Set(load(STORAGE.SHOPPING, [])))
  const [activeCategory, setActiveCategory] = useState(null)
  const [recipes, setRecipes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const offsetRef = useRef(0)

  useEffect(() => {
    localStorage.setItem(STORAGE.PANTRY, JSON.stringify([...pantry]))
  }, [pantry])

  useEffect(() => {
    localStorage.setItem(STORAGE.SHOPPING, JSON.stringify([...shopping]))
  }, [shopping])

  const togglePantry = useCallback((item) => {
    setPantry((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }, [])

  const toggleShopping = useCallback((item) => {
    setShopping((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }, [])

  const addMissingToShopping = useCallback((missingItems) => {
    setShopping((prev) => {
      const next = new Set(prev)
      missingItems.forEach((item) => next.add(item))
      return next
    })
  }, [])

  const generateRecipes = useCallback(async (forceRefresh = false) => {
    if (pantry.size === 0) return

    if (!forceRefresh) {
      const cached = load(STORAGE.RECIPE_CACHE, null)
      if (cached && cached.key === pantryKey(pantry)) {
        offsetRef.current = 0
        setRecipes(cached.recipes)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const directUrl = getOneDriveDirectUrl(COOKBOOK_URL)
      const res = await fetch(directUrl)
      if (!res.ok) throw new Error(`Kochbuch konnte nicht geladen werden (HTTP ${res.status})`)
      const text = await res.text()

      const csvRecipes = parseCsv(text)
      if (csvRecipes.length === 0) throw new Error('Das Kochbuch scheint leer oder unlesbar zu sein.')

      const allMatched = matchRecipesToPantry(csvRecipes, pantry)
      if (allMatched.length === 0) throw new Error('Keine passenden Rezepte für deinen Vorrat gefunden.')

      if (forceRefresh) {
        offsetRef.current = (offsetRef.current + 3) % allMatched.length
      } else {
        offsetRef.current = 0
      }

      const offset = offsetRef.current
      const sliced = [
        ...allMatched.slice(offset, offset + 3),
        ...allMatched.slice(0, Math.max(0, offset + 3 - allMatched.length)),
      ].slice(0, 3)

      localStorage.setItem(STORAGE.RECIPE_CACHE, JSON.stringify({ key: pantryKey(pantry), recipes: sliced }))
      setRecipes(sliced)
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Netzwerkfehler. Bitte überprüfe deine Internetverbindung.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [pantry])

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shoppingCount={shopping.size}
        pantryCount={pantry.size}
      />

      <main className="main-content">
        {activeTab === 'home' ? (
          <>
            <CategoryBrowser
              pantry={pantry}
              shopping={shopping}
              onTogglePantry={togglePantry}
              onToggleShopping={toggleShopping}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
            <PantrySection
              pantry={pantry}
              onRemove={togglePantry}
              onClear={() => setPantry(new Set())}
              onGenerate={() => generateRecipes()}
              onForceGenerate={() => generateRecipes(true)}
              loading={loading}
              hasCachedRecipes={Boolean(recipes)}
            />
            {error && (
              <div className="container">
                <div className="error-banner">
                  <span>⚠️ {error}</span>
                  <button onClick={() => setError(null)}>✕</button>
                </div>
              </div>
            )}
            {recipes && (
              <RecipeSection
                recipes={recipes}
                pantry={pantry}
                shopping={shopping}
                onAddMissing={addMissingToShopping}
                onToggleShopping={toggleShopping}
                onRegenerate={() => generateRecipes(true)}
                loading={loading}
              />
            )}
          </>
        ) : (
          <ShoppingList
            items={shopping}
            onRemove={toggleShopping}
            onClear={() => setShopping(new Set())}
          />
        )}
      </main>

      <footer className="footer">
        Was soll ich heute kochen? &mdash; Aus deinem Kochbuch
      </footer>
    </div>
  )
}
