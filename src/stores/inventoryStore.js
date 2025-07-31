import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const inventory = ref(JSON.parse(localStorage.getItem('mixology-inventory') || '[]'))
  
  // Getters
  const inventoryCount = computed(() => inventory.value.length)
  
  const hasIngredient = computed(() => (ingredient) => {
    return inventory.value.some(item => 
      item.name.toLowerCase().includes(ingredient.toLowerCase())
    )
  })
  
  // Common ingredient categories
  const ingredientCategories = [
    'Spirits',
    'Liqueurs', 
    'Mixers',
    'Juices',
    'Syrups',
    'Bitters',
    'Garnishes',
    'Tools',
    'Other'
  ]
  
  // Actions
  function addIngredient(ingredientData) {
    const ingredient = {
      id: Date.now().toString(),
      name: ingredientData.name.trim(),
      category: ingredientData.category || 'Other',
      quantity: ingredientData.quantity || '',
      notes: ingredientData.notes || '',
      dateAdded: new Date().toISOString()
    }
    
    // Check if ingredient already exists
    const exists = inventory.value.some(item => 
      item.name.toLowerCase() === ingredient.name.toLowerCase()
    )
    
    if (!exists) {
      inventory.value.push(ingredient)
      saveInventory()
      showNotification(`Added ${ingredient.name} to your bar! 🍸`, 'success')
      return true
    } else {
      showNotification(`${ingredient.name} is already in your bar`, 'warning')
      return false
    }
  }
  
  function removeIngredient(ingredientId) {
    const index = inventory.value.findIndex(item => item.id === ingredientId)
    if (index > -1) {
      const ingredient = inventory.value[index]
      inventory.value.splice(index, 1)
      saveInventory()
      showNotification(`Removed ${ingredient.name} from your bar`, 'info')
    }
  }
  
  function clearInventory() {
    inventory.value = []
    saveInventory()
    showNotification('Inventory cleared', 'info')
  }
  
  function canMakeCocktail(cocktail) {
    // Get cocktail ingredients
    const cocktailIngredients = []
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}`]
      if (ingredient && ingredient.trim()) {
        cocktailIngredients.push(ingredient.trim().toLowerCase())
      }
    }
    
    // Check how many ingredients we have
    const availableIngredients = cocktailIngredients.filter(ingredient =>
      inventory.value.some(item => 
        item.name.toLowerCase().includes(ingredient) ||
        ingredient.includes(item.name.toLowerCase())
      )
    )
    
    return {
      canMake: availableIngredients.length === cocktailIngredients.length,
      availableCount: availableIngredients.length,
      totalCount: cocktailIngredients.length,
      missingIngredients: cocktailIngredients.filter(ingredient =>
        !inventory.value.some(item => 
          item.name.toLowerCase().includes(ingredient) ||
          ingredient.includes(item.name.toLowerCase())
        )
      )
    }
  }
  
  function getCocktailsYouCanMake(cocktails) {
    return cocktails.filter(cocktail => canMakeCocktail(cocktail).canMake)
  }
  
  function saveInventory() {
    localStorage.setItem('mixology-inventory', JSON.stringify(inventory.value))
  }
  
  function showNotification(message, type = 'info') {
    const colors = {
      success: '#27ae60',
      warning: '#f39c12',
      info: '#3498db',
      error: '#e74c3c'
    }
    
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(100%)'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }
  
  return {
    // State
    inventory,
    ingredientCategories,
    
    // Getters
    inventoryCount,
    hasIngredient,
    
    // Actions
    addIngredient,
    removeIngredient,
    clearInventory,
    canMakeCocktail,
    getCocktailsYouCanMake
  }
})