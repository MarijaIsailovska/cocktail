<template>
  <nav class="navigation-bar">
    <div class="nav-container">
      <!-- Logo -->
      <router-link to="/" class="nav-logo">
        <span class="logo-icon">🍹</span>
        <span class="logo-text">Mixology</span>
      </router-link>
      
      <!-- Desktop Navigation -->
      <div class="nav-links">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Home</span>
        </router-link>
        
        <router-link to="/favorites" class="nav-link" active-class="active">
          <span class="nav-icon">❤️</span>
          <span class="nav-text">Favorites</span>
          <span v-if="favoritesCount > 0" class="nav-badge">{{ favoritesCount }}</span>
        </router-link>
        
        <router-link to="/my-bar" class="nav-link" active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">My Bar</span>
        </router-link>
        
        <router-link to="/shopping-list" class="nav-link" active-class="active">
  <span class="nav-icon">📝</span>
  <span class="nav-text">Shopping List</span>
  <span v-if="shoppingListCount > 0" class="nav-badge">{{ shoppingListCount }}</span>
</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from 'vue'
import { useFavoritesStore } from '../stores/favoritesStore'
import { useShoppingListStore } from '../stores/shoppingListStore'

export default {
  name: 'NavigationBar',
  setup() {
    const favoritesStore = useFavoritesStore()
    const shoppingListStore = useShoppingListStore()
    
    const favoritesCount = computed(() => favoritesStore.favoritesCount)
    const shoppingListCount = computed(() => shoppingListStore.itemsCount)
    
    return {
      favoritesCount,
      shoppingListCount
    }
  }
}
</script>

<style scoped>
/* Add this to your existing styles */

.nav-badge {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  margin-left: 4px;
}

/* Keep all your existing styles... */
</style>
<style scoped>
.navigation-bar {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

/* Logo */
.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #f5f5f5;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-logo:hover {
  color: #3498db;
  transform: scale(1.05);
}

.logo-icon {
  font-size: 28px;
}

/* Desktop Navigation */
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #888;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #f5f5f5;
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.nav-link.active {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.nav-icon {
  font-size: 18px;
}

.nav-badge {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.hamburger-line {
  width: 25px;
  height: 3px;
  background: #f5f5f5;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-line.active:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
}

.hamburger-line.active:nth-child(2) {
  opacity: 0;
}

.hamburger-line.active:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  max-height: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.mobile-nav.active {
  max-height: 300px;
  padding: 20px;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  text-decoration: none;
  color: #888;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .nav-text {
    display: none;
  }
  
  .nav-icon {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 16px;
  }
  
  .logo-text {
    display: none;
  }
}
</style>