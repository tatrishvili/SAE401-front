<template>
  <div class="step step3">
    <h2>Résultat</h2>

    <div v-if="loading">Calcul en cours...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="result !== null">
      <p>
        Pour <strong>{{ data.km }} km</strong> en
        <strong>{{ transportLabel }}</strong> :
      </p>
      <p class="result">🌍 {{ result }} kg CO₂e</p>
    </div>

    <button @click="$emit('prev')" class="suivant">← Retour</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const props = defineProps(['data'])
defineEmits(['prev'])

const { loading, error, fetchApi } = useApi()
const result = ref(null)

const transportLabel = computed(() => {
  const labels = {
    voiturethermique: 'Voiture',
    tgv: 'Train (TGV)',
    avion: 'Avion',
    velo: 'Vélo / Marche',
  }
  return labels[props.data.transport] ?? props.data.transport
})

onMounted(async () => {
  try {
    const json = await fetchApi(
      `/transport?km=${props.data.km}&transportations=${props.data.transport}`
    )
    const item = json.data?.[0]
    result.value = item ? (item.value / 1000).toFixed(3) : '—'
  } catch (e) {
    // error est déjà géré par useApi
  }
})
</script>