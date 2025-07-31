<template>
  <div id="app">
    <NavigationBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue'

export default {
  name: 'App',
  components: {
    NavigationBar
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  background: #0a0a0a;
  background-image: 
    radial-gradient(circle at 25% 25%, #1a1a1a 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, #151515 0%, transparent 50%);
  padding: 20px;
  color: #e8e8e8;
}

.main-content {
  min-height: calc(100vh - 70px);
}

.app-header {
  text-align: center;
  margin-bottom: 50px;
}

.app-header h1 {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 400;
  margin: 0 0 8px 0;
  color: #f5f5f5;
  letter-spacing: 2px;
}

.app-header p {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 300;
  margin: 0;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.cocktail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  color: #666;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 300;
  margin-top: 100px;
  letter-spacing: 1px;
}
</style>