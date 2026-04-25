<template>
  <div class="conseils-screen">

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
              :key="conseil.id ?? i"
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
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const { fetchApi } = useApi()

const conseils = ref([])
const openCategories = ref([])

onMounted(async () => {
  try {
    const data = await fetchApi('/tips')
    conseils.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Erreur chargement conseils :', e)
  }
})

const categories = computed(() => {
  const map = {}
  for (const conseil of conseils.value) {
    if (!map[conseil.title]) {
      map[conseil.title] = { title: conseil.title, conseils: [] }
    }
    map[conseil.title].conseils.push(conseil)
  }
  return Object.values(map)
})

function toggle(title) {
  const idx = openCategories.value.indexOf(title)
  if (idx === -1) {
    openCategories.value.push(title)
  } else {
    openCategories.value.splice(idx, 1)
  }
}
</script>

