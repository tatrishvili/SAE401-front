<template>
  <header>
    <!-- Flèche visible uniquement si on n'est pas sur la page "Accueil" -->
    <img v-if="$route.name !== 'Accueil'" src="../assets/icones/flèche.svg" alt="Retour" @click="$router.back()" />
    <h1>{{ $route.name }}</h1>
  </header>
</template>

<script setup>
</script>