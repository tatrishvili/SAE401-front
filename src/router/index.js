import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '@/views/WelcomeView.vue'
import AccueilView from '@/views/AccueilView.vue'
import ConnexionView from '@/views/ConnexionView.vue'
import ConseilsView from '@/views/ConseilsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: WelcomeView },
    { path: '/connexion', component: ConnexionView },
    { path: '/home', component: AccueilView, name: 'Accueil'},
    { path: '/conseils', component: ConseilsView },
    { path: '/calculateur', component: () => import('@/views/CalculateurView.vue'), name:'Action' },
    { path: '/profil', component: () => import('@/views/ProfilView.vue'), name:'Profil' },
  ]
})

export default router