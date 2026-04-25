<template>
  <footer v-if="showFooter">
    <RouterLink to="/home" class="nav-link" active-class="active">
      <img src="../assets/icones/home.svg" alt="Accueil" />
    </RouterLink>
    <RouterLink to="/calculateur" class="nav-link" active-class="active">
      <img src="../assets/icones/advices.svg" alt="Calculateur" />
    </RouterLink>
    <RouterLink to="/dashboard" class="nav-link" active-class="active">
      <img src="../assets/icones/dashboard.svg" alt="Dashboard" />
    </RouterLink>
    <RouterLink to="/conseils" class="nav-link" active-class="active">
      <img src="../assets/icones/défis.svg" alt="Conseils" />
    </RouterLink>
    <RouterLink to="/profil" class="nav-link" active-class="active">
      <img src="../assets/icones/profil.svg" alt="Profil" />
    </RouterLink>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'

const route = useRoute()
const HIDDEN_ON = ['/', '/connexion', '/inscription']
const showFooter = computed(() => !HIDDEN_ON.includes(route.path))
</script>
