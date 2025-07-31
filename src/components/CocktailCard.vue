<template>
  <div class="cocktail-card" @click="selectCocktail">
    <div class="card-image">
      <img :src="cocktail.strDrinkThumb" :alt="cocktail.strDrink" />
      
      <!-- Favorites Button -->
      <button 
        @click.stop="toggleFavorite" 
        class="favorite-btn"
        :class="{ active: isFavorite }"
      >
        <span class="heart-icon">{{ isFavorite ? '❤️' : '🤍' }}</span>
      </button>
      
      <div class="difficulty-badge" :style="{ backgroundColor: getDifficultyColor() }">
        <span class="difficulty-icon">{{ getDifficultyIcon() }}</span>
        <span class="difficulty-text">{{ getDifficulty().difficulty }}</span>
      </div>
      <div class="card-overlay">
        <span class="view-recipe">View Recipe</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="cocktail-name">{{ cocktail.strDrink }}</h3>
      <div class="cocktail-tags">
        <span class="tag category">{{ cocktail.strCategory }}</span>
        <span class="tag type" :class="cocktail.strAlcoholic.toLowerCase()">
          {{ cocktail.strAlcoholic }}
        </span>
      </div>
      <div class="difficulty-info">
        <span class="ingredient-count">
          📋 {{ getDifficulty().ingredientCount }} ingredients
        </span>
        <span class="difficulty-level" :style="{ color: getDifficultyColor() }">
          {{ getDifficultyIcon() }} {{ getDifficulty().difficulty }}
        </span>
      </div>
      <p v-if="cocktail.strGlass" class="glass-type">
        🥃 {{ cocktail.strGlass }}
      </p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useFavoritesStore } from '../stores/favoritesStore'

export default {
  name: 'CocktailCard',
  props: {
    cocktail: {
      type: Object,
      required: true
    }
  },
  emits: ['select-cocktail'],
  setup(props, { emit }) {
    const favoritesStore = useFavoritesStore()
    
    const isFavorite = computed(() => 
      favoritesStore.favorites.includes(props.cocktail.idDrink)
    )
    
    const selectCocktail = () => {
      emit('select-cocktail', props.cocktail)
    }
    
    const toggleFavorite = () => {
      favoritesStore.toggleFavorite(props.cocktail.idDrink)
    }
    
    // ... keep all your existing methods ...
    const getIngredients = () => {
      const ingredients = []
      for (let i = 1; i <= 15; i++) {
        const ingredient = props.cocktail[`strIngredient${i}`]
        if (ingredient && ingredient.trim()) {
          ingredients.push(ingredient.trim())
        }
      }
      return ingredients
    }
    
    const getDifficulty = () => {
      const ingredients = getIngredients()
      const ingredientCount = ingredients.length
      
      const instructions = props.cocktail.strInstructions?.toLowerCase() || ''
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
          ingredient.toLowerCase().includes(uncommon)
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
    }
    
    const getDifficultyColor = () => {
      const { level } = getDifficulty()
      const colors = {
        1: '#27ae60', // Green - Easy
        2: '#f39c12', // Orange - Medium  
        3: '#e74c3c', // Red - Hard
        4: '#8e44ad'  // Purple - Expert
      }
      return colors[level]
    }
    
    const getDifficultyIcon = () => {
      const { level } = getDifficulty()
      const icons = {
        1: '🟢', // Easy
        2: '🟡', // Medium
        3: '🔴', // Hard
        4: '🟣'  // Expert
      }
      return icons[level]
    }
    
    return {
      isFavorite,
      selectCocktail,
      toggleFavorite,
      getIngredients,
      getDifficulty,
      getDifficultyColor,
      getDifficultyIcon
    }
  }
}
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');

.cocktail-card {
  background: #111111;
  border-radius: 8px;
  border: 1px solid #222;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.cocktail-card:hover {
  border-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.card-image {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  filter: brightness(0.8) contrast(1.1);
}

.cocktail-card:hover .card-image img {
  transform: scale(1.05);
  filter: brightness(0.9) contrast(1.2);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cocktail-card:hover .card-overlay {
  opacity: 1;
}

.view-recipe {
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.view-recipe:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.card-content {
  padding: 20px;
  background: #111111;
}

.cocktail-name {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 12px 0;
  color: #f5f5f5;
  line-height: 1.3;
}

.cocktail-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Inter', sans-serif;
}

.tag.category {
  background: #1a1a1a;
  color: #888;
  border: 1px solid #333;
}

.tag.type.alcoholic {
  background: #2a1a1a;
  color: #a66;
  border: 1px solid #433;
}

.tag.type.non_alcoholic {
  background: #1a2a1a;
  color: #6a6;
  border: 1px solid #343;
}

.glass-type {
  font-size: 12px;
  color: #666;
  margin: 8px 0 0 0;
  font-family: 'Inter', sans-serif;
  font-weight: 300;
}
.favorite-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  z-index: 3;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: rgba(0, 0, 0, 0.95);
  transform: scale(1.1);
}

.favorite-btn.active {
  background: rgba(231, 76, 60, 0.9);
  box-shadow: 0 0 12px rgba(231, 76, 60, 0.4);
}

.favorite-btn.active:hover {
  background: rgba(231, 76, 60, 1);
}
</style>