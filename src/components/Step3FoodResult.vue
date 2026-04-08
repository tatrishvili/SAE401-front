<template>
  <div class="step3-food-result">
    <h2>Résultat alimentaire</h2>

    <div class="total-card">
      <p class="total-label">🌍 Total CO₂ aujourd'hui</p>
      <p class="total-value">{{ totalCo2 }} kg CO₂e</p>
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

    <!-- Save section -->
    <div v-if="isLoggedIn" class="save-section">
      <button
          @click="handleSave"
          class="btn-save"
          :disabled="saving || saved"
      >
        <span v-if="saving">⏳ Enregistrement...</span>
        <span v-else-if="saved">✅ Enregistré</span>
        <span v-else>💾 Sauvegarder dans mon profil</span>
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

    <div class="actions">
      <button @click="$emit('prev')" class="btn-back">← Retour</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({selectedFoods: []}),
  }
})
defineEmits(['prev'])

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

const handleSave = async () => {
  saving.value = true
  saveError.value = ''

  try {
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

<style lang="scss">

@use '@/assets/styles/pages/_step3foodresult.scss' as *;
</style>