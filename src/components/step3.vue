<template>
  <div class="result-container">
    <h2>{{ t('result.title') }}</h2>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Calcul en cours...
    </div>

    <div v-else-if="error" class="error-box">
      {{ error }}
    </div>

    <div v-else class="result">
      <div class="co2-badge">
        <span class="value">{{ co2 }}</span>
        <span class="unit">kg CO₂</span>
      </div>

      <p class="equivalent">
        {{ t('result.equivalent') }}
        <strong>{{ trees }}</strong>
        {{ t('result.trees') }}
      </p>

      <div class="visual">
        <span v-for="n in Math.min(trees, 10)" :key="n">🌳</span>
      </div>
    </div>

    <div class="button-group">
      <button @click="$emit('prev')">← {{ t('buttons.back') }}</button>
      <button @click="reset" class="btn-primary">
        {{ t('buttons.newCalculation') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApi } from '../composables/useApi'

const { t, locale } = useI18n()
const { loading, error, fetchApi } = useApi()

const props = defineProps(['data'])
const emit = defineEmits(['prev', 'reset'])

const co2 = ref(0)

const trees = computed(() => Math.ceil(co2.value / 0.02)) // 1 arbre absorbe ~20kg/an

onMounted(async () => {
  try {
    const result = await fetchApi('/calculate', {
      method: 'POST',
      body: JSON.stringify({
        type: props.data.type,
        quantity: props.data.quantity,
        locale: locale.value,
      }),
    })

    co2.value = result.co2
  } catch (e) {
    console.error('Erreur calcul:', e)
  }
})

const reset = () => {
  emit('reset')
}
</script>

<style scoped>
.result-container {
  text-align: center;
  padding: 2rem;
}

.co2-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 20px;
  margin: 2rem 0;
}

.value {
  font-size: 3rem;
  font-weight: bold;
  display: block;
}

.unit {
  font-size: 1.2rem;
  opacity: 0.9;
}

.visual {
  font-size: 2rem;
  margin: 2rem 0;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>