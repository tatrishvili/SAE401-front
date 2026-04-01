<template>
  <div id="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1> {{ t('app.title') }}</h1>

        <nav class="nav">
          <RouterLink to="/">{{ t('nav.home') }}</RouterLink>
          <RouterLink to="/calculateur">{{ t('nav.calculator') }}</RouterLink>
          <RouterLink to="/historique">{{ t('nav.history') }}</RouterLink>
        </nav>

        <div class="language-selector">
          <button @click="changeLocale('fr')" :class="{ active: locale === 'fr' }">
             FR
          </button>
          <button @click="changeLocale('en')" :class="{ active: locale === 'en' }">
            EN
          </button>
        </div>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

function changeLocale(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>

<style>

</style>