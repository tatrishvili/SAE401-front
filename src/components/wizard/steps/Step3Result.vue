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
import { useApi } from '@/composables/useApi.js'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ km: 0, transportId: null }),
  }
})
const emit = defineEmits(['prev', 'reset'])

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
    setTimeout(() => emit('reset', 'Trajet enregistré avec succès !'), 800)
  } catch (e) {
    saveError.value = e.message || 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.save-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.btn-save {
  width: 100%;
  padding: 0.75rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #16a34a;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success {
  color: #16a34a;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.login-prompt {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  text-align: center;
}

.login-prompt a {
  color: #f59e0b;
  font-weight: 600;
  text-decoration: underline;
}
</style>