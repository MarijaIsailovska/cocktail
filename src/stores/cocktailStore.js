import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCocktailStore = defineStore('cocktails', () => {
  // State
  const cocktails = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Filters
  const filters = ref({
    search: '',
    category: 'all',
    alcoholic: 'all',
    difficulty: 'all',
    glass: 'all',
    showCustomOnly: false
  })
  
  // Filter options
  const filterOptions = ref({
    categories: [],
    glasses: [],
    difficulties: ['Easy', 'Medium', 'Hard', 'Expert']
  })

  // Getters - Combined API + Custom cocktails
  const allCocktails = computed(() => {
    // Import custom cocktails store dynamically to avoid circular dependency
    const customCocktails = getCustomCocktails()
    return [...cocktails.value, ...customCocktails]
  })

  const filteredCocktails = computed(() => {
    let filtered = [...allCocktails.value]
    
    // Show only custom cocktails filter
    if (filters.value.showCustomOnly) {
      filtered = filtered.filter(cocktail => cocktail.isCustom)
    }
    
    // Search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(cocktail => 
        cocktail.strDrink.toLowerCase().includes(searchTerm) ||
        getIngredientsList(cocktail).some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        ) ||
        (cocktail.strInstructions && cocktail.strInstructions.toLowerCase().includes(searchTerm)) ||
        (cocktail.strTags && cocktail.strTags.toLowerCase().includes(searchTerm)) ||
        (cocktail.notes && cocktail.notes.toLowerCase().includes(searchTerm))
      )
    }
    
    // Category filter
    if (filters.value.category !== 'all') {
      filtered = filtered.filter(cocktail => 
        normalizeText(cocktail.strCategory) === filters.value.category
      )
    }
    
    // Alcoholic filter
    if (filters.value.alcoholic !== 'all') {
      filtered = filtered.filter(cocktail => 
        cocktail.strAlcoholic === filters.value.alcoholic
      )
    }
    
    // Glass filter
    if (filters.value.glass !== 'all') {
      filtered = filtered.filter(cocktail => 
        normalizeText(cocktail.strGlass) === filters.value.glass
      )
    }
    
    // Difficulty filter
    if (filters.value.difficulty !== 'all') {
      filtered = filtered.filter(cocktail => {
        const difficulty = getCocktailDifficulty(cocktail)
        return difficulty === filters.value.difficulty
      })
    }
    
    return filtered
  })

  const hasActiveFilters = computed(() => 
    filters.value.search !== '' ||
    filters.value.category !== 'all' ||
    filters.value.alcoholic !== 'all' ||
    filters.value.difficulty !== 'all' ||
    filters.value.glass !== 'all' ||
    filters.value.showCustomOnly
  )

  // Get a single cocktail by ID (API or custom)
  const getCocktailById = computed(() => (id) => {
    return allCocktails.value.find(cocktail => cocktail.idDrink === id)
  })

  // Get cocktails you can make with your bar inventory
  const getCocktailsYouCanMake = computed(() => {
    try {
      const { useInventoryStore } = require('./inventoryStore')
      const inventoryStore = useInventoryStore()
      return inventoryStore.getCocktailsYouCanMake(allCocktails.value)
    } catch (error) {
      return []
    }
  })

  // Actions
  async function fetchCocktails() {
    if (cocktails.value.length > 0) return // Don't fetch if already loaded
    
    try {
      loading.value = true
      error.value = null
      
      const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
      const allCocktails = []
      
      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i]
        
        const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?f=${letter}`)
        const data = await response.json()
        
        if (data.drinks) {
          allCocktails.push(...data.drinks)
        }
        
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Remove duplicates and sort
      const uniqueCocktails = allCocktails.filter((cocktail, index, self) => 
        index === self.findIndex(c => c.idDrink === cocktail.idDrink)
      )
      
      cocktails.value = uniqueCocktails.sort((a, b) => 
        a.strDrink.localeCompare(b.strDrink)
      )
      
      populateFilterOptions()
      
    } catch (err) {
      error.value = 'Failed to load cocktails. Please try again.'
      console.error('Error fetching cocktails:', err)
    } finally {
      loading.value = false
    }
  }

  function populateFilterOptions() {
    // Get unique categories from both API and custom cocktails
    const categories = allCocktails.value
      .map(c => c.strCategory)
      .filter(Boolean)
      .map(category => normalizeText(category))
    
    filterOptions.value.categories = [...new Set(categories)].sort()
    
    // Get unique glass types
    const glasses = allCocktails.value
      .map(c => c.strGlass)
      .filter(Boolean)
      .map(glass => normalizeText(glass))
    
    filterOptions.value.glasses = [...new Set(glasses)].sort()
  }

  function clearFilters() {
    filters.value = {
      search: '',
      category: 'all',
      alcoholic: 'all',
      difficulty: 'all',
      glass: 'all',
      showCustomOnly: false
    }
  }

  function toggleCustomOnlyFilter() {
    filters.value.showCustomOnly = !filters.value.showCustomOnly
  }

  function addCocktailToShoppingList(cocktail) {
    try {
      const { useShoppingListStore } = require('./shoppingListStore')
      const shoppingListStore = useShoppingListStore()
      shoppingListStore.addCocktailToShoppingList(cocktail)
    } catch (error) {
      console.error('Shopping list store not available:', error)
    }
  }

  // Helper functions
  function getCustomCocktails() {
    try {
      const customCocktailsData = localStorage.getItem('mixology-custom-cocktails')
      return customCocktailsData ? JSON.parse(customCocktailsData) : []
    } catch (error) {
      console.error('Error loading custom cocktails:', error)
      return []
    }
  }

  function getIngredientsList(cocktail) {
    const ingredients = []
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`]
      if (ingredient && ingredient.trim()) {
        ingredients.push(ingredient.trim())
      }
    }
    return ingredients
  }

  function normalizeText(text) {
    if (!text) return text
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  function getCocktailDifficulty(cocktail) {
    const ingredients = getIngredientsList(cocktail)
    const ingredientCount = ingredients.length
    
    const instructions = cocktail.strInstructions?.toLowerCase() || ''
    const complexTechniques = [
      'muddle', 'layer', 'float', 'flame', 'rim', 'egg white', 
      'double strain', 'dry shake', 'clarify', 'infuse'
    ]
    
    const hasComplexTechnique = complexTechniques.some(technique => 
      instructions.includes(technique)
    )
    
    const uncommonIngredients = [
      'absinthe', 'chartreuse', 'aperol', 'campari', 'benedictine',
      'maraschino', 'yellow chartreuse', 'green chartreuse', 'fernet'
    ]
    
    const hasUncommonIngredient = ingredients.some(ingredient =>
      uncommonIngredients.some(uncommon => 
        ingredient.toLowerCase().includes(uncommon)
      )
    )
    
    let difficulty = 'Easy'
    
    if (ingredientCount <= 3 && !hasComplexTechnique && !hasUncommonIngredient) {
      difficulty = 'Easy'
    } else if (ingredientCount <= 5 && !hasComplexTechnique) {
      difficulty = 'Medium'
    } else if (ingredientCount <= 7 || hasComplexTechnique || hasUncommonIngredient) {
      difficulty = 'Hard'
    } else {
      difficulty = 'Expert'
    }
    
    return difficulty
  }

  return {
    // State
    cocktails,
    loading,
    error,
    filters,
    filterOptions,
    
    // Getters
    allCocktails,
    filteredCocktails,
    hasActiveFilters,
    getCocktailById,
    getCocktailsYouCanMake,
    
    // Actions
    fetchCocktails,
    clearFilters,
    toggleCustomOnlyFilter,
    addCocktailToShoppingList,
    populateFilterOptions,
    
    // Helper methods
    getIngredientsList,
    normalizeText,
    getCocktailDifficulty
  }
})