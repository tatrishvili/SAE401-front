<template>
  <header v-if="showHeader">
    <img
      v-if="showBackButton"
      src="../assets/icones/flèche.svg"
      alt="Retour"
      @click="router.back()"
    />
    <h1>{{ pageTitle }}</h1>
  </header>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const showHeader = computed(() => route.meta.showHeader !== false);
const showBackButton = computed(() => route.name !== "Accueil");
const pageTitle = computed(() => route.meta.title || route.name || "");
</script>
