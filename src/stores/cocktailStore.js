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
    glass: 'all'
  })
  
  // Filter options
  const filterOptions = ref({
    categories: [],
    glasses: [],
    difficulties: ['Easy', 'Medium', 'Hard', 'Expert']
  })

  // Getters
  const filteredCocktails = computed(() => {
    let filtered = [...cocktails.value]
    
    // Search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(cocktail => 
        cocktail.strDrink.toLowerCase().includes(searchTerm) ||
        getIngredientsList(cocktail).some(ingredient => 
          ingredient.toLowerCase().includes(searchTerm)
        )
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
    filters.value.glass !== 'all'
  )

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
    // Get unique categories
    const categories = cocktails.value
      .map(c => c.strCategory)
      .filter(Boolean)
      .map(category => normalizeText(category))
    
    filterOptions.value.categories = [...new Set(categories)].sort()
    
    // Get unique glass types
    const glasses = cocktails.value
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
      glass: 'all'
    }
  }

  // Helper functions
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
    
    if (ingredientCount <= 3) return 'Easy'
    if (ingredientCount <= 5) return 'Medium'
    if (ingredientCount <= 7) return 'Hard'
    return 'Expert'
  }

  return {
    // State
    cocktails,
    loading,
    error,
    filters,
    filterOptions,
    
    // Getters
    filteredCocktails,
    hasActiveFilters,
    
    // Actions
    fetchCocktails,
    clearFilters,
    
    // Helper methods
    getIngredientsList,
    normalizeText,
    getCocktailDifficulty
  }
})