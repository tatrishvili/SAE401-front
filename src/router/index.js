import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
     {
      path: '/',
      name: 'accueil',
      component: () => import('@/views/AccueilView.vue')
    },
    {
      path: '/calculateur',
      name: 'calculateur',
      component: () => import('@/views/CalculateurView.vue')
    }
  ]
})

export default router