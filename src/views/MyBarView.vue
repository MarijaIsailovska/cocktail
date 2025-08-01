<template>
  <div class="my-bar-view">
    <!-- Header -->
    <div class="bar-header">
      <h1 class="page-title">
        <span class="title-icon">🏠</span>
        My Bar
      </h1>
      <p class="page-subtitle">Track your cocktail ingredients</p>
    </div>

    <!-- Add Ingredient Section -->
    <div class="add-ingredient-section">
      <h3 class="section-title">Add New Ingredient</h3>
      <form @submit.prevent="addIngredient" class="add-form">
        <div class="form-row">
          <input 
            v-model="newIngredient.name"
            type="text" 
            placeholder="Ingredient name (e.g., Vodka, Lime juice)"
            class="ingredient-input"
            required
          />
          <select v-model="newIngredient.category" class="category-select">
            <option value="">Select Category</option>
            <option v-for="category in ingredientCategories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
          <input 
            v-model="newIngredient.quantity"
            type="text" 
            placeholder="Quantity (optional)"
            class="quantity-input"
          />
          <button type="submit" class="add-btn">
            <span class="add-icon">➕</span>
            Add
          </button>
        </div>
        <textarea 
          v-model="newIngredient.notes"
          placeholder="Notes (brand, expiry date, etc.)"
          class="notes-input"
          rows="2"
        ></textarea>
      </form>
    </div>

    <!-- Stats Bar -->
    <div v-if="inventory.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ inventory.length }}</span>
        <span class="stat-label">ingredients</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ spiritsCount }}</span>
        <span class="stat-label">spirits</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ liqueurCount }}</span>
        <span class="stat-label">liqueurs</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ mixersCount }}</span>
        <span class="stat-label">mixers</span>
      </div>
      <button @click="clearInventory" class="clear-btn">
        <span class="clear-icon">🗑️</span>
        Clear All
      </button>
    </div>

    <!-- Ingredients by Category -->
    <div v-if="inventory.length > 0" class="ingredients-section">
      <div v-for="(ingredients, category) in ingredientsByCategory" :key="category" class="category-group">
        <h3 class="category-title">
          {{ getCategoryIcon(category) }} {{ category }} ({{ ingredients.length }})
        </h3>
        <div class="ingredients-grid">
          <div v-for="ingredient in ingredients" :key="ingredient.id" class="ingredient-card">
            <div class="ingredient-header">
              <h4 class="ingredient-name">{{ ingredient.name }}</h4>
              <button @click="removeIngredient(ingredient.id)" class="remove-btn">✕</button>
            </div>
            <div v-if="ingredient.quantity" class="ingredient-quantity">
              📦 {{ ingredient.quantity }}
            </div>
            <div v-if="ingredient.notes" class="ingredient-notes">
              💭 {{ ingredient.notes }}
            </div>
            <div class="ingredient-date">
              Added {{ formatDate(ingredient.dateAdded) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="inventory.length === 0" class="empty-state">
      <div class="empty-icon">🍾</div>
      <h3 class="empty-title">Your bar is empty</h3>
      <p class="empty-description">
        Start adding ingredients you have at home to track your inventory!
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventoryStore'

export default {
  name: 'MyBarView',
  setup() {
    const inventoryStore = useInventoryStore()
    
    const newIngredient = ref({
      name: '',
      category: '',
      quantity: '',
      notes: ''
    })
    
    const inventory = computed(() => inventoryStore.inventory)
    const ingredientCategories = computed(() => inventoryStore.ingredientCategories)
    
    const ingredientsByCategory = computed(() => {
      const groups = {}
      inventory.value.forEach(ingredient => {
        const category = ingredient.category || 'Other'
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(ingredient)
      })
      return groups
    })
    
    const spiritsCount = computed(() => 
      inventory.value.filter(item => item.category === 'Spirits').length
    )
    
    const liqueurCount = computed(() => 
      inventory.value.filter(item => item.category === 'Liqueurs').length
    )
    
    const mixersCount = computed(() => 
      inventory.value.filter(item => item.category === 'Mixers').length
    )
    
    const addIngredient = () => {
      if (newIngredient.value.name.trim()) {
        inventoryStore.addIngredient({
          name: newIngredient.value.name,
          category: newIngredient.value.category || 'Other',
          quantity: newIngredient.value.quantity,
          notes: newIngredient.value.notes
        })
        
        // Reset form
        newIngredient.value = {
          name: '',
          category: '',
          quantity: '',
          notes: ''
        }
      }
    }
    
    const removeIngredient = (ingredientId) => {
      inventoryStore.removeIngredient(ingredientId)
    }
    
    const clearInventory = () => {
      if (confirm('Are you sure you want to clear your entire bar inventory?')) {
        inventoryStore.clearInventory()
      }
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
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
    
    return {
      newIngredient,
      inventory,
      ingredientCategories,
      ingredientsByCategory,
      spiritsCount,
      liqueurCount,
      mixersCount,
      addIngredient,
      removeIngredient,
      clearInventory,
      getCategoryIcon,
      formatDate
    }
  }
}
</script>

<style scoped>
.my-bar-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.bar-header {
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

/* Add Ingredient Section */
.add-ingredient-section {
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

.add-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}

.ingredient-input, .category-select, .quantity-input, .notes-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px 12px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.ingredient-input:focus, .category-select:focus, .quantity-input:focus, .notes-input:focus {
  outline: none;
  border-color: #3498db;
}

.ingredient-input::placeholder, .quantity-input::placeholder, .notes-input::placeholder {
  color: #666;
}

.category-select option {
  background: #1a1a1a;
  color: #f5f5f5;
}

.add-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.add-btn:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
}

.add-icon {
  font-size: 14px;
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
  color: #27ae60;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-align: center;
}

.clear-btn {
  background: #e74c3c;
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
}

.clear-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

/* Category Groups */
.ingredients-section {
  margin-bottom: 40px;
}

.category-group {
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

.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.ingredient-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.ingredient-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.ingredient-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.ingredient-name {
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  color: #f5f5f5;
  margin: 0;
}

.remove-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 4px;
  color: #e74c3c;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
}

.ingredient-quantity, .ingredient-notes, .ingredient-date {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.ingredient-quantity {
  color: #3498db;
}

.ingredient-notes {
  color: #f39c12;
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
  .my-bar-view {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .ingredients-grid {
    grid-template-columns: 1fr;
  }
}
</style>