// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import WelcomeView from '@/views/WelcomeView.vue'
import AccueilView from '@/views/AccueilView.vue'
import InscriptionView from '@/views/InscriptionView.vue'
import ConnexionView from '@/views/ConnexionView.vue'
import ConseilsView from '@/views/ConseilsView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: WelcomeView,
            meta: { guestOnly: true }
        },
        {
            path: '/connexion',
            component: ConnexionView,
            name: 'Login',
            meta: { guestOnly: true }
        },
        {
            path: '/inscription',
            component: InscriptionView,
            name: 'Register',
            meta: { guestOnly: true }
        },
        {
            path: '/home',
            component: AccueilView,
            name: 'Accueil'
        },
        {
            path: '/conseils',
            component: ConseilsView
        },
        {
            path: '/calculateur',
            component: () => import('@/views/CalculateurView.vue'),
            name: 'Action'
        },
        {
            path: '/profil',
            component: () => import('@/views/ProfilView.vue'),
            name: 'Profil',
            meta: { requiresAuth: true }
        },
        {
            path: '/dashboard',
            component: () => import('@/views/DashboardView.vue'),
            name: 'Dashboard',
            meta: { requiresAuth: true }
        },
    ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('auth_token')
    const isLoggedIn = !!token

    // Redirect to login if route requires auth
    if (to.meta.requiresAuth && !isLoggedIn) {
        next({ name: 'Login' })
        return
    }

    // Redirect to home if logged in and trying to access guest-only routes
    if (to.meta.guestOnly && isLoggedIn) {
        next({ name: 'Accueil' })
        return
    }

    next()
})

export default router