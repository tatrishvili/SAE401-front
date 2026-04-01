<template>
  <div>
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

    <button @click="$emit('prev')">← Retour</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps(['data'])
defineEmits(['prev'])

const loading = ref(true)
const result = ref(null)
const error = ref('')

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
    const url = `https://impactco2.fr/api/v1/transport?km=${props.data.km}&transportations=${props.data.transport}`
    const res = await fetch(url)

    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)

    const json = await res.json()

    // L'API retourne un tableau "data" avec les transports
    // Chaque entrée a un champ "value" en kg CO2e
    const item = json.data?.[0]
    result.value = item ? (item.value / 1000).toFixed(3) : '—'
    // ⚠️ valeur en g CO₂e → diviser par 1000 pour avoir kg
  } catch (e) {
    error.value = 'Impossible de récupérer les données. Réessayez.'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>