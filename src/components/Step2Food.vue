<template>
  <div>
    <h2>Quel type de repas ?</h2>

    <div class="choices">
      <button
          v-for="meal in meals"
          :key="meal.id"
          :class="{ selected: local.mealId === meal.id }"
          @click="local.mealId = meal.id"
      >
        {{ meal.icon }} {{ meal.label }}
      </button>
    </div>
    <span class="error" v-if="error">{{ error }}</span>

    <button @click="$emit('prev')">← Retour</button>
    <button @click="handleNext">Calculer →</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps(['data'])
const emit = defineEmits(['next', 'prev'])

// IDs from impactco2.fr /api/v1/alimentation
const meals = [
  { id: 1,  label: 'Repas avec du bœuf',     icon: '🥩' },
  { id: 2,  label: 'Repas avec du poulet',    icon: '🍗' },
  { id: 3,  label: 'Repas végétarien',        icon: '🥗' },
  { id: 4,  label: 'Repas vegan',             icon: '🌱' },
  { id: 5,  label: 'Repas avec du poisson',   icon: '🐟' },
  { id: 6,  label: 'Petit-déjeuner',          icon: '🥐' },
]

const local = reactive({ mealId: props.data.mealId ?? null })
const error = ref('')

const handleNext = () => {
  if (!local.mealId) {
    error.value = 'Veuillez choisir un type de repas'
    return
  }
  error.value = ''
  emit('next', { mealId: local.mealId })
}
</script>

<style scoped>
button.selected {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}
</style>