<template>
  <div class="custom-cocktails-view">
    <!-- Header Section -->
    <div class="header-section">
      <h1 class="page-title">My Custom Cocktails</h1>
      <p class="page-subtitle">Create and manage your personal cocktail recipes</p>
      
      <div class="header-actions">
        <button @click="openCreateForm" class="create-btn">
          <span class="btn-icon">🧪</span>
          <span>Create New Cocktail</span>
        </button>
        
        <div class="utility-buttons">
          <button @click="exportCocktails" class="utility-btn export-btn" v-if="customCocktails.length > 0">
            <span class="btn-icon">📥</span>
            Export
          </button>
          
          <label class="utility-btn import-btn">
            <span class="btn-icon">📤</span>
            Import
            <input 
              type="file" 
              accept=".json"
              @change="handleImport"
              style="display: none;"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Stats Bar -->
    <div v-if="customCocktails.length > 0" class="stats-bar">
      <div class="stat-item">
        <span class="stat-number">{{ customCocktails.length }}</span>
        <span class="stat-label">Custom Cocktails</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ alcoholicCount }}</span>
        <span class="stat-label">Alcoholic</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ nonAlcoholicCount }}</span>
        <span class="stat-label">Non-Alcoholic</span>
      </div>
    </div>

    <!-- Custom Cocktails Grid -->
    <div v-if="customCocktails.length > 0" class="cocktails-grid">
      <div 
        v-for="cocktail in customCocktails" 
        :key="cocktail.idDrink"
        class="cocktail-card"
      >
        <div class="cocktail-image">
          <img 
            :src="cocktail.strDrinkThumb || defaultCocktailImage" 
            :alt="cocktail.strDrink"
            @error="handleImageError"
          />
          <div class="cocktail-overlay">
            <button @click="editCocktail(cocktail)" class="overlay-btn edit-btn">
              <span>✏️</span>
              Edit
            </button>
            <button @click="duplicateCocktail(cocktail)" class="overlay-btn duplicate-btn">
              <span>📋</span>
              Copy
            </button>
            <button @click="deleteCocktail(cocktail.idDrink)" class="overlay-btn delete-btn">
              <span>🗑️</span>
              Delete
            </button>
          </div>
          
          <!-- Custom Badge -->
          <div class="custom-badge">
            <span>🧪</span>
            Custom
          </div>
        </div>
        
        <div class="cocktail-info">
          <h3 class="cocktail-name">{{ cocktail.strDrink }}</h3>
          
          <div class="cocktail-tags">
            <span class="tag ordinary-drink">{{ cocktail.strCategory || 'ORDINARY DRINK' }}</span>
            <span class="tag alcoholic-tag">{{ cocktail.strAlcoholic?.toUpperCase() || 'ALCOHOLIC' }}</span>
          </div>
          
          <div class="cocktail-details">
            <div class="detail-item">
              <span class="detail-icon">🧪</span>
              <span class="detail-text">{{ getIngredients(cocktail).length }} ingredients</span>
            </div>
            
            <div class="detail-item">
              <span class="detail-icon">🍸</span>
              <span class="detail-text">{{ cocktail.strGlass || 'Cocktail glass' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-animation">
        <div class="cocktail-glass">🍸</div>
        <div class="plus-icon">➕</div>
      </div>
      <h3>No Custom Cocktails Yet</h3>
      <p>Start creating your own unique cocktail recipes and build your personal collection!</p>
      
      <div class="empty-actions">
        <button @click="openCreateForm" class="create-first-btn">
          <span class="btn-icon">🧪</span>
          Create Your First Cocktail
        </button>
        
        <label class="import-sample-btn">
          <span class="btn-icon">📤</span>
          Import Sample Cocktails
          <input 
            type="file" 
            accept=".json"
            @change="handleImport"
            style="display: none;"
          />
        </label>
      </div>
    </div>

    <!-- Custom Cocktail Form -->
    <CustomCocktailForm
      :is-visible="showForm"
      :edit-cocktail="editingCocktail" 
      @close="closeForm"
      @saved="handleCocktailSaved"
    />

    <!-- Cocktail Details Modal -->
    <div v-if="showDetailsModal" class="details-modal-overlay" @click="closeDetailsModal">
      <div class="details-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedCocktail?.strDrink }}</h2>
          <button @click="closeDetailsModal" class="close-modal-btn">✕</button>
        </div>
        
        <div class="modal-content">
          <div class="modal-image">
            <img :src="selectedCocktail?.strDrinkThumb || defaultCocktailImage" :alt="selectedCocktail?.strDrink" />
          </div>
          
          <div class="modal-info">
            <div class="modal-meta">
              <span class="modal-category">{{ selectedCocktail?.strCategory }}</span>
              <span class="modal-type">{{ selectedCocktail?.strAlcoholic }}</span>
              <span class="modal-glass">{{ selectedCocktail?.strGlass }}</span>
            </div>
            
            <div class="modal-ingredients">
              <h4>Ingredients:</h4>
              <ul>
                <li v-for="ingredient in getIngredients(selectedCocktail)" :key="ingredient.name">
                  <strong>{{ ingredient.measure }}</strong> {{ ingredient.name }}
                </li>
              </ul>
            </div>
            
            <div class="modal-instructions">
              <h4>Instructions:</h4>
              <p>{{ selectedCocktail?.strInstructions }}</p>
            </div>
            
            <div v-if="selectedCocktail?.notes" class="modal-notes">
              <h4>Personal Notes:</h4>
              <p>{{ selectedCocktail.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useCustomCocktailsStore } from '@/stores/customCocktailsStore'
import CustomCocktailForm from '@/components/CustomCocktailForm.vue'

export default {
  name: 'CustomCocktailsView',
  components: {
    CustomCocktailForm
  },
  setup() {
    const customCocktailsStore = useCustomCocktailsStore()
    
    const showForm = ref(false)
    const editingCocktail = ref(null)
    const showDetailsModal = ref(false)
    const selectedCocktail = ref(null)
    
    const customCocktails = computed(() => customCocktailsStore.customCocktails)
    
    const alcoholicCount = computed(() => 
      customCocktails.value.filter(c => c.strAlcoholic === 'Alcoholic').length
    )
    
    const nonAlcoholicCount = computed(() => 
      customCocktails.value.filter(c => c.strAlcoholic === 'Non alcoholic').length
    )
    
    const defaultCocktailImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMWExYTFhLCAjMzMzKSIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjgwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiLz4KPHN2ZyB4PSI5MCIgeT0iOTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIj4KICA8dGV4dCB4PSI2MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+NuDwvdGV4dD4KPC9zdmc+Cjwvc3ZnPgo='
    
    function openCreateForm() {
      editingCocktail.value = null
      showForm.value = true
    }
    
    function editCocktail(cocktail) {
      editingCocktail.value = cocktail
      showForm.value = true
    }
    
    function closeForm() {
      showForm.value = false
      editingCocktail.value = null
    }
    
    function handleCocktailSaved() {
      // Form will close automatically
      // Store will handle the saving and notifications
    }
    
    function deleteCocktail(cocktailId) {
      if (confirm('Are you sure you want to delete this cocktail? This action cannot be undone.')) {
        customCocktailsStore.deleteCustomCocktail(cocktailId)
      }
    }
    
    function duplicateCocktail(cocktail) {
      customCocktailsStore.duplicateCustomCocktail(cocktail.idDrink)
    }
    
    function rateCocktail(cocktailId, rating) {
      customCocktailsStore.rateCocktail(cocktailId, rating)
    }
    
    function viewCocktailDetails(cocktail) {
      selectedCocktail.value = cocktail
      showDetailsModal.value = true
    }
    
    function closeDetailsModal() {
      showDetailsModal.value = false
      selectedCocktail.value = null
    }
    
    function exportCocktails() {
      customCocktailsStore.exportCustomCocktails()
    }
    
    function handleImport(event) {
      const file = event.target.files[0]
      if (file) {
        customCocktailsStore.importCustomCocktails(file)
        .then(count => {
          console.log(`Imported ${count} cocktails`)
        })
        .catch(error => {
          console.error('Import failed:', error)
        })
      }
      // Reset input
      event.target.value = ''
    }
    
    function getIngredients(cocktail) {
      if (!cocktail) return []
      const ingredients = []
      for (let i = 1; i <= 15; i++) {
        const ingredient = cocktail[`strIngredient${i}`]
        const measure = cocktail[`strMeasure${i}`]
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measure: measure ? measure.trim() : ''
          })
        }
      }
      return ingredients
    }
    
    function formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    function handleImageError(event) {
      event.target.src = defaultCocktailImage
    }
    
    return {
      customCocktails,
      alcoholicCount,
      nonAlcoholicCount,
      showForm,
      editingCocktail,
      showDetailsModal,
      selectedCocktail,
      defaultCocktailImage,
      openCreateForm,
      editCocktail,
      closeForm,
      handleCocktailSaved,
      deleteCocktail,
      duplicateCocktail,
      rateCocktail,
      viewCocktailDetails,
      closeDetailsModal,
      exportCocktails,
      handleImport,
      getIngredients,
      formatDate,
      handleImageError
    }
  }
}
</script>

<style scoped>
.custom-cocktails-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Header */
.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  color: #f5f5f5;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3498db, #9b59b6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  color: #888;
  margin-bottom: 30px;
  font-size: 16px;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.create-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
}

.create-btn:hover {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.4);
}

.utility-buttons {
  display: flex;
  gap: 8px;
}

.utility-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px 16px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
}

.utility-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #f5f5f5;
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  font-size: 16px;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 600;
  color: #3498db;
}

.stat-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Cocktails Grid */
.cocktails-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 40px;
}

.cocktail-card {
  background: rgba(45, 45, 45, 0.8);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(70, 70, 70, 0.5);
  transition: all 0.2s ease;
  position: relative;
  cursor: pointer;
}

.cocktail-card:hover {
  background: rgba(55, 55, 55, 0.9);
  border-color: rgba(100, 100, 100, 0.7);
}

.cocktail-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.cocktail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cocktail-card:hover .cocktail-image img {
  transform: scale(1.05);
}

.cocktail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cocktail-card:hover .cocktail-overlay {
  opacity: 1;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.overlay-btn:hover {
  transform: translateY(-2px);
}

.edit-btn {
  color: #3498db;
}

.edit-btn:hover {
  background: #3498db;
  color: white;
}

.duplicate-btn {
  color: #f39c12;
}

.duplicate-btn:hover {
  background: #f39c12;
  color: white;
}

.delete-btn {
  color: #e74c3c;
}

.delete-btn:hover {
  background: #e74c3c;
  color: white;
}

.custom-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cocktail-info {
  padding: 16px;
}

.cocktail-name {
  font-family: 'Inter', sans-serif;
  color: #f5f5f5;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
}

.cocktail-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ordinary-drink {
  background: rgba(100, 100, 100, 0.3);
  color: #ccc;
}

.alcoholic-tag {
  background: rgba(139, 69, 19, 0.4);
  color: #d2b48c;
}

.cocktail-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  font-size: 14px;
  color: #888;
}

.detail-text {
  font-size: 13px;
  color: #ccc;
  font-family: 'Inter', sans-serif;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #888;
}

.empty-animation {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
}

.cocktail-glass {
  font-size: 64px;
  animation: float 3s ease-in-out infinite;
}

.plus-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 24px;
  color: #9b59b6;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

.empty-state h3 {
  font-family: 'Playfair Display', serif;
  color: #f5f5f5;
  margin-bottom: 10px;
  font-size: 24px;
}

.empty-state p {
  margin-bottom: 30px;
  font-size: 16px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.empty-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.create-first-btn, .import-sample-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  border-radius: 12px;
  color: white;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.import-sample-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
}

.create-first-btn:hover {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3);
}

.import-sample-btn:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(39, 174, 96, 0.3);
}

/* Details Modal */
.details-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.details-modal {
  background: linear-gradient(145deg, #1a1a1a, #222);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  padding-bottom: 16px;
}

.modal-header h2 {
  font-family: 'Playfair Display', serif;
  color: #f5f5f5;
  margin: 0;
  font-size: 24px;
}

.close-modal-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 8px;
  color: #e74c3c;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.close-modal-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
}

.modal-content {
  padding: 0 24px 24px;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}

.modal-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.modal-info h4 {
  font-family: 'Inter', sans-serif;
  color: #f5f5f5;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  margin-top: 20px;
}

.modal-info h4:first-child {
  margin-top: 0;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.modal-category, .modal-type, .modal-glass {
  background: rgba(52, 152, 219, 0.2);
  color: #3498db;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.modal-ingredients ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.modal-ingredients li {
  color: #888;
  font-size: 14px;
  margin-bottom: 6px;
  padding-left: 16px;
  position: relative;
}

.modal-ingredients li:before {
  content: '•';
  color: #3498db;
  position: absolute;
  left: 0;
}

.modal-instructions p, .modal-notes p {
  color: #888;
  line-height: 1.6;
  font-size: 14px;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .custom-cocktails-view {
    padding: 16px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-bar {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .cocktails-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .modal-image {
    text-align: center;
  }
  
  .modal-image img {
    width: 150px;
    height: 150px;
  }
  
  .details-modal {
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .create-first-btn, .import-sample-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}
</style>