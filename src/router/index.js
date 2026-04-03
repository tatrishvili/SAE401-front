import { createRouter, createWebHistory } from 'vue-router'

// Lazy-loaded components
const HomeView = () => import('../views/AccueilView.vue')       // <-- fix path
const CalculatorView = () => import('../views/CalculateurView.vue')

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,       // <-- use the lazy-loaded variable
    },
    {
        path: '/calculateur',
        name: 'calculator',
        component: CalculatorView, // <-- use the lazy-loaded variable
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router