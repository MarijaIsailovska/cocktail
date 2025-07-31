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
      <button @click="goBack" class="back-btn">← Back to Home</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CocktailDetails from '@/components/CocktailDetails.vue'
import { useCocktailStore } from '@/stores/cocktailStore'

export default {
  name: 'CocktailView',
  components: {
    CocktailDetails
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const cocktailStore = useCocktailStore()
    
    const loading = ref(true)
    const cocktail = ref(null)
    
    const findCocktail = async () => {
      const cocktailId = route.params.id
      
      // Wait for cocktails to load if not already loaded
      if (cocktailStore.cocktails.length === 0) {
        await cocktailStore.fetchCocktails()
      }
      
      // Find cocktail by ID
      cocktail.value = cocktailStore.cocktails.find(c => c.idDrink === cocktailId)
      loading.value = false
    }
    
    const goBack = () => {
      router.push('/')
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
  margin-bottom: 20px;
}

.back-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}
</style>