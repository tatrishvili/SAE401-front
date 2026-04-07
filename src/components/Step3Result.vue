<template>
  <div class="step3-result">
    <h2>Résultat</h2>

    <div v-if="loading">⏳ Calcul en cours...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="result !== null">
      <p>
        Pour <strong>{{ data.km }} km</strong> en
        <strong>{{ transportLabel }}</strong> :
      </p>
      <p class="result">🌍 {{ result }} kg CO₂e</p>
    </div>

    <button @click="$emit('prev')" class="btn-back">← Retour</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/UseApi'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ km: 0, transportId: null }),
  }
})
defineEmits(['prev'])

const { loading, error, fetchApi } = useApi()
const result = ref(null)

// Map numeric IDs to readable labels
const transportLabel = computed(() => {
  const labels = {
    2:  'Voiture',
    10: 'Train (TGV)',
    14: 'Avion',
    7:  'Vélo / Marche',
  }
  return labels[props.data.transportId] ?? `Transport #${props.data.transportId}`
})

onMounted(async () => {
  try {
    const json = await fetchApi(
        `/transport?km=${props.data.km}&transports=${props.data.transportId}`
    )
    const item = json.data?.[0] || null
    // API returns value in grams → convert to kg
    result.value = item?.value ? (item.value / 1000).toFixed(3) : '—'
  } catch (e) {
    // error is handled in useApi
  }
})
</script>

<style scoped>
</style>