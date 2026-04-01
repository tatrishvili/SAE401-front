<template>
  <div>
    <h2>{{ t('transport.title') }}</h2>

    <div class="choices" v-if="!loading">
      <button
          v-for="transport in transports"
          :key="transport.slug"
          :class="{ selected: local.transport === transport.slug }"
          @click="local.transport = transport.slug"
      >
        {{ transport.icon }} {{ transport.label }}
      </button>
    </div>

    <div v-if="loading">Chargement...</div>
    <span class="error" v-if="errors.transport">{{ errors.transport }}</span>

    <div class="input-group">
      <label>{{ t('transport.distance') }}</label>
      <input
          v-model.number="local.km"
          type="number"
          min="1"
          :placeholder="t('transport.distancePlaceholder')"
      />
      <span class="error" v-if="errors.km">{{ errors.km }}</span>
    </div>

    <div class="button-group">
      <button @click="$emit('prev')">← {{ t('buttons.back') }}</button>
      <button @click="handleNext" class="btn-primary">
        {{ t('buttons.calculate') }} →
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApi } from '../composables/useApi'

const { t, locale } = useI18n()
const { fetchApi } = useApi()

const props = defineProps(['data'])
const emit = defineEmits(['next', 'prev'])

const transports = ref([])
const loading = ref(true)

const local = reactive({
  transport: props.data.transport ?? null,
  km: props.data.km ?? null,
})

const errors = reactive({
  transport: '',
  km: '',
})

onMounted(async () => {
  try {
    const data = await fetchApi(`/emission-factors?category=transport&locale=${locale.value}`)
    transports.value = data
  } catch (e) {
    console.error('Erreur chargement transports:', e)
  } finally {
    loading.value = false
  }
})

const validate = () => {
  errors.transport = local.transport ? '' : t('transport.selectTransport')
  errors.km = local.km && local.km > 0 ? '' : t('transport.validDistance')
  return !errors.transport && !errors.km
}

const handleNext = () => {
  if (validate()) {
    emit('next', {
      type: local.transport,
      quantity: local.km,
      category: 'transport',
    })
  }
}
</script>

<style scoped>
/* Réutiliser les styles de Step1 */
.input-group {
  margin: 1.5rem 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
</style>