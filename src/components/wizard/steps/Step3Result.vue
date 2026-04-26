<template>
  <div class="step3-result">
    <h2>Résultat</h2>

    <div v-if="loading" class="loading">⏳ Calcul en cours...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="result !== null">
      <div class="result-card">
        <p class="result-label">
          {{ data.km }} km en <strong>{{ transportLabel }}</strong>
        </p>
        <p class="result-value">🌍 {{ result }} <span class="unit">kg CO₂e</span></p>
      </div>

      <div v-if="isLoggedIn && !saved" class="save-section">
        <button
            @click="handleSave"
            class="btn-save"
            :disabled="saving"
        >
          <span v-if="saving">⏳ Enregistrement...</span>
          <span v-else>💾 Sauvegarder dans mon profil</span>
        </button>
        <p v-if="saveError" class="error">{{ saveError }}</p>
      </div>

      <div v-if="saved" class="success-navigation">
        <p class="success-msg">✅ Résultat enregistré avec succès !</p>
        <button @click="goToDashboard" class="btn-dashboard">
          Voir mes résultats
        </button>
      </div>

      <div v-if="!isLoggedIn" class="login-prompt">
        <p>
          <router-link to="/connexion">Connectez-vous</router-link>
          pour sauvegarder vos résultats
        </p>
        <button @click="goToDashboard" class="btn-dashboard guest-btn" style="margin-top: 1rem;">
          Continuer sans sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Importation du router
import { useApi } from '@/composables/useApi.js'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ km: 0, transportId: null }),
  }
})

const router = useRouter() // Initialisation
const { loading, error, fetchApi } = useApi()
const { isLoggedIn } = useAuth()

const result = ref(null)
const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const transportLabel = computed(() => {
  const labels = { 2: 'Voiture', 10: 'Train (TGV)', 14: 'Avion', 7: 'Vélo / Marche' }
  return labels[props.data.transportId] ?? `Transport #${props.data.transportId}`
})

// Navigation centralisée
const goToDashboard = () => {
  router.push('/dashboard')
}

onMounted(async () => {
  try {
    const json = await fetchApi(`/transport?km=${props.data.km}&transports=${props.data.transportId}`)
    const item = json.data?.[0] || null
    // Sécurité si l'API retourne une valeur vide ou 0
    result.value = item?.value ? (item.value / 1000).toFixed(3) : '0.000'
  } catch (e) {
    console.error("Erreur calcul:", e)
  }
})

const handleSave = async () => {
  if (saving.value || !result.value) return

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

<style scoped>
/* Tes styles sont conservés, ils fonctionnent parfaitement */
.loading { text-align: center; color: #8792A4; padding: 2rem 0; }
.result-card {
  background-color: #2a3242;
  border-radius: 1.5vh;
  padding: 2rem;
  text-align: center;
  margin: 1.5rem 0;
  border: 1px solid #4E5669;
}
.result-label { color: #8792A4; font-size: 0.95rem; margin-bottom: 1rem; }
.result-label strong { color: #ffffff; }
.result-value { font-size: 2.2rem; font-weight: 800; color: #22c55e; margin: 0; }
.result-value .unit { font-size: 1rem; color: #8792A4; font-weight: 600; }
.success-msg { text-align: center; color: #22c55e; font-weight: 700; margin-bottom: 1rem; }

.btn-save {
  all: unset !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 2vh !important;
  background-color: #22c55e !important;
  color: #ffffff !important;
  border-radius: 2vh !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  text-align: center !important;
  cursor: pointer !important;
  border-bottom: 0.6vh solid #16a34a !important;
}

.btn-dashboard {
  all: unset !important;
  display: block !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding: 2vh !important;
  background-color: #F96750 !important;
  color: #ffffff !important;
  border-radius: 2vh !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  text-align: center !important;
  cursor: pointer !important;
  border-bottom: 0.6vh solid #df4830 !important;
}

.error { color: #F96750; font-size: 0.85rem; text-align: center; margin-top: 0.5rem; }
.login-prompt {
  background-color: #2a3242;
  border: 1px solid #4E5669;
  border-radius: 1.5vh;
  padding: 1rem;
  text-align: center;
  color: #8792A4;
}
.login-prompt a { color: #F96750; font-weight: 700; }
</style>