<template>
  <div class="home-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">Mixology</h1>
      <p class="hero-subtitle">Discover Amazing Cocktails</p>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <router-link to="/custom-cocktails" class="quick-action-btn create-btn">
          <span class="btn-icon">🧪</span>
          <div class="btn-content">
            <span class="btn-title">Create Custom</span>
            <span class="btn-subtitle">Make your own recipes</span>
          </div>
        </router-link>
        
        <button @click="toggleCustomFilter" class="quick-action-btn filter-btn" :class="{ active: filters.showCustomOnly }">
          <span class="btn-icon">{{ filters.showCustomOnly ? '🍸' : '🧪' }}</span>
          <div class="btn-content">
            <span class="btn-title">{{ filters.showCustomOnly ? 'Show All' : 'My Cocktails' }}</span>
            <span class="btn-subtitle">{{ filters.showCustomOnly ? 'View everything' : 'Custom recipes only' }}</span>
          </div>
        </button>

        <button @click="showOnlyCanMake = !showOnlyCanMake" class="quick-action-btn bar-btn" :class="{ active: showOnlyCanMake }">
          <span class="btn-icon">🏠</span>
          <div class="btn-content">
            <span class="btn-title">{{ showOnlyCanMake ? 'Show All' : 'Can Make' }}</span>
            <span class="btn-subtitle">{{ showOnlyCanMake ? 'All cocktails' : 'With your bar' }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Advanced Filter Bar -->
    <div v-if="!loading" class="filter-bar">
      <!-- Search Box -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search cocktails, ingredients, instructions..."
          class="search-input"
        />
      </div>

      <!-- Filter Dropdowns -->
      <select v-model="filters.category" class="filter-select">
        <option value="all">All Categories</option>
        <option v-for="category in filterOptions.categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>

      <select v-model="filters.alcoholic" class="filter-select">
        <option value="all">All Types</option>
        <option value="Alcoholic">Alcoholic</option>
        <option value="Non alcoholic">Non-Alcoholic</option>
      </select>

      <select v-model="filters.difficulty" class="filter-select">
        <option value="all">All Levels</option>
        <option v-for="difficulty in filterOptions.difficulties" :key="difficulty" :value="difficulty">
          {{ difficulty }}
        </option>
      </select>

      <select v-model="filters.glass" class="filter-select">
        <option value="all">All Glasses</option>
        <option v-for="glass in filterOptions.glasses" :key="glass" :value="glass">
          {{ glass }}
        </option>
      </select>

      <!-- Clear Button -->
      <button @click="clearAllFilters" class="clear-btn" v-if="hasActiveFilters || showOnlyCanMake">
        <span>🗑️</span>
      </button>
    </div>

    <!-- Results Info -->
    <div v-if="!loading" class="results-bar">
      <div class="results-info">
        <span class="results-count">{{ finalDisplayedCocktails.length }}</span>
        <span class="results-text">
          {{ filters.showCustomOnly ? 'custom ' : '' }}
          {{ showOnlyCanMake ? 'makeable ' : '' }}
          cocktails found
        </span>
        <span v-if="canMakeCount > 0 && !showOnlyCanMake" class="can-make-info">
          • {{ canMakeCount }} you can make with your bar
        </span>
      </div>
      
      <!-- Active Filters Tags -->
      <div class="active-filters" v-if="hasActiveFilters || showOnlyCanMake">
        <span v-if="showOnlyCanMake" class="filter-tag bar-tag" @click="showOnlyCanMake = false">
          🏠 Can Make ✕
        </span>
        <span v-if="filters.showCustomOnly" class="filter-tag custom-tag" @click="filters.showCustomOnly = false">
          🧪 Custom Only ✕
        </span>
        <span v-if="filters.search" class="filter-tag" @click="filters.search = ''">
          🔍 {{ filters.search }} ✕
        </span>
        <span v-if="filters.category !== 'all'" class="filter-tag" @click="filters.category = 'all'">
          📂 {{ filters.category }} ✕
        </span>
        <span v-if="filters.alcoholic !== 'all'" class="filter-tag" @click="filters.alcoholic = 'all'">
          🍺 {{ filters.alcoholic }} ✕
        </span>
        <span v-if="filters.difficulty !== 'all'" class="filter-tag" @click="filters.difficulty = 'all'">
          ⭐ {{ filters.difficulty }} ✕
        </span>
        <span v-if="filters.glass !== 'all'" class="filter-tag" @click="filters.glass = 'all'">
          🥃 {{ filters.glass }} ✕
        </span>
      </div>
    </div>

    <!-- Cocktail Grid -->
    <div v-if="!loading" class="cocktail-grid">
      <div v-for="cocktail in finalDisplayedCocktails" :key="cocktail.idDrink" class="cocktail-card-wrapper">
        <CocktailCard 
          :cocktail="cocktail"
          @select-cocktail="viewCocktail"
        />
        
        <!-- Action Buttons -->
        <div class="cocktail-actions">
          <button 
            v-if="canMakeCocktail(cocktail).canMake"
            @click="viewCocktail(cocktail)"
            class="action-btn can-make-btn"
            title="You can make this!"
          >
            ✅
          </button>
          <div 
            v-else-if="canMakeCocktail(cocktail).totalCount > 0"
            class="missing-ingredients"
            :title="`Missing ${canMakeCocktail(cocktail).totalCount - canMakeCocktail(cocktail).availableCount} ingredients`"
          >
            {{ canMakeCocktail(cocktail).availableCount }}/{{ canMakeCocktail(cocktail).totalCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="!loading && finalDisplayedCocktails.length === 0" class="no-results">
      <div class="no-results-icon">🤷‍♂️</div>
      <h3>No cocktails found</h3>
      <p v-if="filters.showCustomOnly">
        You haven't created any custom cocktails yet!
        <router-link to="/custom-cocktails" class="create-link">Create your first one</router-link>
      </p>
      <p v-else-if="showOnlyCanMake">
        You can't make any cocktails with your current bar inventory.
        <router-link to="/my-bar" class="bar-link">Add more ingredients</router-link>
      </p>
      <p v-else>Try different search terms or clear your filters</p>
      <button @click="clearAllFilters" class="clear-all-btn">Clear All Filters</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner">🍸</div>
      <p>Loading delicious cocktails...</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CocktailCard from '@/components/CocktailCard.vue'
import { useCocktailStore } from '@/stores/cocktailStore'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'HomeView',
  components: {
    CocktailCard
  },
  setup() {
    const router = useRouter()
    const cocktailStore = useCocktailStore()
    const inventoryStore = useInventoryStore()
    
    const showOnlyCanMake = ref(false)
    
    const cocktails = computed(() => cocktailStore.allCocktails)
    const loading = computed(() => cocktailStore.loading)
    const filters = computed(() => cocktailStore.filters)
    const filterOptions = computed(() => cocktailStore.filterOptions)
    const displayedCocktails = computed(() => cocktailStore.filteredCocktails)
    const hasActiveFilters = computed(() => cocktailStore.hasActiveFilters)
    
    // Final displayed cocktails with "can make" filter
    const finalDisplayedCocktails = computed(() => {
      if (showOnlyCanMake.value) {
        return displayedCocktails.value.filter(cocktail => 
          inventoryStore.canMakeCocktail(cocktail).canMake
        )
      }
      return displayedCocktails.value
    })
    
    // Count of cocktails you can make
    const canMakeCount = computed(() => {
      return displayedCocktails.value.filter(cocktail => 
        inventoryStore.canMakeCocktail(cocktail).canMake
      ).length
    })
    
    const viewCocktail = (cocktail) => {
      router.push({ name: 'cocktail', params: { id: cocktail.idDrink } })
    }
    
    const clearAllFilters = () => {
      cocktailStore.clearFilters()
      showOnlyCanMake.value = false
    }
    
    const toggleCustomFilter = () => {
      cocktailStore.toggleCustomOnlyFilter()
    }
    
    const addToShoppingList = (cocktail) => {
      cocktailStore.addCocktailToShoppingList(cocktail)
    }
    
    const canMakeCocktail = (cocktail) => {
      return inventoryStore.canMakeCocktail(cocktail)
    }
    
    onMounted(async () => {
      await cocktailStore.fetchCocktails()
      // Refresh filter options after loading to include custom cocktails
      cocktailStore.populateFilterOptions()
    })
    
    return {
      cocktails,
      loading,
      filters,
      filterOptions,
      displayedCocktails,
      finalDisplayedCocktails,
      hasActiveFilters,
      showOnlyCanMake,
      canMakeCount,
      viewCocktail,
      clearAllFilters,
      toggleCustomFilter,
      addToShoppingList,
      canMakeCocktail
    }
  }
}
</script>

<style scoped>
.home-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Hero Section */
.hero-section {
  text-align: center;
  margin-bottom: 40px;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 500;
  color: #f5f5f5;
  margin: 0 0 8px 0;
  letter-spacing: 2px;
}

.hero-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 30px;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-family: inherit;
  min-width: 160px;
}

.create-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border: 1px solid rgba(155, 89, 182, 0.3);
}

.create-btn:hover {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3);
}

.filter-btn, .bar-btn {
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-btn:hover, .bar-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f5f5f5;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-color: rgba(52, 152, 219, 0.3);
}

.bar-btn.active {
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border-color: rgba(39, 174, 96, 0.3);
}

.filter-btn.active:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
}

.bar-btn.active:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
}

.btn-icon {
  font-size: 24px;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.btn-subtitle {
  font-size: 11px;
  opacity: 0.8;
  font-weight: 400;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  font-size: 16px;
}

.search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px 10px 35px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  background: rgba(0, 0, 0, 0.5);
}

.search-input::placeholder {
  color: #666;
}

.filter-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:focus {
  outline: none;
  border-color: #3498db;
}

.filter-select option {
  background: #1a1a1a;
  color: #f5f5f5;
}

.clear-btn {
  background: #e74c3c;
  border: none;
  border-radius: 8px;
  padding: 10px 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.clear-btn:hover {
  background: #c0392b;
  transform: scale(1.05);
}

/* Results Bar */
.results-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}

.results-info {
  font-family: 'Inter', sans-serif;
}

.results-count {
  font-size: 20px;
  font-weight: 600;
  color: #3498db;
  margin-right: 8px;
}

.results-text {
  font-size: 14px;
  color: #888;
}

.can-make-info {
  font-size: 12px;
  color: #27ae60;
  font-weight: 500;
}

.active-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 4px 8px;
  border-radius: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tag:hover {
  background: rgba(52, 152, 219, 0.3);
  transform: scale(1.05);
}

.filter-tag.custom-tag {
  background: rgba(155, 89, 182, 0.2);
  color: #9b59b6;
}

.filter-tag.custom-tag:hover {
  background: rgba(155, 89, 182, 0.3);
}

.filter-tag.bar-tag {
  background: rgba(39, 174, 96, 0.2);
  color: #27ae60;
}

.filter-tag.bar-tag:hover {
  background: rgba(39, 174, 96, 0.3);
}

/* Cocktail Grid */
.cocktail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.cocktail-card-wrapper {
  position: relative;
}

.cocktail-actions {
  position: absolute;
  top: 50px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 4;
}

.action-btn {
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.shopping-btn:hover {
  background: rgba(52, 152, 219, 0.9);
  transform: scale(1.1);
}

.can-make-btn {
  background: rgba(39, 174, 96, 0.9);
}

.can-make-btn:hover {
  background: rgba(39, 174, 96, 1);
  transform: scale(1.1);
}

.missing-ingredients {
  background: rgba(243, 156, 18, 0.8);
  border-radius: 16px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-align: center;
  backdrop-filter: blur(4px);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.no-results-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.no-results h3 {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #f5f5f5;
  margin-bottom: 10px;
}

.no-results p {
  font-family: 'Inter', sans-serif;
  margin-bottom: 30px;
  font-size: 16px;
}

.create-link, .bar-link {
  color: #9b59b6;
  text-decoration: none;
  font-weight: 600;
}

.create-link:hover, .bar-link:hover {
  text-decoration: underline;
}

.bar-link {
  color: #27ae60;
}

.clear-all-btn {
  background: #3498db;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

/* Loading */
.loading {
  text-align: center;
  padding: 100px 20px;
  color: #888;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading p {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .home-view {
    padding: 16px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .quick-action-btn {
    min-width: auto;
    width: 100%;
    max-width: 300px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-select {
    min-width: auto;
  }
  
  .results-bar {
    flex-direction: column;
    text-align: center;
  }
  
  .cocktail-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .cocktail-actions {
    top: 40px;
    right: 4px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .cocktail-grid {
    grid-template-columns: 1fr;
  }
}
</style>