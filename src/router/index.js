import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CocktailView from '@/views/CocktailView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import MyBarView from '@/views/MyBarView.vue'
import ShoppingListView from '@/views/ShoppingListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Mixology - Discover Amazing Cocktails'
      }
    },
    {
      path: '/cocktail/:id',
      name: 'cocktail',
      component: CocktailView,
      meta: {
        title: 'Cocktail Details - Mixology'
      }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: {
        title: 'My Favorites - Mixology'
      }
    },
    {
      path: '/my-bar',
      name: 'my-bar',
      component: MyBarView,
      meta: {
        title: 'My Bar - Mixology'
      }
    },
    {
      path: '/shopping-list',
      name: 'shopping-list',
      component: ShoppingListView,
      meta: {
        title: 'Shopping List - Mixology'
      }
    },
    {
      // Catch all route - 404 page
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'Page Not Found - Mixology'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when changing routes
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global route guard for page titles
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Mixology'
  next()
})

export default router