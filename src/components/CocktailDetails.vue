<template>
  <div class="cocktail-details" v-if="cocktail">
    <!-- Hero Header -->
    <div class="hero-header">
      <button @click="$emit('close')" class="back-btn">
        <span class="back-icon">←</span>
        Back to Cocktails
      </button>
      
      <div class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor() }">
        <span class="difficulty-icon">{{ getDifficultyIcon() }}</span>
        <span class="difficulty-text">{{ getDifficulty().difficulty }}</span>
      </div>
    </div>
    
    <!-- Main Content -->
    <div class="details-content">
      <!-- Left Side - Image -->
      <div class="image-section">
        <div class="cocktail-image-container">
          <img :src="cocktail.strDrinkThumb" :alt="cocktail.strDrink" class="cocktail-image" />
          <div class="image-overlay">
            <h1 class="cocktail-title">{{ cocktail.strDrink }}</h1>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Information -->
      <div class="info-section">
        <!-- Quick Info Cards -->
        <div class="quick-info">
          <div class="info-card">
            <span class="info-icon">📂</span>
            <div class="info-content">
              <span class="info-label">Category</span>
              <span class="info-value">{{ cocktail.strCategory }}</span>
            </div>
          </div>
          
          <div class="info-card">
            <span class="info-icon">🍺</span>
            <div class="info-content">
              <span class="info-label">Type</span>
              <span class="info-value">{{ cocktail.strAlcoholic }}</span>
            </div>
          </div>
          
          <div class="info-card" v-if="cocktail.strGlass">
            <span class="info-icon">🥃</span>
            <div class="info-content">
              <span class="info-label">Glass</span>
              <span class="info-value">{{ cocktail.strGlass }}</span>
            </div>
          </div>
        </div>
        
        <!-- Ingredients Section -->
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">🧪</span>
            Ingredients
          </h3>
          <div class="ingredients-grid">
            <div 
              v-for="ingredient in getIngredients()" 
              :key="ingredient.name"
              class="ingredient-item"
            >
              <div class="ingredient-name">{{ ingredient.name }}</div>
              <div class="ingredient-measure" v-if="ingredient.measure">{{ ingredient.measure }}</div>
            </div>
          </div>
        </div>
        
        <!-- Instructions Section -->
        <div class="section">
          <h3 class="section-title">
            <span class="section-icon">📝</span>
            Instructions
          </h3>
          <div class="instructions-card">
            <p class="instructions">{{ cocktail.strInstructions }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CocktailDetails',
  props: {
    cocktail: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  methods: {
    getIngredients() {
      const ingredients = []
      
      // TheCocktailDB API returns ingredients as strIngredient1, strIngredient2, etc.
      for (let i = 1; i <= 15; i++) {
        const ingredient = this.cocktail[`strIngredient${i}`]
        const measure = this.cocktail[`strMeasure${i}`]
        
        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measure: measure ? measure.trim() : ''
          })
        }
      }
      
      return ingredients
    },getDifficulty() {
      const ingredients = this.getIngredients()
      const ingredientCount = ingredients.length
      
      const instructions = this.cocktail.strInstructions?.toLowerCase() || ''
      const complexTechniques = [
        'muddle', 'layer', 'float', 'flame', 'rim', 'egg white', 
        'double strain', 'dry shake', 'clarify', 'infuse'
      ]
      
      const hasComplexTechnique = complexTechniques.some(technique => 
        instructions.includes(technique)
      )
      
      const uncommonIngredients = [
        'absinthe', 'chartreuse', 'aperol', 'campari', 'benedictine',
        'maraschino', 'yellow chartreuse', 'green chartreuse', 'fernet'
      ]
      
      const hasUncommonIngredient = ingredients.some(ingredient =>
        uncommonIngredients.some(uncommon => 
          ingredient.name.toLowerCase().includes(uncommon)
        )
      )
      
      let difficulty = 'Easy'
      let level = 1
      
      if (ingredientCount <= 3 && !hasComplexTechnique && !hasUncommonIngredient) {
        difficulty = 'Easy'
        level = 1
      } else if (ingredientCount <= 5 && !hasComplexTechnique) {
        difficulty = 'Medium'
        level = 2
      } else if (ingredientCount <= 7 || hasComplexTechnique || hasUncommonIngredient) {
        difficulty = 'Hard'
        level = 3
      } else {
        difficulty = 'Expert'
        level = 4
      }
      
      return { difficulty, level, ingredientCount }
    },
    
    getDifficultyColor() {
      const { level } = this.getDifficulty()
      const colors = {
        1: '#27ae60', // Green - Easy
        2: '#f39c12', // Orange - Medium  
        3: '#e74c3c', // Red - Hard
        4: '#8e44ad'  // Purple - Expert
      }
      return colors[level]
    },
    
    getDifficultyIcon() {
      const { level } = this.getDifficulty()
      const icons = {
        1: '🟢', // Easy
        2: '🟡', // Medium
        3: '🔴', // Hard
        4: '🟣'  // Expert
      }
      return icons[level]
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');

.cocktail-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #f5f5f5;
}

/* Hero Header */
.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.back-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.back-icon {
  font-size: 16px;
}

.difficulty-badge {
  padding: 8px 16px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.difficulty-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

/* Main Content */
.details-content {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 50px;
  align-items: start;
}

/* Image Section */
.image-section {
  position: sticky;
  top: 20px;
}

.cocktail-image-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.cocktail-image {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 40px 30px 30px;
}

.cocktail-title {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 500;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Quick Info Cards */
.quick-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.info-card {
  background: linear-gradient(145deg, #1a1a1a, #222);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
}

.info-card:hover {
  background: linear-gradient(145deg, #222, #2a2a2a);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.info-icon {
  font-size: 24px;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.info-value {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #f5f5f5;
}

/* Sections */
.section {
  background: linear-gradient(145deg, #111, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 30px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 500;
  color: #f5f5f5;
  margin: 0 0 25px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid rgba(52, 152, 219, 0.3);
  padding-bottom: 15px;
}

.section-icon {
  font-size: 28px;
}

/* Ingredients Grid */
.ingredients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.ingredient-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.ingredient-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(52, 152, 219, 0.3);
  transform: translateY(-2px);
}

.ingredient-name {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #f5f5f5;
  margin-bottom: 4px;
}

.ingredient-measure {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #3498db;
  font-weight: 500;
}

/* Instructions */
.instructions-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 25px;
}

.instructions {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #e8e8e8;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 968px) {
  .details-content {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .image-section {
    position: relative;
  }
  
  .cocktail-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .cocktail-details {
    padding: 16px;
  }
  
  .hero-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .quick-info {
    grid-template-columns: 1fr;
  }
  
  .ingredients-grid {
    grid-template-columns: 1fr;
  }
  
  .section {
    padding: 20px;
  }
}
</style>