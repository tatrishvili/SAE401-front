import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/calculateur'   // ← redirige automatiquement vers le wizard
    },
    {
      path: '/calculateur',
      name: 'calculateur',
      component: () => import('@/views/CalculateurView.vue')
    }
  ]
})

export default router