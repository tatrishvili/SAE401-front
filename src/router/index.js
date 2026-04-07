import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ChallengesView from '../views/ChallengesView.vue'
import BadgesGallery from '../views/BadgesGallery.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/challenges/:id',
      name: 'challenges',
      component: ChallengesView,
    },
    {
      path: '/badges',
      name: 'badges',
      component: BadgesGallery,
    },
  ],
})

export default router
