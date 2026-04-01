<template>
  <div>
    <h2>Que souhaitez-vous calculer ?</h2>

    <div class="choices">
      <button
        v-for="cat in categories"
        :key="cat.value"
        :class="{ selected: local.category === cat.value }"
        @click="local.category = cat.value"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>
    <span class="error" v-if="error">{{ error }}</span>

    <button @click="handleNext">Suivant →</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps(['data'])
const emit = defineEmits(['next'])

const categories = [
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'repas',     label: 'Repas',     icon: '🍽️' },
  { value: 'achat',     label: 'Achat',     icon: '🛍️' },
]

const local = reactive({ category: props.data.category ?? null })
const error = ref('')

const handleNext = () => {
  if (!local.category) {
    error.value = 'Veuillez choisir une catégorie'
    return
  }
  error.value = ''
  emit('next', { category: local.category })
}
</script>

<style scoped>
button.selected {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}
</style>