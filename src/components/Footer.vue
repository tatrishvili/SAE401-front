<template>
  <footer>
    <RouterLink to="/"><img src="../assets/icones/home.svg" alt=""></RouterLink>
    <RouterLink to="./calculateur"><img src="../assets/icones/advices.svg" alt=""></RouterLink>
    <RouterLink to="/"><img src="../assets/icones/dashboard.svg" alt=""></RouterLink>
    <RouterLink to="/"><img src="../assets/icones/défis.svg" alt=""></RouterLink>
    <RouterLink to="/profil"><img src="../assets/icones/profil.svg" alt=""></RouterLink>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>