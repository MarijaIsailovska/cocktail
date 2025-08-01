<template>
  <div
    class="cocktail-card"
    :class="{ 'is-favorite': isFavorite, 'is-custom': cocktail.isCustom }"
    @click="selectCocktail"
  >
    <!-- Image Section -->
    <div class="cocktail-image">
      <img
        :src="cocktail.strDrinkThumb || cocktail.image || defaultImage"
        :alt="cocktail.strDrink || cocktail.name"
        @error="handleImageError"
      />

      <!-- Difficulty Badge -->
      

      <!-- Action Buttons Overlay -->
      <div class="action-overlay">
        <button
          @click.stop="toggleFavorite"
          class="action-btn favorite-btn"
          :class="{ active: isFavorite }"
          :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        >
          {{ isFavorite ? '❤️' : '🤍' }}
        </button>

        <button
          @click.stop="addMissingToShoppingList"
          class="action-btn shopping-btn"
          title="Add missing ingredients to shopping list"
        >
          🛒
        </button>
      </div>

      <!-- Custom Badge -->
      <div v-if="cocktail.isCustom" class="custom-badge">
        <span>🧪</span>
        Custom
      </div>

      <!-- Card Overlay -->
      <div class="card-overlay">
        <span class="view-recipe">View Recipe</span>
      </div>
    </div>

    <!-- Content Section -->
    <div class="cocktail-content">
      <h3 class="cocktail-name">{{ cocktail.strDrink || cocktail.name }}</h3>

      <div class="cocktail-tags">
        <span class="tag category-tag">{{ cocktail.strCategory || 'ORDINARY DRINK' }}</span>
        <span class="tag alcoholic-tag">{{ (cocktail.strAlcoholic || 'ALCOHOLIC').toUpperCase() }}</span>
      </div>

      <div class="cocktail-details">
        <div class="detail-item">
          <span class="detail-icon">🧪</span>
          <span class="detail-text">{{ ingredientsCount }} ingredients</span>
        </div>

        <div class="detail-item">
          <span class="detail-icon">🍸</span>
          <span class="detail-text">{{ cocktail.strGlass || 'Cocktail glass' }}</span>
        </div>
      </div>

      <!-- Difficulty Info below content -->
      <div class="difficulty-info">
        <span class="ingredient-count">
          📋 {{ getDifficulty().ingredientCount }} ingredients
        </span>
        <span class="difficulty-level" :style="{ color: getDifficultyColor() }">
          {{ getDifficultyIcon() }} {{ getDifficulty().difficulty }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useShoppingListStore } from "@/stores/shoppingListStore";

export default {
  name: "CocktailCard",
  props: {
    cocktail: {
      type: Object,
      required: true,
    },
  },
  emits: ["select-cocktail"],
  setup(props, { emit }) {
    const favoritesStore = useFavoritesStore();
    const shoppingListStore = useShoppingListStore();
    const getCocktailId = () => props.cocktail.idDrink || props.cocktail.id;
    const defaultImage =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMWExYTFhLCAjMzMzKSIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxNTAiIHI9IjgwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMSkiLz4KPHN2ZyB4PSI5MCIgeT0iOTAiIHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIj4KICA8dGV4dCB4PSI2MCIgeT0iNzAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+NuDwvdGV4dD4KPC9zdmc+Cjwvc3ZnPgo=";

    const isFavorite = computed(() =>
      favoritesStore.favorites.includes(getCocktailId())
    );

    const ingredients = computed(() => {
      const ingredientsList = [];

      // Handle API cocktails (strIngredient1, strIngredient2, etc.)
      if (props.cocktail.strIngredient1) {
        for (let i = 1; i <= 15; i++) {
          const ingredient = props.cocktail[`strIngredient${i}`];
          const measure = props.cocktail[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredientsList.push({
              name: ingredient.trim(),
              measure: measure ? measure.trim() : "",
            });
          }
        }
      }
      // Handle custom cocktails (ingredients array)
      else if (
        props.cocktail.ingredients &&
        Array.isArray(props.cocktail.ingredients)
      ) {
        return props.cocktail.ingredients;
      }

      return ingredientsList;
    });

    const ingredientsCount = computed(() => ingredients.value.length);

    const selectCocktail = () => {
      emit("select-cocktail", props.cocktail);
    };

    const toggleFavorite = () => {
      favoritesStore.toggleFavorite(getCocktailId());
    };

    const addMissingToShoppingList = () => {
      shoppingListStore.addCocktailToShoppingList(props.cocktail);
    };

    const handleImageError = (event) => {
      event.target.src = defaultImage;
    };

    // Difficulty helper methods
    const getDifficulty = () => {
      const ingredients = Object.keys(props.cocktail).filter(
        (key) => key.startsWith("strIngredient") && props.cocktail[key]
      );
      const count = ingredients.length;

      let difficulty = "Unknown";
      if (count <= 3) difficulty = "Easy";
      else if (count <= 6) difficulty = "Medium";
      else difficulty = "Hard";

      return {
        ingredientCount: count,
        difficulty,
      };
    };

    const getDifficultyColor = () => {
      const difficulty = getDifficulty().difficulty;
      if (difficulty === "Easy") return "#b2f2bb";
      if (difficulty === "Medium") return "#ffd43b";
      if (difficulty === "Hard") return "#ff6b6b";
      return "#ccc";
    };

    const getDifficultyIcon = () => {
      const difficulty = getDifficulty().difficulty;
      if (difficulty === "Easy") return "🟢";
      if (difficulty === "Medium") return "🟡";
      if (difficulty === "Hard") return "🔴";
      return "❔";
    };

    return {
      isFavorite,
      ingredientsCount,
      selectCocktail,
      toggleFavorite,
      addMissingToShoppingList,
      handleImageError,
      defaultImage,
      getDifficulty,
      getDifficultyColor,
      getDifficultyIcon,
    };
  },
};
</script>

<style scoped>
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

.cocktail-card.is-favorite {
  border-color: rgba(231, 76, 60, 0.6);
}

.cocktail-card.is-custom {
  border-color: rgba(155, 89, 182, 0.6);
}

.cocktail-image {
  position: relative;
  height: 300px;
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

/* Difficulty Badge */
.difficulty-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #000;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Action Buttons Overlay */
.action-overlay {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cocktail-card:hover .action-overlay {
  opacity: 1;
}

.action-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.favorite-btn.active {
  background: rgba(231, 76, 60, 0.8);
}

.shopping-btn:hover {
  background: rgba(52, 152, 219, 0.8);
}

/* Custom Badge */
.custom-badge {
  position: absolute;
  top: 8px;
  right: 8px;
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

/* Card Overlay */
.card-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  pointer-events: none; /* overlay shouldn't block clicks */
  opacity: 0.85;
}

/* Content Section */
.cocktail-content {
  padding: 16px;
}

.cocktail-name {
  font-family: "Inter", sans-serif;
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

.category-tag {
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
  font-family: "Inter", sans-serif;
}

/* Difficulty Info below content */
.difficulty-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-top: 12px;
  font-weight: 600;
  color: #eee;
}

.ingredient-count {
  display: flex;
  align-items: center;
  gap: 6px;
}

.difficulty-level {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
