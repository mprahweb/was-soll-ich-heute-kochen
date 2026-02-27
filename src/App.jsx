import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import CategoryBrowser from './components/CategoryBrowser'
import PantrySection from './components/PantrySection'
import RecipeSection from './components/RecipeSection'
import ShoppingList from './components/ShoppingList'
import ApiKeyModal from './components/ApiKeyModal'

const STORAGE = {
  PANTRY: 'wsikh_pantry_v2',
  SHOPPING: 'wsikh_shopping_v2',
  API_KEY: 'wsikh_api_key',
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
  const [apiKey, setApiKey] = useState(() => load(STORAGE.API_KEY, ''))
  const [activeCategory, setActiveCategory] = useState(null)
  const [recipes, setRecipes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [showApiModal, setShowApiModal] = useState(false)

  // Persist pantry
  useEffect(() => {
    localStorage.setItem(STORAGE.PANTRY, JSON.stringify([...pantry]))
  }, [pantry])

  // Persist shopping list
  useEffect(() => {
    localStorage.setItem(STORAGE.SHOPPING, JSON.stringify([...shopping]))
  }, [shopping])

  // Persist API key
  useEffect(() => {
    localStorage.setItem(STORAGE.API_KEY, JSON.stringify(apiKey))
  }, [apiKey])

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

  const generateRecipes = useCallback(async (keyOverride) => {
    const key = keyOverride || apiKey
    if (!key) {
      setShowApiModal(true)
      return
    }
    if (pantry.size === 0) return

    setLoading(true)
    setError(null)
    setRecipes(null)

    const pantryList = [...pantry].join(', ')

    const prompt = `Du bist ein professioneller Kochassistent.

Der Benutzer hat folgende Lebensmittel im Vorrat: ${pantryList}

Erstelle genau 5 kreative und leckere Rezeptvorschläge auf Deutsch, die möglichst viele dieser vorhandenen Zutaten nutzen. Beziehe auch typische Standardzutaten mit ein (Salz, Pfeffer, Wasser, etc.).

Antworte AUSSCHLIESSLICH mit einem JSON-Array (kein weiterer Text, kein Markdown, keine Erklärungen):
[
  {
    "name": "Rezeptname",
    "description": "Appetitliche Kurzbeschreibung in 1-2 Sätzen",
    "difficulty": "Einfach",
    "time": "30 Min.",
    "servings": 4,
    "availableIngredients": ["Zutat aus dem Vorrat 1", "Zutat aus dem Vorrat 2"],
    "missingIngredients": ["Fehlende Zutat 1", "Fehlende Zutat 2"],
    "steps": ["Schritt 1 ausführliche Beschreibung", "Schritt 2 ausführliche Beschreibung", "Schritt 3", "Schritt 4", "Schritt 5"]
  }
]

Wichtige Hinweise:
- Verwende nur "Einfach", "Mittel" oder "Aufwendig" für difficulty
- availableIngredients: NUR Zutaten die im Vorrat sind
- missingIngredients: Zutaten die für das Rezept fehlen (keine Grundzutaten wie Salz/Pfeffer)
- steps: 4-6 ausführliche Zubereitungsschritte`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 4000 },
          }),
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        const msg = errData?.error?.message || `HTTP-Fehler ${response.status}`
        if (response.status === 400) throw new Error('Ungültiger API-Key. Bitte überprüfe deinen Gemini API-Key.')
        if (response.status === 429) throw new Error('Zu viele Anfragen. Bitte warte kurz und versuche es erneut.')
        throw new Error(msg)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Die KI hat kein gültiges JSON zurückgegeben. Bitte versuche es erneut.')

      const parsed = JSON.parse(jsonMatch[0])
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Keine Rezepte erhalten. Bitte versuche es erneut.')

      setRecipes(parsed.slice(0, 5))
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Netzwerkfehler. Bitte überprüfe deine Internetverbindung.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [apiKey, pantry])

  const handleApiKeySave = useCallback((key) => {
    setApiKey(key)
    setShowApiModal(false)
    // Auto-generate if pantry is ready
    if (pantry.size > 0) {
      generateRecipes(key)
    }
  }, [pantry.size, generateRecipes])

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        shoppingCount={shopping.size}
        pantryCount={pantry.size}
        onApiKeyClick={() => setShowApiModal(true)}
        hasApiKey={Boolean(apiKey)}
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
              loading={loading}
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
                onRegenerate={() => generateRecipes()}
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
        Was soll ich heute kochen? &mdash; Powered by Google Gemini
      </footer>

      {showApiModal && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={handleApiKeySave}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  )
}
