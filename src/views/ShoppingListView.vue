<template>
  <div class="shopping-list-view">
    <!-- Header -->
    <div class="shopping-header">
      <h1 class="page-title">
        <span class="title-icon">📝</span>
        Shopping List
      </h1>
      <p class="page-subtitle">Generate ingredient lists for cocktails you want to make</p>
    </div>

    <!-- Add Cocktail Section -->
    <div class="add-cocktail-section">
      <h3 class="section-title">Add Cocktails to Shopping List</h3>
      <div class="cocktail-search">
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Search cocktails to add..."
          class="cocktail-search-input"
        />
        <div v-if="filteredCocktails.length > 0 && searchTerm" class="search-results">
          <div 
            v-for="cocktail in filteredCocktails.slice(0, 5)" 
            :key="cocktail.idDrink"
            @click="addCocktailToList(cocktail)"
            class="search-result-item"
          >
            <img :src="cocktail.strDrinkThumb" :alt="cocktail.strDrink" class="result-image" />
            <div class="result-info">
              <div class="result-name">{{ cocktail.strDrink }}</div>
              <div class="result-category">{{ cocktail.strCategory }}</div>
            </div>
            <div class="add-icon">+</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Cocktails -->
    <div v-if="selectedCocktails.length > 0" class="selected-cocktails-section">
      <h3 class="section-title">Selected Cocktails ({{ selectedCocktails.length }})</h3>
      <div class="selected-cocktails-grid">
        <div v-for="cocktail in selectedCocktails" :key="cocktail.idDrink" class="selected-cocktail-card">
          <img :src="cocktail.strDrinkThumb" :alt="cocktail.strDrink" class="cocktail-thumb" />
          <div class="cocktail-info">
            <h4 class="cocktail-name">{{ cocktail.strDrink }}</h4>
            <p class="cocktail-category">{{ cocktail.strCategory }}</p>
          </div>
          <button @click="removeCocktailFromList(cocktail.idDrink)" class="remove-cocktail-btn">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="items.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ items.length }}</span>
        <span class="stat-label">items to buy</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ completedItemsCount }}</span>
        <span class="stat-label">purchased</span>
      </div>
      <div class="action-buttons">
        <button @click="exportShoppingList" class="export-btn">
          📥 Export
        </button>
        <button @click="clearPurchasedItems" class="clear-purchased-btn">
          🗑️ Clear Purchased
        </button>
        <button @click="clearShoppingList" class="clear-all-btn">
          🗑️ Clear All
        </button>
      </div>
    </div>

    <!-- Shopping List Items -->
    <div v-if="items.length > 0" class="shopping-list-section">
      <div v-for="(categoryItems, category) in itemsByCategory" :key="category" class="category-section">
        <h3 class="category-title">
          {{ getCategoryIcon(category) }} {{ category }} ({{ categoryItems.length }})
        </h3>
        <div class="items-grid">
          <div 
            v-for="item in categoryItems" 
            :key="item.id"
            class="shopping-item"
            :class="{ purchased: item.purchased }"
          >
            <div class="item-header">
              <button 
                @click="toggleItemPurchased(item.id)"
                class="checkbox-btn"
                :class="{ checked: item.purchased }"
              >
                {{ item.purchased ? '✅' : '⬜' }}
              </button>
              <h4 class="item-name">{{ item.name }}</h4>
            </div>
            
            <div class="item-usage">
              <strong>Used in:</strong>
              <span v-for="(usage, index) in item.usedIn" :key="index" class="usage-item">
                {{ usage.cocktail }}
                <span v-if="usage.measure" class="usage-measure">({{ usage.measure }})</span>
                <span v-if="index < item.usedIn.length - 1">, </span>
              </span>
            </div>
            
            <div class="item-priority">
              Priority: {{ getPriorityText(item.priority) }}
            </div>
            
            <div v-if="item.notes" class="item-notes">
              💭 {{ item.notes }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="empty-state">
      <div class="empty-icon">🛒</div>
      <h3 class="empty-title">Shopping list is empty</h3>
      <p class="empty-description">
        Search for cocktails above and add them to generate your shopping list!
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useShoppingListStore } from '@/stores/shoppingListStore'
import { useCocktailStore } from '@/stores/cocktailStore'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'ShoppingListView',
  setup() {
    const shoppingListStore = useShoppingListStore()
    const cocktailStore = useCocktailStore()
    const inventoryStore = useInventoryStore()
    
    const searchTerm = ref('')
    
    const items = computed(() => shoppingListStore.items)
    const selectedCocktails = computed(() => shoppingListStore.selectedCocktails)
    const itemsByCategory = computed(() => shoppingListStore.itemsByCategory)
    const completedItemsCount = computed(() => shoppingListStore.completedItemsCount)
    
    const filteredCocktails = computed(() => {
      if (!searchTerm.value || searchTerm.value.length < 2) return []
      
      return cocktailStore.cocktails.filter(cocktail =>
        cocktail.strDrink.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
        !selectedCocktails.value.some(selected => selected.idDrink === cocktail.idDrink)
      )
    })
    
    const addCocktailToList = (cocktail) => {
      shoppingListStore.addCocktailToShoppingList(cocktail)
      searchTerm.value = ''
    }
    
    const removeCocktailFromList = (cocktailId) => {
      shoppingListStore.removeCocktailFromShoppingList(cocktailId)
    }
    
    const toggleItemPurchased = (itemId) => {
      shoppingListStore.toggleItemPurchased(itemId)
    }
    
    const clearShoppingList = () => {
      if (confirm('Are you sure you want to clear the entire shopping list?')) {
        shoppingListStore.clearShoppingList()
      }
    }
    
    const clearPurchasedItems = () => {
      if (confirm('Remove all purchased items from the list?')) {
        shoppingListStore.clearPurchasedItems()
      }
    }
    
    const exportShoppingList = () => {
      shoppingListStore.exportShoppingList()
    }
    
    const getCategoryIcon = (category) => {
      const icons = {
        'Spirits': '🥃',
        'Liqueurs': '🍯',
        'Mixers': '🥤',
        'Juices': '🍊',
        'Syrups': '🍯',
        'Bitters': '💧',
        'Garnishes': '🍋',
        'Tools': '🔧',
        'Other': '📦'
      }
      return icons[category] || '📦'
    }
    
    const getPriorityText = (priority) => {
      const priorities = {
        5: 'Essential',
        4: 'High', 
        3: 'Medium',
        2: 'Low',
        1: 'Optional'
      }
      return priorities[priority] || 'Medium'
    }
    
    onMounted(async () => {
      if (cocktailStore.cocktails.length === 0) {
        await cocktailStore.fetchCocktails()
      }
    })
    
    return {
      searchTerm,
      items,
      selectedCocktails,
      itemsByCategory,
      completedItemsCount,
      filteredCocktails,
      addCocktailToList,
      removeCocktailFromList,
      toggleItemPurchased,
      clearShoppingList,
      clearPurchasedItems,
      exportShoppingList,
      getCategoryIcon,
      getPriorityText
    }
  }
}
</script>

<style scoped>
.shopping-list-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.shopping-header {
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
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Add Cocktail Section */
.add-cocktail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 40px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: #f5f5f5;
  margin-bottom: 16px;
}

.cocktail-search {
  position: relative;
}

.cocktail-search-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
}

.cocktail-search-input:focus {
  outline: none;
  border-color: #3498db;
}

.cocktail-search-input::placeholder {
  color: #666;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  margin-top: 4px;
  z-index: 10;
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.result-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  margin-right: 12px;
}

.result-info {
  flex: 1;
}

.result-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: #f5f5f5;
  margin-bottom: 2px;
}

.result-category {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
}

.add-icon {
  font-size: 20px;
  color: #27ae60;
  font-weight: bold;
}

/* Selected Cocktails */
.selected-cocktails-section {
  margin-bottom: 40px;
}

.selected-cocktails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.selected-cocktail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.selected-cocktail-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.cocktail-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
}

.cocktail-info {
  flex: 1;
}

.cocktail-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: #f5f5f5;
  margin: 0 0 4px 0;
}

.cocktail-category {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  margin: 0;
}

.remove-cocktail-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 4px;
  color: #e74c3c;
  width: 28px;
  height: 28px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.remove-cocktail-btn:hover {
  background: rgba(231, 76, 60, 0.3);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
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
  color: #3498db;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.export-btn, .clear-purchased-btn, .clear-all-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn {
  background: #3498db;
  color: white;
}

.clear-purchased-btn {
  background: #f39c12;
  color: white;
}

.clear-all-btn {
  background: #e74c3c;
  color: white;
}

.export-btn:hover, .clear-purchased-btn:hover, .clear-all-btn:hover {
  transform: translateY(-2px);
}

/* Shopping List Items */
.shopping-list-section {
  margin-bottom: 40px;
}

.category-section {
  margin-bottom: 32px;
}

.category-title {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #f5f5f5;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

.shopping-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.shopping-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.shopping-item.purchased {
  opacity: 0.6;
  background: rgba(39, 174, 96, 0.1);
  border-color: rgba(39, 174, 96, 0.3);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.checkbox-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.checkbox-btn:hover {
  transform: scale(1.2);
}

.item-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: #f5f5f5;
  margin: 0;
  flex: 1;
}

.item-price {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #27ae60;
}

.item-usage, .item-priority, .item-notes {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  margin-bottom: 4px;
}

.item-usage {
  color: #3498db;
}

.usage-item {
  color: #f5f5f5;
}

.usage-measure {
  color: #888;
}

.item-priority {
  color: #f39c12;
}

.item-notes {
  color: #888;
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
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .shopping-list-view {
    padding: 16px;
  }
  
  .stats-bar {
    flex-direction: column;
    text-align: center;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .selected-cocktails-grid, .items-grid {
    grid-template-columns: 1fr;
  }
  
  .item-header {
    flex-wrap: wrap;
  }
}
</style>