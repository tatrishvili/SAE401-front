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
        { path: '/inscription', component: InscriptionView },
        { path: '/home', component: AccueilView, name: 'Accueil', meta: { requiresAuth: true } },
        { path: '/conseils', component: ConseilsView, meta: { requiresAuth: true } },
        { path: '/calculateur', component: CalculateurView, name: 'Action', meta: { requiresAuth: true } },
        { path: '/profil', component: ProfilView, name: 'Profil', meta: { requiresAuth: true } },
        { path: '/dashboard', component: DashboardView, name: 'Dashboard', meta: { requiresAuth: true } },
    ]
})

router.beforeEach((to) => {
    const token = localStorage.getItem('auth_token')
    if (to.meta.requiresAuth && !token) {
        return { path: '/connexion' }
    }
})

export default router
