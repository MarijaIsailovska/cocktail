import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useShoppingListStore = defineStore('shoppingList', () => {
  // State
  const items = ref([])
  const selectedCocktails = ref([])
  
  // Getters
  const itemsCount = computed(() => items.value.length)
  const itemsByCategory = computed(() => {
    const categories = {}
    items.value.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = []
      }
      categories[item.category].push(item)
    })
    return categories
  })
  const completedItemsCount = computed(() => {
    return items.value.filter(item => item.purchased).length
  })
  
  // Actions
  function addCocktailToShoppingList(cocktail) {
    console.log('Adding cocktail:', cocktail.strDrink)
    
    // Check if cocktail is already selected
    if (selectedCocktails.value.some(c => c.idDrink === cocktail.idDrink)) {
      showNotification('Cocktail already in shopping list', 'warning')
      return
    }
    
    selectedCocktails.value.push(cocktail)
    generateShoppingList()
    showNotification(`Added ${cocktail.strDrink} to shopping list! 📝`, 'success')
  }
  
  function generateShoppingList() {
    console.log('Generating shopping list...')
    items.value = [] // Clear existing items
    
    selectedCocktails.value.forEach(cocktail => {
      // Extract ingredients from cocktail
      for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`]
        const measure = cocktail[`strMeasure${i}`]
        
        if (ingredient && ingredient.trim()) {
          const ingredientName = ingredient.trim()
          
          // Check if ingredient already exists in list
          const existingItem = items.value.find(item => 
            item.name.toLowerCase() === ingredientName.toLowerCase()
          )
          
          if (existingItem) {
            // Add cocktail to existing ingredient's usage
            existingItem.usedIn.push({
              cocktail: cocktail.strDrink,
              measure: measure?.trim() || ''
            })
          } else {
            // Add new ingredient - NO PRICING
            items.value.push({
              id: Date.now() + Math.random(),
              name: ingredientName,
              category: categorizeIngredient(ingredientName),
              usedIn: [{
                cocktail: cocktail.strDrink,
                measure: measure?.trim() || ''
              }],
              purchased: false,
              priority: calculatePriority(ingredientName),
              notes: ''
            })
          }
        }
      }
    })
    
    console.log('Generated items:', items.value)
  }
  
  function categorizeIngredient(ingredient) {
    const name = ingredient.toLowerCase()
    
    // Spirits
    if (name.includes('vodka') || name.includes('gin') || name.includes('rum') || 
        name.includes('whiskey') || name.includes('bourbon') || name.includes('scotch') ||
        name.includes('tequila') || name.includes('brandy') || name.includes('cognac')) {
      return 'Spirits'
    }
    
    // Liqueurs
    if (name.includes('liqueur') || name.includes('schnapps') || name.includes('amaretto') ||
        name.includes('baileys') || name.includes('kahlua') || name.includes('cointreau') ||
        name.includes('grand marnier') || name.includes('triple sec') || name.includes('curacao')) {
      return 'Liqueurs'
    }
    
    // Juices
    if (name.includes('juice') || name.includes('lemon') || name.includes('lime') ||
        name.includes('orange') || name.includes('cranberry') || name.includes('pineapple')) {
      return 'Juices'
    }
    
    // Syrups
    if (name.includes('syrup') || name.includes('grenadine') || name.includes('honey')) {
      return 'Syrups'
    }
    
    // Bitters
    if (name.includes('bitters')) {
      return 'Bitters'
    }
    
    // Mixers
    if (name.includes('soda') || name.includes('tonic') || name.includes('ginger') ||
        name.includes('cola') || name.includes('sprite') || name.includes('club soda')) {
      return 'Mixers'
    }
    
    // Garnishes
    if (name.includes('cherry') || name.includes('olive') || name.includes('mint') ||
        name.includes('salt') || name.includes('sugar') || name.includes('lime wedge')) {
      return 'Garnishes'
    }
    
    return 'Other'
  }

  function calculatePriority(ingredient) {
    const name = ingredient.toLowerCase()
    
    // High priority - essential spirits
    if (name.includes('vodka') || name.includes('gin') || name.includes('rum') || 
        name.includes('whiskey') || name.includes('tequila')||name.includes('wine')) {
      return 5
    }
    
    // Medium-high priority - common liqueurs and juices
    if (name.includes('triple sec') || name.includes('lime juice') || name.includes('lemon juice')) {
      return 4
    }
    
    // Medium priority - other liqueurs and syrups
    if (name.includes('liqueur') || name.includes('syrup')) {
      return 3
    }
    
    // Low-medium priority - mixers
    if (name.includes('soda') || name.includes('tonic') || name.includes('juice')) {
      return 2
    }
    
    // Low priority - garnishes
    return 1
  }
  
  function removeCocktailFromShoppingList(cocktailId) {
    const index = selectedCocktails.value.findIndex(c => c.idDrink === cocktailId)
    if (index > -1) {
      selectedCocktails.value.splice(index, 1)
      generateShoppingList()
      showNotification('Cocktail removed from shopping list', 'info')
    }
  }
  
  function toggleItemPurchased(itemId) {
    const item = items.value.find(i => i.id === itemId)
    if (item) {
      item.purchased = !item.purchased
      if (item.purchased) {
        showNotification(`✅ Purchased ${item.name}`, 'success')
      }
    }
  }
  
  function clearShoppingList() {
    items.value = []
    selectedCocktails.value = []
    showNotification('Shopping list cleared', 'info')
  }
  
  function clearPurchasedItems() {
    items.value = items.value.filter(item => !item.purchased)
    showNotification('Purchased items removed', 'info')
  }
  
  function exportShoppingList() {
    const text = items.value.map(item => `${item.name}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'shopping-list.txt'
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Shopping list exported!', 'success')
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
      max-width: 300px;
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
    }, 4000)
  }
  
  // IMPORTANT: Return ALL functions here!
  return {
    // State
    items,
    selectedCocktails,
    
    // Getters
    itemsCount,
    itemsByCategory,
    completedItemsCount,
    
    // Actions
    addCocktailToShoppingList,
    removeCocktailFromShoppingList,
    toggleItemPurchased,        // ← Make sure this is here!
    clearShoppingList,
    clearPurchasedItems,
    exportShoppingList,
    generateShoppingList
  }
})