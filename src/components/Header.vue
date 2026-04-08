<template>
  <header class="header">
    <!-- Back arrow visible only if not on the Home page -->
    <img
        v-if="$route.name !== 'Accueil'"
        :src="arrowIcon"
        alt="Retour"
        class="back-arrow"
        @click="$router.back()"
    />

    <!-- Page title -->
    <h1>{{ $route.name }}</h1>
  </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import arrowIcon from '../assets/icones/flèche.svg'

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
</style>