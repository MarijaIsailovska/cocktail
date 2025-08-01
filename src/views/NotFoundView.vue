<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-icon">🍸💔</div>
      <h1 class="not-found-title">Oops! Page Not Found</h1>
      <p class="not-found-message">
        Looks like this cocktail recipe got mixed up! The page you're looking for doesn't exist.
      </p>
      <div class="not-found-actions">
        <router-link to="/" class="home-btn">
          <span class="btn-icon">🏠</span>
          Back to Home
        </router-link>
        <router-link to="/custom-cocktails" class="create-btn">
          <span class="btn-icon">🧪</span>
          Create Custom Cocktail
        </router-link>
      </div>
      
      <!-- Fun 404 message -->
      <div class="fun-message">
        <p>🍹 Error 404: Cocktail not found</p>
        <p>Maybe try our signature Mixology blend instead?</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  mounted() {
    // Optional: Set a custom title for 404 pages
    document.title = '404 - Page Not Found | Mixology'
  }
}
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
}

.not-found-container {
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.not-found-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: shake 2s infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.not-found-title {
  font-family: 'Playfair Display', serif;
  font-size: 48px;
  font-weight: 500;
  color: #f5f5f5;
  margin: 0 0 16px 0;
  letter-spacing: 1px;
}

.not-found-message {
  font-family: 'Inter', sans-serif;
  font-size: 18px;
  color: #888;
  line-height: 1.6;
  margin-bottom: 40px;
}

.not-found-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.home-btn, .create-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-radius: 12px;
  text-decoration: none;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 160px;
  justify-content: center;
}

.home-btn {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: 1px solid rgba(52, 152, 219, 0.3);
}

.home-btn:hover {
  background: linear-gradient(135deg, #2980b9, #1f6391);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.3);
}

.create-btn {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  color: white;
  border: 1px solid rgba(155, 89, 182, 0.3);
}

.create-btn:hover {
  background: linear-gradient(135deg, #8e44ad, #7d3c98);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3);
}

.btn-icon {
  font-size: 18px;
}

.fun-message {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-top: 40px;
}

.fun-message p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
  font-style: italic;
}

.fun-message p:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .not-found-title {
    font-size: 36px;
  }
  
  .not-found-message {
    font-size: 16px;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .home-btn, .create-btn {
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .not-found-view {
    padding: 16px;
  }
  
  .not-found-icon {
    font-size: 60px;
  }
  
  .not-found-title {
    font-size: 28px;
  }
}
</style>