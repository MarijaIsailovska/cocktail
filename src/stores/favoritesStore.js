import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
  // State
  const favorites = ref(JSON.parse(localStorage.getItem('mixology-favorites') || '[]'))
  
  // Getters
  const favoritesCount = computed(() => favorites.value.length)
  
  const isFavorite = computed(() => (cocktailId) => {
    return favorites.value.includes(cocktailId)
  })
  
  // Actions
  function addToFavorites(cocktailId) {
    if (!favorites.value.includes(cocktailId)) {
      favorites.value.push(cocktailId)
      saveFavorites()
      showNotification('Added to favorites! ❤️', 'success')
    }
  }
  
  function removeFromFavorites(cocktailId) {
    const index = favorites.value.indexOf(cocktailId)
    if (index > -1) {
      favorites.value.splice(index, 1)
      saveFavorites()
      showNotification('Removed from favorites', 'info')
    }
  }
  
  function toggleFavorite(cocktailId) {
    if (favorites.value.includes(cocktailId)) {
      removeFromFavorites(cocktailId)
    } else {
      addToFavorites(cocktailId)
    }
  }
  
  function clearAllFavorites() {
  if (favorites.value.length > 0) {
    favorites.value = []
    saveFavorites()
    showNotification('All favorites cleared', 'info')
  }
}
  
  function saveFavorites() {
    localStorage.setItem('mixology-favorites', JSON.stringify(favorites.value))
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
    favorites,
    
    // Getters
    favoritesCount,
    isFavorite,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearAllFavorites
  }
})