<template>
  <footer v-if="showFooter">
    <RouterLink to="/home"
      ><img src="../assets/icones/home.svg" alt="Accueil"
    /></RouterLink>
    <RouterLink to="/calculateur"
      ><img src="../assets/icones/advices.svg" alt="Calculateur"
    /></RouterLink>
    <RouterLink to="/dashboard"
      ><img src="../assets/icones/dashboard.svg" alt="Dashboard"
    /></RouterLink>
    <RouterLink to="/conseils"
      ><img src="../assets/icones/défis.svg" alt="Conseils"
    /></RouterLink>
    <RouterLink to="/profil"
      ><img src="../assets/icones/profil.svg" alt="Profil"
    /></RouterLink>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();
const showFooter = computed(() => route.meta.showFooter !== false);
</script>
