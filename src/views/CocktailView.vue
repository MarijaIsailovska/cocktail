<template>
  <div class="cocktail-view">
    <div v-if="cocktail">
      <CocktailDetails 
        :cocktail="cocktail"
        @close="goBack"
      />
    </div>
    <div v-else-if="loading" class="loading">
      Loading cocktail details... 🍸
    </div>
    <div v-else class="error">
      <h2>Cocktail not found</h2>
      <p>This cocktail might be a custom recipe that was deleted or doesn't exist.</p>
      <div class="error-actions">
        <button @click="goBack" class="back-btn">← Back to Home</button>
        <router-link to="/custom-cocktails" class="custom-btn">
          🧪 View Custom Cocktails
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CocktailDetails from '@/components/CocktailDetails.vue'
import { useCocktailStore } from '@/stores/cocktailStore'
import { useCustomCocktailsStore } from '@/stores/customCocktailsStore'

export default {
  name: 'CocktailView',
  components: {
    CocktailDetails
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const cocktailStore = useCocktailStore()
    const customCocktailsStore = useCustomCocktailsStore()
    
    const loading = ref(true)
    const cocktail = ref(null)
    
    const findCocktail = async () => {
      const cocktailId = route.params.id
      
      // First check if it's a custom cocktail (they start with "custom_")
      if (cocktailId.startsWith('custom_')) {
        cocktail.value = customCocktailsStore.customCocktails.find(c => c.idDrink === cocktailId)
        loading.value = false
        return
      }
      
      // If not custom, check API cocktails
      // Wait for cocktails to load if not already loaded
      if (cocktailStore.cocktails.length === 0) {
        await cocktailStore.fetchCocktails()
      }
      
      // Find cocktail by ID in API cocktails
      cocktail.value = cocktailStore.cocktails.find(c => c.idDrink === cocktailId)
      
      // If not found in API, also check custom cocktails (in case ID doesn't start with custom_)
      if (!cocktail.value) {
        cocktail.value = customCocktailsStore.customCocktails.find(c => c.idDrink === cocktailId)
      }
      
      loading.value = false
    }
    
    const goBack = () => {
      // Check if we came from custom cocktails page
      const previousRoute = router.options.history.state?.back
      if (previousRoute && previousRoute.includes('custom-cocktails')) {
        router.push('/custom-cocktails')
      } else {
        router.push('/')
      }
    }
    
    onMounted(() => {
      findCocktail()
    })
    
    return {
      cocktail,
      loading,
      goBack
    }
  }
}
</script>

<style scoped>
.cocktail-view {
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.error h2 {
  color: #f5f5f5;
  margin-bottom: 12px;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
}

.error p {
  color: #888;
  margin-bottom: 32px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.back-btn, .custom-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover, .custom-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.custom-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.custom-btn:hover {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .back-btn, .custom-btn {
    width: 100%;
    max-width: 280px;
    justify-content: center;
  }
}
</style>