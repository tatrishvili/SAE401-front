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

      <div v-if="isLoggedIn" class="save-section">
        <button
            @click="handleSave"
            class="btn-save"
            :disabled="saving || saved"
        >
          <span v-if="saving"> Enregistrement...</span>
          <span v-else-if="saved"> Enregistré</span>
          <span v-else> Sauvegarder dans mon profil</span>
        </button>
        <p v-if="saveError" class="error">{{ saveError }}</p>
        <p v-if="saved" class="success">Résultat enregistré avec succès !</p>
      </div>
      <div v-else class="login-prompt">
        <p>
          <router-link to="/connexion">Connectez-vous</router-link>
          pour sauvegarder vos résultats
        </p>
      </div>
    </div>

    <button @click="$emit('prev')" class="btn-back">← Retour</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ km: 0, transportId: null }),
  }
})
defineEmits(['prev'])

const { loading, error, fetchApi } = useApi()
const { isLoggedIn } = useAuth()
const result = ref(null)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

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
    result.value = item?.value ? (item.value / 1000).toFixed(3) : '—'
  } catch (e) {
    // error handled in useApi
  }
})

const handleSave = async () => {
  saving.value = true
  saveError.value = ''

  try {
    await fetchApi('/entries', {
      method: 'POST',
      body: JSON.stringify({
        category: 'transport',
        co2Value: parseFloat(result.value),
        details: {
          transportId: props.data.transportId,
          transportLabel: transportLabel.value,
          km: props.data.km
        }
      })
    })
    saved.value = true
  } catch (e) {
    saveError.value = e.message || 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}
</script>

