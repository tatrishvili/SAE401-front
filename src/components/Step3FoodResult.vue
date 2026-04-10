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
        <span v-else-if="saved">Enregistré</span>
        <span v-else>Sauvegarder dans mon profil</span>
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

<style scoped lang="scss">
.step3-food-result {
  padding: 1rem;

  .total-card {
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;

    .total-label {
      font-size: 1rem;
      color: #555;
      margin-bottom: 0.5rem;
    }

    .total-value {
      font-size: 2rem;
      font-weight: bold;
      color: #16a34a;
    }
  }

  .breakdown {
    margin-bottom: 1.5rem;

    h3 {
      font-size: 0.95rem;
      color: #555;
      margin-bottom: 0.75rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.9rem;

      .item-name {
        font-weight: 500;
      }

      .item-value {
        color: #888;
      }
    }
  }

  .save-section {
    margin-bottom: 1.5rem;
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

  .error {
    color: #ef4444;
    margin-top: 0.5rem;
    font-size: 0.9rem;
  }

  .login-prompt {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #fef3c7;
    border-radius: 0.5rem;
    text-align: center;

    a {
      color: #f59e0b;
      font-weight: 600;
      text-decoration: underline;
    }
  }

  .actions {
    .btn-back {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: none;
      background: #f3f4f6;
      color: #333;
      font-size: 1rem;
      cursor: pointer;
    }
  }
}
</style>