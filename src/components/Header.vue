<template>
  <header v-if="showHeader">
    <img
        v-if="!isHome"
        src="../assets/icones/flèche.svg"
        alt="Retour"
        class="retour"
        @click="$router.back()"
    />
    <h1>{{ title }}</h1>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const HIDDEN_ON = ['/', '/connexion', '/inscription']

const showHeader = computed(() => !HIDDEN_ON.includes(route.path))
const isHome = computed(() => route.path === '/home')

const titles = {
  '/home': 'Accueil',
  '/calculateur': 'Calculateur',
  '/dashboard': 'Tableau de bord',
  '/conseils': 'Conseils',
  '/profil': 'Profil',
}
const title = computed(() => titles[route.path] ?? '')
</script>
