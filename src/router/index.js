import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '@/views/WelcomeView.vue'
import AccueilView from '@/views/AccueilView.vue'
import ConnexionView from '@/views/ConnexionView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: WelcomeView },
    { path: '/connexion', component: ConnexionView },
    { path: '/home', component: AccueilView },
    { path: '/calculateur', component: () => import('@/views/CalculateurView.vue') },
  ]
})

export default router