<template>
  <div class="conseils-screen">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="title">Conseils</h1>
    </div>

    <!-- Accordion -->
    <div class="accordion">
      <div
        v-for="(category, index) in categories"
        :key="category.title"
        class="accordion-item"
        :style="{ animationDelay: index * 0.07 + 's' }"
      >
        <!-- Header de la catégorie -->
        <button
          class="accordion-header"
          @click="toggle(category.title)"
          :class="{ open: openCategories.includes(category.title) }"
        >
          <span class="accordion-title">{{ category.title }}</span>
          <svg
            class="accordion-icon"
            :class="{ rotated: openCategories.includes(category.title) }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>

        <!-- Contenu déroulant -->
        <transition name="expand">
          <div v-if="openCategories.includes(category.title)" class="accordion-body">
            <div
              v-for="(conseil, i) in category.conseils"
              :key="i"
              class="conseil-item"
              :class="{ 'not-last': i < category.conseils.length - 1 }"
            >
              <p>{{ conseil.text }}</p>
            </div>
          </div>
        </transition>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import conseils from '@/data/conseils-home.json'

const router = useRouter()

// Regrouper les conseils par titre (catégorie)
const categories = computed(() => {
  const map = {}
  for (const conseil of conseils) {
    if (!map[conseil.title]) {
      map[conseil.title] = { title: conseil.title, conseils: [] }
    }
    map[conseil.title].conseils.push(conseil)
  }
  return Object.values(map)
})

// Catégories ouvertes
const openCategories = ref([])

function toggle(title) {
  const idx = openCategories.value.indexOf(title)
  if (idx === -1) {
    openCategories.value.push(title)
  } else {
    openCategories.value.splice(idx, 1)
  }
}
</script>

