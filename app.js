// App State
const state = {
  selectedIngredients: new Set(),
  activeCategory: Object.keys(INGREDIENTS)[0],
  mealPlan: []
};

// DOM References
const categoryTabsEl = document.getElementById('categoryTabs');
const ingredientGridEl = document.getElementById('ingredientGrid');
const selectedBarEl = document.getElementById('selectedBar');
const selectedCountEl = document.getElementById('selectedCount');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const mealPlanEl = document.getElementById('mealPlan');
const resultsSection = document.getElementById('resultsSection');

// Initialize the app
function init() {
  renderCategoryTabs();
  renderIngredients();
  updateSelectedBar();
  generateBtn.addEventListener('click', generateMealPlan);
  clearBtn.addEventListener('click', clearSelection);
}

// Render category tabs
function renderCategoryTabs() {
  categoryTabsEl.innerHTML = Object.keys(INGREDIENTS).map(category => {
    const isActive = category === state.activeCategory ? 'active' : '';
    return `<button class="category-tab ${isActive}" data-category="${category}">${category}</button>`;
  }).join('');

  categoryTabsEl.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.activeCategory = tab.dataset.category;
      renderCategoryTabs();
      renderIngredients();
    });
  });
}

// Render ingredient grid
function renderIngredients() {
  const items = INGREDIENTS[state.activeCategory];
  ingredientGridEl.innerHTML = items.map(item => {
    const isSelected = state.selectedIngredients.has(item) ? 'selected' : '';
    return `<div class="ingredient-item ${isSelected}" data-name="${item}">${item}</div>`;
  }).join('');

  ingredientGridEl.querySelectorAll('.ingredient-item').forEach(el => {
    el.addEventListener('click', () => toggleIngredient(el.dataset.name));
  });
}

// Toggle ingredient selection
function toggleIngredient(name) {
  if (state.selectedIngredients.has(name)) {
    state.selectedIngredients.delete(name);
  } else {
    state.selectedIngredients.add(name);
  }
  renderIngredients();
  updateSelectedBar();
}

// Update selected ingredients bar
function updateSelectedBar() {
  const count = state.selectedIngredients.size;
  selectedCountEl.textContent = count;
  selectedCountEl.style.display = count > 0 ? 'inline-flex' : 'none';
  generateBtn.disabled = count === 0;

  if (count === 0) {
    selectedBarEl.innerHTML = '<span class="selected-empty">Noch keine Lebensmittel ausgewählt...</span>';
    return;
  }

  selectedBarEl.innerHTML = Array.from(state.selectedIngredients).map(item =>
    `<span class="selected-tag">${item}<span class="remove" data-name="${item}">&times;</span></span>`
  ).join('');

  selectedBarEl.querySelectorAll('.remove').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleIngredient(el.dataset.name);
    });
  });
}

// Clear all selections
function clearSelection() {
  state.selectedIngredients.clear();
  renderIngredients();
  updateSelectedBar();
}

// Calculate match score for a recipe
function calculateMatchScore(recipe) {
  const selected = state.selectedIngredients;
  let matchCount = 0;
  recipe.ingredients.forEach(ing => {
    if (selected.has(ing)) matchCount++;
  });
  return {
    matched: matchCount,
    total: recipe.ingredients.length,
    percentage: Math.round((matchCount / recipe.ingredients.length) * 100)
  };
}

// Generate 5-day meal plan
function generateMealPlan() {
  const selected = state.selectedIngredients;
  if (selected.size === 0) return;

  // Score all recipes
  const scored = RECIPES.map(recipe => ({
    ...recipe,
    score: calculateMatchScore(recipe)
  }));

  // Filter recipes with at least one matching ingredient
  const matching = scored.filter(r => r.score.matched > 0);

  // Sort by match percentage (descending), then by total matched count
  matching.sort((a, b) => {
    if (b.score.percentage !== a.score.percentage) {
      return b.score.percentage - a.score.percentage;
    }
    return b.score.matched - a.score.matched;
  });

  if (matching.length === 0) {
    renderNoResults();
    return;
  }

  // Pick top 5 unique recipes (diversify selection)
  const plan = [];
  const usedIndices = new Set();

  // First pass: pick the best matches
  for (const recipe of matching) {
    if (plan.length >= 5) break;
    plan.push(recipe);
    usedIndices.add(RECIPES.indexOf(recipe));
  }

  // If we don't have 5, fill with remaining recipes randomly
  if (plan.length < 5) {
    const remaining = scored.filter((_, i) => !usedIndices.has(i));
    // Shuffle remaining
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    for (const recipe of remaining) {
      if (plan.length >= 5) break;
      plan.push(recipe);
    }
  }

  state.mealPlan = plan;
  renderMealPlan();
}

// Render the meal plan
function renderMealPlan() {
  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
  resultsSection.style.display = 'block';

  const cardsHtml = state.mealPlan.map((recipe, i) => {
    const score = recipe.score;
    const barClass = score.percentage >= 70 ? 'high' : score.percentage >= 40 ? 'medium' : 'low';

    const ingredientChips = recipe.ingredients.map(ing => {
      const cssClass = state.selectedIngredients.has(ing) ? 'available' : 'missing';
      return `<span class="ingredient-chip ${cssClass}">${ing}</span>`;
    }).join('');

    const spiceChips = recipe.spices.map(s =>
      `<span class="spice-chip">${s}</span>`
    ).join('');

    return `
      <div class="day-card">
        <div class="day-header">
          <span>${days[i]}</span>
          <span class="difficulty">${recipe.difficulty}</span>
        </div>
        <div class="day-body">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-description">${recipe.description}</div>
          <div class="match-score">
            <span class="match-label">${score.percentage}%</span>
            <div class="match-bar-bg">
              <div class="match-bar-fill ${barClass}" style="width: ${score.percentage}%"></div>
            </div>
            <span style="font-size:0.8rem;color:#888">${score.matched}/${score.total} Zutaten vorhanden</span>
          </div>
          <div class="recipe-section-label">Zutaten</div>
          <div class="ingredient-list">${ingredientChips}</div>
          <div class="recipe-section-label">Empfohlene Gewürze</div>
          <div class="spice-list">${spiceChips}</div>
        </div>
      </div>
    `;
  }).join('');

  // Collect missing ingredients and all spices
  const allMissing = new Set();
  const allSpices = new Set();
  state.mealPlan.forEach(recipe => {
    recipe.ingredients.forEach(ing => {
      if (!state.selectedIngredients.has(ing)) allMissing.add(ing);
    });
    recipe.spices.forEach(s => allSpices.add(s));
  });

  const shoppingHtml = `
    <div class="section shopping-section">
      <h3 class="section-title"><span class="icon">🛒</span> Einkaufsliste</h3>
      <div class="shopping-columns">
        <div class="shopping-column">
          <h4>Fehlende Zutaten (${allMissing.size})</h4>
          <ul>${Array.from(allMissing).map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="shopping-column">
          <h4>Benötigte Gewürze (${allSpices.size})</h4>
          <ul>${Array.from(allSpices).map(s => `<li>${s}</li>`).join('')}</ul>
        </div>
      </div>
    </div>
  `;

  mealPlanEl.innerHTML = `
    <div class="meal-plan">${cardsHtml}</div>
    ${shoppingHtml}
  `;

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Render no results state
function renderNoResults() {
  resultsSection.style.display = 'block';
  mealPlanEl.innerHTML = `
    <div class="no-results">
      <div class="icon">🍳</div>
      <p>Keine passenden Rezepte gefunden.<br>Versuche es mit anderen Lebensmitteln!</p>
    </div>
  `;
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
