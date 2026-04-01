import { createRouter, createWebHistory } from 'vue-router'

// Import des vues (lazy loading)
const HomeView = () => import('../views/Home.vue')
const CalculatorView = () => import('../views/CalculateurView.vue')

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/calculateur',
        name: 'calculator',
        component: CalculatorView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router