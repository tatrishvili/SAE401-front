<template>
  <div class="step3-result">
    <h2>Résultat alimentaire</h2>

    <div class="result-card">
      <p class="result-label">🌍 Total CO₂ aujourd'hui</p>
      <p class="result-value">
        {{ totalCo2 }} <span class="unit">kg CO₂e</span>
      </p>
    </div>

    <div class="breakdown">
      <h3>Détail par aliment</h3>
      <div
          v-for="item in data.selectedFoods"
          :key="item.slug"
          class="breakdown-item"
      >
        <span class="item-name">{{ item.name }}</span>
        <span class="item-value">{{ (item.ecv / 1000).toFixed(3) }} kg CO₂/kg</span>
      </div>
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
      <p class="success-msg">✅ Repas enregistré avec succès !</p>
      <button @click="goToDashboard" class="btn-dashboard">
        Voir mes résultats
      </button>
    </div>

    <div v-if="!isLoggedIn" class="login-prompt">
      <p>
        <router-link to="/connexion">Connectez-vous</router-link>
        pour sauvegarder vos résultats
      </p>
      <button @click="goToDashboard" class="btn-dashboard guest-btn">
        Continuer vers le tableau de bord
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router' // Importation du router
import { useAuth } from '@/composables/useAuth.js'
import { useApi } from '@/composables/useApi.js'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ selectedFoods: [] }),
  }
})

const router = useRouter() // Initialisation du router
const { isLoggedIn } = useAuth()
const { fetchApi } = useApi()

const saving = ref(false)
const saved = ref(false)
const saveError = ref('')

const totalCo2 = computed(() => {
  const total = (props.data.selectedFoods ?? []).reduce((sum, item) => {
    return sum + (item.ecv ?? 0)
  }, 0)
  return (total / 1000).toFixed(3)
})

// Fonction de navigation propre
const goToDashboard = () => {
  router.push('/dashboard')
}

const handleSave = async () => {
  if (saving.value) return

  saving.value = true
  saveError.value = ''

  try {
    // On envoie les données à l'API
    await fetchApi('/entries', {
      method: 'POST',
      body: JSON.stringify({
        category: 'repas',
        co2Value: parseFloat(totalCo2.value),
        details: {
          foods: props.data.selectedFoods.map(f => ({
            name: f.name,
            slug: f.slug,
            ecv: f.ecv
          }))
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
/* Tes styles restent identiques, ils sont très bien ! */
.result-card {
  background-color: #2a3242;
  border-radius: 1.5vh;
  padding: 2rem;
  text-align: center;
  margin: 1.5rem 0;
  border: 1px solid #4E5669;
}

.result-label { color: #8792A4; font-size: 0.95rem; margin: 0 0 1rem 0; }
.result-value { font-size: 2.2rem; font-weight: 800; color: #22c55e; margin: 0; }
.result-value .unit { font-size: 1rem; color: #8792A4; font-weight: 600; }

.breakdown h3 { font-size: 0.95rem; color: #8792A4; margin-bottom: 0.75rem; }
.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid #4E5669;
  font-size: 0.9rem;
}

.item-name { font-weight: 500; color: #ffffff; }
.item-value { color: #8792A4; }

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
  margin-bottom: 1rem;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  transition: all 0.2s ease !important;
}

.error { color: #F96750; font-size: 0.85rem; text-align: center; margin-top: 0.5rem; }

.login-prompt {
  background-color: #2a3242;
  border: 1px solid #4E5669;
  border-radius: 1.5vh;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #8792A4;
}
.login-prompt a { color: #F96750; font-weight: 700; text-decoration: underline; }
</style>