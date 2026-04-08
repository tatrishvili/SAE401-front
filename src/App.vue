<template>
  <div id="app">
    <!-- Header component -->
    <Header :t="t" :locale="locale" @change-locale="changeLocale" />

    <!-- Main content -->
    <main class="main">
      <RouterView />
    </main>

    <!-- Footer component -->
    <Footer />
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const { t, locale } = useI18n()

function changeLocale(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<style>
/* Basic styling if needed */
</style>