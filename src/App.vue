<template>
  <div id="app">
    <RouterLink to="/calculateur">Calculer mon empreinte</RouterLink>
    <RouterLink to="/">Home</RouterLink>
    <RouterView />
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
</style>