import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [apiKey, setApiKey] = useState(() => load(STORAGE.API_KEY, ''))
  const [activeCategory, setActiveCategory] = useState(null)
  const [recipes, setRecipes] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [showApiModal, setShowApiModal] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(null)
  const retryFnRef = useRef(null)

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

  // Auto-retry countdown after rate limit
  useEffect(() => {
    if (retryCountdown === null) return
    if (retryCountdown === 0) {
      setRetryCountdown(null)
      setError(null)
      retryFnRef.current?.()
      return
    }
    const t = setTimeout(() => setRetryCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [retryCountdown])

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

  const generateRecipes = useCallback(async (keyOverride, forceRefresh = false) => {
    const key = keyOverride || apiKey
    if (!key) {
      setShowApiModal(true)
      return
    }
    if (pantry.size === 0) return

    // Return cached result if pantry hasn't changed
    if (!forceRefresh) {
      const cached = load(STORAGE.RECIPE_CACHE, null)
      if (cached && cached.key === pantryKey(pantry)) {
        setRecipes(cached.recipes)
        return
      }
    }

    setLoading(true)
    setError(null)
    setRecipes(null)

    const pantryList = [...pantry].join(', ')

    const prompt = `Vorrat: ${pantryList}

Erstelle 3 Rezepte auf Deutsch als JSON-Array. Nur JSON, kein Text drumherum:
[{"name":"...","description":"1 Satz","difficulty":"Einfach","time":"30 Min.","servings":4,"availableIngredients":["..."],"missingIngredients":["..."],"steps":["Schritt 1","Schritt 2","Schritt 3","Schritt 4"]}]

difficulty: nur "Einfach", "Mittel" oder "Aufwendig". missingIngredients: keine Grundzutaten (Salz, Pfeffer, Öl, Wasser).`

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2000 },
          }),
        }
      )

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        const msg = errData?.error?.message || `HTTP-Fehler ${response.status}`
        if (response.status === 400) throw new Error('Ungültiger API-Key. Bitte überprüfe deinen Gemini API-Key.')
        const isRateLimit =
          response.status === 429 ||
          response.status === 503 ||
          msg.toLowerCase().includes('quota') ||
          msg.toLowerCase().includes('rate') ||
          msg.toLowerCase().includes('anfragen') ||
          msg.toLowerCase().includes('resource_exhausted')
        if (isRateLimit) {
          retryFnRef.current = () => generateRecipes(keyOverride)
          setRetryCountdown(60)
          setLoading(false)
          return
        }
        throw new Error(msg)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error('Die KI hat kein gültiges JSON zurückgegeben. Bitte versuche es erneut.')

      const parsed = JSON.parse(jsonMatch[0])
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Keine Rezepte erhalten. Bitte versuche es erneut.')

      const result = parsed.slice(0, 3)
      localStorage.setItem(STORAGE.RECIPE_CACHE, JSON.stringify({ key: pantryKey(pantry), recipes: result }))
      setRecipes(result)
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
              onForceGenerate={() => generateRecipes(undefined, true)}
              loading={loading}
              hasCachedRecipes={Boolean(recipes)}
            />
            {(error || retryCountdown !== null) && (
              <div className="container">
                <div className="error-banner">
                  {retryCountdown !== null ? (
                    <span>⏳ Rate-Limit erreicht — neuer Versuch in {retryCountdown}s …</span>
                  ) : (
                    <span>⚠️ {error}</span>
                  )}
                  <button onClick={() => { setError(null); setRetryCountdown(null) }}>✕</button>
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
