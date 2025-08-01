<template>
  <div class="custom-cocktail-form" v-if="isVisible">
    <div class="form-overlay" @click="closeForm"></div>
    <div class="form-container">
      <div class="form-header">
        <h2 class="form-title">
          <span class="form-icon">{{ isEdit ? '✏️' : '🍸' }}</span>
          {{ isEdit ? 'Edit Cocktail' : 'Create Custom Cocktail' }}
        </h2>
        <button @click="closeForm" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="saveCocktail" class="cocktail-form">
        <!-- Basic Info -->
        <div class="form-section">
          <h3 class="section-title">Basic Information</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Cocktail Name *</label>
              <input 
                v-model="formData.name"
                type="text" 
                class="form-input"
                placeholder="e.g., My Special Mojito"
                required
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="formData.category" class="form-select">
                <option value="Custom">Custom</option>
                <option value="Cocktail">Cocktail</option>
                <option value="Shot">Shot</option>
                <option value="Punch / Party Drink">Punch / Party Drink</option>
                <option value="Beer">Beer</option>
                <option value="Coffee / Tea">Coffee / Tea</option>
                <option value="Shake">Shake</option>
                <option value="Other / Unknown">Other / Unknown</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select v-model="formData.alcoholic" class="form-select">
                <option value="Alcoholic">Alcoholic</option>
                <option value="Non alcoholic">Non-Alcoholic</option>
                <option value="Optional alcohol">Optional Alcohol</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">Glass Type</label>
              <select v-model="formData.glass" class="form-select">
                <option value="Cocktail glass">Cocktail glass</option>
                <option value="Old-fashioned glass">Old-fashioned glass</option>
                <option value="Highball glass">Highball glass</option>
                <option value="Collins glass">Collins glass</option>
                <option value="Wine Glass">Wine Glass</option>
                <option value="Shot glass">Shot glass</option>
                <option value="Champagne flute">Champagne flute</option>
                <option value="Margarita/Coupette glass">Margarita/Coupette glass</option>
                <option value="Hurricane glass">Hurricane glass</option>
                <option value="Beer mug">Beer mug</option>
                <option value="Coffee mug">Coffee mug</option>
                <option value="Mason jar">Mason jar</option>
              </select>
            </div>
          </div>

          <!-- Image Upload Section -->
          <div class="form-group">
            <label class="form-label">Cocktail Image</label>
            <div class="image-upload-section">
              <!-- Current/Preview Image -->
              <div v-if="formData.image || imagePreview" class="image-preview">
                <img 
                  :src="imagePreview || formData.image" 
                  :alt="formData.name || 'Cocktail preview'"
                  class="preview-image"
                />
                <button 
                  type="button" 
                  @click="removeImage"
                  class="remove-image-btn"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
              
              <!-- Upload Options -->
              <div class="upload-options">
                <label class="upload-btn">
                  <span class="upload-icon">📷</span>
                  <span class="upload-text">Upload Image</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    @change="handleImageUpload"
                    style="display: none;"
                  />
                </label>
                
                <div class="url-input-group">
                  <input 
                    v-model="imageUrl"
                    type="url" 
                    placeholder="Or paste image URL..."
                    class="url-input"
                    @blur="handleImageUrl"
                  />
                  <button 
                    type="button" 
                    @click="handleImageUrl"
                    class="url-btn"
                    :disabled="!imageUrl"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <p class="upload-help">
                📝 Upload a photo or paste an image URL. Recommended size: 300x300px
              </p>
            </div>
          </div>
        </div>

        <!-- Ingredients -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">Ingredients</h3>
            <button type="button" @click="addIngredient" class="add-ingredient-btn">
              <span class="btn-icon">➕</span>
              Add Ingredient
            </button>
          </div>
          
          <div class="ingredients-list">
            <div 
              v-for="(ingredient, index) in formData.ingredients" 
              :key="index"
              class="ingredient-item"
            >
              <div class="ingredient-fields">
                <input 
                  v-model="ingredient.name"
                  type="text" 
                  class="ingredient-name-input"
                  placeholder="Ingredient name"
                  required
                />
                <input 
                  v-model="ingredient.measure"
                  type="text" 
                  class="ingredient-measure-input"
                  placeholder="Amount (e.g., 2 oz, 1 tsp)"
                />
                <button 
                  type="button" 
                  @click="removeIngredient(index)"
                  class="remove-ingredient-btn"
                  :disabled="formData.ingredients.length <= 1"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="form-section">
          <h3 class="section-title">Instructions</h3>
          <textarea 
            v-model="formData.instructions"
            class="instructions-textarea"
            placeholder="Describe how to make this cocktail step by step..."
            rows="4"
            required
          ></textarea>
        </div>

        <!-- Optional Fields -->
        <div class="form-section">
          <h3 class="section-title">Additional Details</h3>
          
          <div class="form-group">
            <label class="form-label">Tags (comma separated)</label>
            <input 
              v-model="formData.tags"
              type="text" 
              class="form-input"
              placeholder="e.g., refreshing, summer, party"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Personal Notes</label>
            <textarea 
              v-model="formData.notes"
              class="form-textarea"
              placeholder="Your personal notes, tips, or variations..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="closeForm" class="cancel-btn">
            Cancel
          </button>
          <button 
            type="submit" 
            class="save-btn"
            :disabled="!isFormValid"
          >
            <span class="btn-icon">{{ isEdit ? '💾' : '🍸' }}</span>
            {{ isEdit ? 'Update Cocktail' : 'Create Cocktail' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useCustomCocktailsStore } from '@/stores/customCocktailsStore'

export default {
  name: 'CustomCocktailForm',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    editCocktail: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const customCocktailsStore = useCustomCocktailsStore()
    
    const defaultFormData = {
      name: '',
      category: 'Custom',
      alcoholic: 'Alcoholic',
      glass: 'Cocktail glass',
      instructions: '',
      tags: '',
      notes: '',
      image: '',
      ingredients: [
        { name: '', measure: '' }
      ]
    }
    
    const formData = ref({ ...defaultFormData })
    const imagePreview = ref('')
    const imageUrl = ref('')
    
    const isEdit = computed(() => !!props.editCocktail)
    
    const isFormValid = computed(() => {
      return formData.value.name.trim() &&
             formData.value.instructions.trim() &&
             formData.value.ingredients.some(ing => ing.name.trim())
    })
    
    // Watch for edit cocktail changes
    watch(() => props.editCocktail, (cocktail) => {
      if (cocktail) {
        loadCocktailData(cocktail)
      } else {
        resetForm()
      }
    }, { immediate: true })
    
    // Watch for visibility changes
    watch(() => props.isVisible, (visible) => {
      if (visible && !props.editCocktail) {
        resetForm()
      }
    })
    
    function loadCocktailData(cocktail) {
      // Extract ingredients from cocktail
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
      
      formData.value = {
        name: cocktail.strDrink || '',
        category: cocktail.strCategory || 'Custom',
        alcoholic: cocktail.strAlcoholic || 'Alcoholic',
        glass: cocktail.strGlass || 'Cocktail glass',
        instructions: cocktail.strInstructions || '',
        tags: cocktail.strTags || '',
        notes: cocktail.notes || '',
        image: cocktail.strDrinkThumb || '',
        ingredients: ingredients.length > 0 ? ingredients : [{ name: '', measure: '' }]
      }
    }
    
    function resetForm() {
      formData.value = { ...defaultFormData }
      formData.value.ingredients = [{ name: '', measure: '' }]
      imagePreview.value = ''
      imageUrl.value = ''
    }
    
    function handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB')
          return
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file')
          return
        }
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
          formData.value.image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
    
    function handleImageUrl() {
      if (imageUrl.value) {
        // Basic URL validation
        try {
          new URL(imageUrl.value)
          formData.value.image = imageUrl.value
          imagePreview.value = imageUrl.value
          imageUrl.value = ''
        } catch (error) {
          alert('Please enter a valid image URL')
        }
      }
    }
    
    function removeImage() {
      formData.value.image = ''
      imagePreview.value = ''
      imageUrl.value = ''
    }
    
    function addIngredient() {
      formData.value.ingredients.push({ name: '', measure: '' })
    }
    
    function removeIngredient(index) {
      if (formData.value.ingredients.length > 1) {
        formData.value.ingredients.splice(index, 1)
      }
    }
    
    function saveCocktail() {
      if (!isFormValid.value) return
      
      // Filter out empty ingredients
      const validIngredients = formData.value.ingredients.filter(ing => ing.name.trim())
      
      const cocktailData = {
        ...formData.value,
        ingredients: validIngredients
      }
      
      try {
        let savedCocktail
        
        if (isEdit.value) {
          savedCocktail = customCocktailsStore.updateCustomCocktail(
            props.editCocktail.idDrink,
            cocktailData
          )
        } else {
          savedCocktail = customCocktailsStore.createCustomCocktail(cocktailData)
        }
        
        emit('saved', savedCocktail)
        closeForm()
      } catch (error) {
        console.error('Error saving cocktail:', error)
      }
    }
    
    function closeForm() {
      emit('close')
    }
    
    return {
      formData,
      imagePreview,
      imageUrl,
      isEdit,
      isFormValid,
      addIngredient,
      removeIngredient,
      saveCocktail,
      closeForm,
      handleImageUpload,
      handleImageUrl,
      removeImage
    }
  }
}
</script>

<style scoped>
.custom-cocktail-form {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.form-container {
  position: relative;
  background: linear-gradient(145deg, #1a1a1a, #222);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
  padding-bottom: 16px;
}

.form-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  color: #f5f5f5;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-icon {
  font-size: 28px;
}

.close-btn {
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

.close-btn:hover {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
}

.cocktail-form {
  padding: 0 24px 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  color: #f5f5f5;
  margin: 0 0 16px 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.form-input, .form-select, .form-textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #3498db;
  background: rgba(0, 0, 0, 0.6);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: #666;
}

.form-select option {
  background: #1a1a1a;
  color: #f5f5f5;
}

.instructions-textarea {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 100px;
}

.instructions-textarea:focus {
  outline: none;
  border-color: #3498db;
  background: rgba(0, 0, 0, 0.6);
}

.add-ingredient-btn {
  background: linear-gradient(135deg, #27ae60, #229954);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
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

.add-ingredient-btn:hover {
  background: linear-gradient(135deg, #229954, #1e8449);
  transform: translateY(-2px);
}

.ingredients-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ingredient-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.ingredient-fields {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 12px;
  align-items: center;
}

.ingredient-name-input, .ingredient-measure-input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.ingredient-name-input:focus, .ingredient-measure-input:focus {
  outline: none;
  border-color: #3498db;
}

.ingredient-name-input::placeholder, .ingredient-measure-input::placeholder {
  color: #666;
}

.remove-ingredient-btn {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: 6px;
  color: #e74c3c;
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.remove-ingredient-btn:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.6);
}

.remove-ingredient-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn, .save-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #888;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #f5f5f5;
}

.save-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  border: none;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

/* Image Upload Styles */
.image-upload-section {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.image-upload-section:hover {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.02);
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #e74c3c;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.upload-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  width: fit-content;
}

.upload-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 16px;
}

.url-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.url-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 10px 12px;
  color: #f5f5f5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
}

.url-input:focus {
  outline: none;
  border-color: #3498db;
}

.url-input::placeholder {
  color: #666;
}

.url-btn {
  background: #27ae60;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.url-btn:hover:not(:disabled) {
  background: #219a52;
}

.url-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-help {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #666;
  margin: 8px 0 0 0;
  text-align: center;
}
@media (max-width: 768px) {
  .form-container {
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .ingredient-fields {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>