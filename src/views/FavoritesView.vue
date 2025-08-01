<template>
  <div class="favorites-view">
    <!-- Header Section -->
    <div class="favorites-header">
      <h1 class="page-title">
        <span class="title-icon">❤️</span>
        My Favorites
      </h1>
      <p class="page-subtitle">Your saved cocktail recipes</p>
    </div>

    <!-- Stats Bar -->
    <div v-if="favoriteCocktails.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ favoriteCocktails.length }}</span>
        <span class="stat-label">favorite{{ favoriteCocktails.length !== 1 ? 's' : '' }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ alcoholicCount }}</span>
        <span class="stat-label">alcoholic</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ nonAlcoholicCount }}</span>
        <span class="stat-label">non-alcoholic</span>
      </div>
      <button @click="clearAllFavorites" class="clear-all-btn">
        <span class="clear-icon">🗑️</span>
        Clear All
      </button>
    </div>

    <!-- Favorites Grid -->
    <div v-if="favoriteCocktails.length > 0" class="favorites-grid">
      <CocktailCard 
        v-for="cocktail in favoriteCocktails" 
        :key="cocktail.idDrink"
        :cocktail="cocktail"
        @select-cocktail="viewCocktail"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">💔</div>
      <h3 class="empty-title">No favorites yet</h3>
      <p class="empty-description">
        Start exploring cocktails and click the heart icon to save your favorites here!
      </p>
      <router-link to="/" class="browse-btn">
        <span class="browse-icon">🍹</span>
        Browse Cocktails
      </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">❤️</div>
      <p>Loading your favorites...</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CocktailCard from '@/components/CocktailCard.vue'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useCocktailStore } from '@/stores/cocktailStore'

export default {
  name: 'FavoritesView',
  components: {
    CocktailCard
  },
  setup() {
    const router = useRouter()
    const favoritesStore = useFavoritesStore()
    const cocktailStore = useCocktailStore()
    const loading = ref(true)
    
    // Get favorite cocktails by filtering all cocktails
    const favoriteCocktails = computed(() => {
      return cocktailStore.allCocktails.filter(cocktail => 
        favoritesStore.favorites.includes(cocktail.idDrink)
      )
    })
    
    // Statistics
    const alcoholicCount = computed(() => 
      favoriteCocktails.value.filter(c => c.strAlcoholic === 'Alcoholic').length
    )
    
    const nonAlcoholicCount = computed(() => 
      favoriteCocktails.value.filter(c => c.strAlcoholic === 'Non alcoholic').length
    )
    
    const viewCocktail = (cocktail) => {
      router.push({ name: 'cocktail', params: { id: cocktail.idDrink } })
    }
    
    const clearAllFavorites = () => {
      if (confirm('Are you sure you want to clear all favorites?')) {
        favoritesStore.clearAllFavorites()
      }
    }
    
    onMounted(async () => {
      // Make sure cocktails are loaded
      if (cocktailStore.cocktails.length === 0) {
        await cocktailStore.fetchCocktails()
      }
      loading.value = false
    })
    
    return {
      favoriteCocktails,
      alcoholicCount,
      nonAlcoholicCount,
      loading,
      viewCocktail,
      clearAllFavorites
    }
  }
}
</script>

<style scoped>
.favorites-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.favorites-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 500;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 40px;
  animation: heartBeat 2s infinite;
}

@keyframes heartBeat {
  0%, 20%, 40%, 60%, 80%, 100% {
    transform: scale(1);
  }
  10%, 30% {
    transform: scale(1.1);
  }
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 600;
  color: #e74c3c;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.clear-all-btn {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.clear-all-btn:hover {
  background: linear-gradient(135deg, #c0392b, #a93226);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.clear-icon {
  font-size: 14px;
}

/* Favorites Grid */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.7;
}

.empty-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  color: #f5f5f5;
  margin-bottom: 12px;
}

.empty-description {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  margin-bottom: 32px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

.browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 14px;
}

.browse-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.browse-icon {
  font-size: 16px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 20px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.loading-state p {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .favorites-view {
    padding: 16px;
  }
  
  .page-title {
    font-size: 28px;
    flex-direction: column;
    gap: 8px;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 20px;
  }
  
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}
</style>