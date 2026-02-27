import { useState, useEffect, useCallback, useRef } from 'react'
import Header from './components/Header'
import CategoryBrowser from './components/CategoryBrowser'
import PantrySection from './components/PantrySection'
import RecipeSection from './components/RecipeSection'
import ShoppingList from './components/ShoppingList'
import ApiKeyModal from './components/ApiKeyModal'

const DE_TO_EN = {
  // Gemüse
  'kartoffeln': 'potato', 'tomaten': 'tomato', 'zwiebeln': 'onion',
  'knoblauch': 'garlic', 'paprika (rot)': 'red pepper', 'paprika (gelb)': 'yellow pepper',
  'paprika (grün)': 'green pepper', 'zucchini': 'courgette', 'brokkoli': 'broccoli',
  'karotten': 'carrot', 'spinat': 'spinach', 'champignons': 'mushroom',
  'aubergine': 'aubergine', 'blumenkohl': 'cauliflower', 'lauch': 'leek',
  'sellerie': 'celery', 'rote bete': 'beetroot', 'fenchel': 'fennel',
  'rosenkohl': 'brussels sprouts', 'süßkartoffeln': 'sweet potato', 'kürbis': 'pumpkin',
  'mais (frisch)': 'corn', 'erbsen (frisch)': 'peas', 'grüne bohnen': 'green beans',
  'wirsing': 'savoy cabbage', 'pak choi': 'pak choi', 'gurke': 'cucumber',
  // Obst
  'äpfel': 'apple', 'bananen': 'banana', 'zitronen': 'lemon', 'orangen': 'orange',
  'erdbeeren': 'strawberry', 'avocado': 'avocado', 'mango': 'mango', 'ananas': 'pineapple',
  // Fleisch
  'hähnchenbrust': 'chicken breast', 'hähnchenschenkel': 'chicken thigh',
  'hähnchen (ganz)': 'whole chicken', 'putenbrust': 'turkey breast',
  'hackfleisch (rind)': 'beef mince', 'hackfleisch (gemischt)': 'minced beef',
  'hackfleisch (schwein)': 'pork mince', 'rindersteaks': 'beef steak',
  'rindergulasch': 'beef', 'schweinefilet': 'pork', 'schweinekotelett': 'pork chop',
  'schweinebauch': 'pork belly', 'speck': 'bacon', 'bratwurst': 'sausage',
  'würstchen': 'sausage', 'lammkoteletts': 'lamb chop', 'lammhackfleisch': 'lamb mince',
  // Fisch
  'lachs (filet)': 'salmon', 'lachssteak': 'salmon', 'kabeljau': 'cod',
  'thunfisch (frisch)': 'tuna', 'thunfisch (dose)': 'tuna', 'garnelen (frisch)': 'prawns',
  'garnelen': 'prawns', 'forelle': 'trout', 'sardinen (dose)': 'sardine',
  // Milch & Käse
  'eier': 'eggs', 'butter': 'butter', 'milch (3,5%)': 'milk', 'milch (1,5%)': 'milk',
  'sahne (30%+)': 'cream', 'schlagsahne': 'whipping cream', 'kochsahne (15%)': 'single cream',
  'crème fraîche': 'creme fraiche', 'joghurt (natur)': 'yoghurt', 'joghurt (griechisch)': 'greek yoghurt',
  'quark (mager)': 'quark', 'gouda': 'gouda', 'mozzarella (frisch)': 'mozzarella',
  'mozzarella (gerieben)': 'mozzarella', 'parmesan': 'parmesan', 'feta': 'feta',
  'frischkäse (natur)': 'cream cheese', 'ricotta': 'ricotta', 'mascarpone': 'mascarpone',
  // Pasta & Getreide
  'spaghetti': 'spaghetti', 'penne': 'penne', 'fusilli': 'pasta', 'lasagneplatten': 'lasagne',
  'tortellini (frisch)': 'pasta', 'gnocchi (frisch)': 'gnocchi',
  'reis (weiß, langkorn)': 'rice', 'basmati-reis': 'basmati rice',
  'risotto-reis (arborio)': 'arborio rice', 'jasmin-reis': 'jasmine rice',
  'couscous': 'couscous', 'bulgur': 'bulgur wheat', 'quinoa': 'quinoa',
  'mehl (typ 405)': 'flour', 'mehl (typ 550)': 'flour', 'haferflocken (zart)': 'oats',
  // Hülsenfrüchte
  'rote linsen': 'red lentils', 'braune linsen': 'lentils', 'kichererbsen (dose)': 'chickpeas',
  'kichererbsen (trocken)': 'chickpeas', 'kidneybohnen (dose)': 'kidney beans',
  'weiße bohnen (dose)': 'cannellini beans', 'tofu (natur)': 'tofu',
  // Konserven
  'dosentomaten (gehackt)': 'chopped tomatoes', 'dosentomaten (ganz)': 'tomatoes',
  'tomatenmark': 'tomato puree', 'passata (tomatenpüree)': 'passata',
  'kokosmilch (dose)': 'coconut milk', 'mais (dose)': 'sweetcorn',
  'erbsen (dose)': 'peas', 'oliven (glas)': 'olives',
  // Gewürze & Saucen
  'ingwer (frisch, wurzel)': 'ginger', 'chili (frisch, rot)': 'red chilli',
  'kreuzkümmel (gemahlen)': 'cumin', 'koriander (gemahlen)': 'coriander',
  'paprikapulver (süß)': 'paprika', 'curry (mild)': 'curry powder',
  'kurkuma': 'turmeric', 'zimt (gemahlen)': 'cinnamon', 'sesam': 'sesame seeds',
  'sojasauce (hell)': 'soy sauce', 'sojasauce (dunkel)': 'dark soy sauce',
  'fischsauce': 'fish sauce', 'hoisin-sauce': 'hoisin sauce',
  'tahini': 'tahini', 'hummus (fertig)': 'hummus',
  'honig': 'honey', 'walnüsse': 'walnuts', 'mandeln (ganz)': 'almonds',
  'cashews': 'cashew nuts', 'erdnüsse': 'peanuts',
  'olivenöl (extra vergine)': 'olive oil',
}

async function translateWithGemini(recipes, apiKey) {
  if (!apiKey) return null

  const payload = recipes.map(r => ({
    name: r.name,
    description: r.description,
    availableIngredients: r.availableIngredients,
    missingIngredients: r.missingIngredients,
    steps: r.steps,
  }))

  const prompt = `Übersetze die folgenden Rezeptdaten vollständig ins Deutsche. Gib nur ein JSON-Array zurück, kein Text drumherum. Behalte die exakt gleiche Struktur bei:\n${JSON.stringify(payload)}\n\nDas Array muss ${recipes.length} Objekte enthalten mit den Feldern: name, description, availableIngredients (Array), missingIngredients (Array), steps (Array).`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 3000 },
      }),
    }
  )

  if (!response.ok) return null
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return null
  const translated = JSON.parse(match[0])
  if (!Array.isArray(translated) || translated.length !== recipes.length) return null
  return translated
}

async function fetchFromMealDB(pantry, apiKey = '') {
  const searchTerms = [...pantry]
    .map(item => DE_TO_EN[item.toLowerCase()] || null)
    .filter(Boolean)
    .slice(0, 4)

  if (searchTerms.length === 0) return null

  const searches = await Promise.all(
    searchTerms.map(term =>
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(term)}`)
        .then(r => r.json())
        .then(d => d.meals || [])
        .catch(() => [])
    )
  )

  const mealCount = {}
  searches.forEach(meals => {
    meals.forEach(m => { mealCount[m.idMeal] = (mealCount[m.idMeal] || 0) + 1 })
  })

  const topIds = Object.entries(mealCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id)

  if (topIds.length === 0) return null

  const details = await Promise.all(
    topIds.map(id =>
      fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(r => r.json())
        .then(d => d.meals?.[0])
        .catch(() => null)
    )
  )

  const pantryEn = new Set(
    [...pantry].map(p => (DE_TO_EN[p.toLowerCase()] || p).toLowerCase())
  )

  const englishRecipes = details
    .filter(Boolean)
    .map(meal => {
      const allIngredients = []
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`]?.trim()
        const meas = meal[`strMeasure${i}`]?.trim()
        if (ing) allIngredients.push(meas ? `${meas} ${ing}` : ing)
      }
      const BASICS = ['salt', 'water', 'oil', 'pepper', 'sugar']
      const available = allIngredients.filter(ing =>
        [...pantryEn].some(p => ing.toLowerCase().includes(p))
      )
      const missing = allIngredients.filter(ing =>
        !available.includes(ing) &&
        !BASICS.some(b => ing.toLowerCase().includes(b))
      ).slice(0, 8)

      const steps = (meal.strInstructions || '')
        .split(/\r?\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 15)
        .slice(0, 7)

      return {
        name: meal.strMeal,
        description: `${meal.strCategory || 'Rezept'} · ${meal.strArea || 'International'}`,
        difficulty: 'Mittel',
        time: 'ca. 30 Min.',
        servings: 4,
        availableIngredients: available,
        missingIngredients: missing,
        steps: steps.length > 0 ? steps : ['Alle Zutaten vorbereiten und nach Anleitung zubereiten.'],
        source: 'themealdb',
      }
    })

  try {
    const translated = await translateWithGemini(englishRecipes, apiKey)
    if (translated) {
      return englishRecipes.map((recipe, i) => ({
        ...recipe,
        name: translated[i].name ?? recipe.name,
        description: translated[i].description ?? recipe.description,
        availableIngredients: Array.isArray(translated[i].availableIngredients)
          ? translated[i].availableIngredients
          : recipe.availableIngredients,
        missingIngredients: Array.isArray(translated[i].missingIngredients)
          ? translated[i].missingIngredients
          : recipe.missingIngredients,
        steps: Array.isArray(translated[i].steps)
          ? translated[i].steps
          : recipe.steps,
      }))
    }
  } catch { /* fall through to English fallback */ }

  return englishRecipes.map(r => ({ ...r, translationFailed: true }))
}

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
          const fallback = await fetchFromMealDB(pantry, key)
          if (fallback && fallback.length > 0) {
            localStorage.setItem(STORAGE.RECIPE_CACHE, JSON.stringify({ key: pantryKey(pantry), recipes: fallback }))
            setRecipes(fallback)
            setLoading(false)
            return
          }
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

      const result = parsed.slice(0, 3).map(r => ({ ...r, source: 'gemini' }))
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
                onRegenerate={() => generateRecipes(undefined, true)}
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
