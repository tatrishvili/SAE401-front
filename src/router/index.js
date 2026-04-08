import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '@/views/WelcomeView.vue'
import AccueilView from '@/views/AccueilView.vue'
import ConnexionView from '@/views/ConnexionView.vue'
import ConseilsView from '@/views/ConseilsView.vue'
import InscriptionView from '@/views/InscriptionView.vue'
import CalculateurView from '@/views/CalculateurView.vue'
import ProfilView from '@/views/ProfilView.vue'
import DashboardView from '@/views/DashboardView.vue'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: WelcomeView },
    { path: '/connexion', component: ConnexionView },
    { path: '/home', component: AccueilView, name: 'Accueil'},
    { path: '/conseils', component: ConseilsView },
    { path: '/inscription', component: InscriptionView },
    { path: '/calculateur', component: CalculateurView, name:'Action' },
    { path: '/profil', component: ProfilView, name:'Profil' },
    { path: '/dashboard', component: DashboardView, name: 'Dashboard' },
  ]
})

export default router