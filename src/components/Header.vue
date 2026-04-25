<template>
  <header v-if="$route.name !== 'Welcome' && $route.name !== 'Connexion' && $route.name !== 'Inscription'">
    <img v-if="$route.name !== 'Accueil'" src="../assets/icones/flèche.svg" alt="Retour" @click="$router.back()" />
    <h1>{{ $route.name }}</h1>
  </header>
</template>

<script setup>
</script>