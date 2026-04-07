<template>
  <div id="app">
    <!-- Header -->
    <Header />

    <!-- Contenu principal -->
    <main>
      <RouterView />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>