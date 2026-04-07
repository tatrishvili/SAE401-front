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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.conseils-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  padding: 48px 16px 40px;
  box-sizing: border-box;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 28px;
}

.back-btn {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #c8d0da;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.back-btn:hover { color: #ffffff; }

.back-btn svg {
  width: 22px;
  height: 22px;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-align: center;
}

/* Accordion */
.accordion {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accordion-item {
  background-color: #2a3242;
  border-radius: 14px;
  overflow: hidden;
  animation: fadeUp 0.4s ease both;
}

.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
}

.accordion-title {
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.accordion-icon {
  width: 20px;
  height: 20px;
  color: #7a8899;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.accordion-icon.rotated {
  transform: rotate(180deg);
}

/* Body */
.accordion-body {
  padding: 0 20px 16px;
}

.conseil-item {
  padding: 12px 0;
}

.conseil-item.not-last {
  border-bottom: 1px solid #3a4555;
}

.conseil-item p {
  margin: 0;
  font-size: 0.85rem;
  color: #9aaabb;
  line-height: 1.6;
}

/* Transition expand */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
  transform-origin: top;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0.95);
}

/* Animation */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>