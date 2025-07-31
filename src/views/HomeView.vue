<template>
  <div class="home-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <h1 class="hero-title">Mixology</h1>
      <p class="hero-subtitle">Discover Amazing Cocktails</p>
    </div>

    <!-- Compact Filter Bar -->
    <div v-if="!loading" class="filter-bar">
      <!-- Search Box -->
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Search cocktails..."
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

      <!-- Clear Button -->
      <button @click="clearFilters" class="clear-btn" v-if="hasActiveFilters">
        <span>🗑️</span>
      </button>
    </div>

    <!-- Results Info -->
    <div v-if="!loading" class="results-bar">
      <div class="results-info">
        <span class="results-count">{{ displayedCocktails.length }}</span>
        <span class="results-text">cocktails found</span>
      </div>
      
      <!-- Active Filters Tags -->
      <div class="active-filters" v-if="hasActiveFilters">
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
      </div>
    </div>

    <!-- Cocktail Grid -->
    <div v-if="!loading" class="cocktail-grid">
      <CocktailCard 
        v-for="cocktail in displayedCocktails" 
        :key="cocktail.idDrink"
        :cocktail="cocktail"
        @select-cocktail="viewCocktail"
      />
    </div>

    <!-- No Results -->
    <div v-if="!loading && displayedCocktails.length === 0" class="no-results">
      <div class="no-results-icon">🤷‍♂️</div>
      <h3>No cocktails found</h3>
      <p>Try different search terms or clear your filters</p>
      <button @click="clearFilters" class="clear-all-btn">Clear All Filters</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner">🍸</div>
      <p>Loading delicious cocktails...</p>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CocktailCard from '@/components/CocktailCard.vue'
import { useCocktailStore } from '@/stores/cocktailStore'

export default {
  name: 'HomeView',
  components: {
    CocktailCard
  },
  setup() {
    const router = useRouter()
    const cocktailStore = useCocktailStore()
    
    const cocktails = computed(() => cocktailStore.cocktails)
    const loading = computed(() => cocktailStore.loading)
    const filters = computed(() => cocktailStore.filters)
    const filterOptions = computed(() => cocktailStore.filterOptions)
    const displayedCocktails = computed(() => cocktailStore.filteredCocktails)
    const hasActiveFilters = computed(() => cocktailStore.hasActiveFilters)
    
    const viewCocktail = (cocktail) => {
      router.push({ name: 'cocktail', params: { id: cocktail.idDrink } })
    }
    
    const clearFilters = () => {
      cocktailStore.clearFilters()
    }
    
    onMounted(() => {
      cocktailStore.fetchCocktails()
    })
    
    return {
      cocktails,
      loading,
      filters,
      filterOptions,
      displayedCocktails,
      hasActiveFilters,
      viewCocktail,
      clearFilters
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

/* Hero Section - More Compact */
.hero-section {
  text-align: center;
  margin-bottom: 30px;
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
}

/* Compact Filter Bar */
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
  min-width: 200px;
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

/* Cocktail Grid */
.cocktail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 28px;
  }
  
  .cocktail-grid {
    grid-template-columns: 1fr;
  }
}
</style>