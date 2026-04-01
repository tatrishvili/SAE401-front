<template>
  <div>
    <h2>{{ t('category.title') }}</h2>

    <div class="choices">
      <button
          v-for="cat in categories"
          :key="cat.value"
          :class="{ selected: local.category === cat.value }"
          @click="local.category = cat.value"
      >
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <span class="error" v-if="errors.category">{{ errors.category }}</span>

    <button @click="handleNext" class="btn-primary">
      {{ t('buttons.calculate') }} →
    </button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps(['data'])
const emit = defineEmits(['next'])

const categories = [
  { value: 'transport', label: t('category.transport'), icon: '🚗' },
  { value: 'food', label: t('category.food'), icon: '🍽️' },
]

const local = reactive({
  category: props.data.category ?? null,
})

const errors = reactive({ category: '' })

const validate = () => {
  errors.category = local.category ? '' : 'Choisissez une catégorie'
  return !errors.category
}

const handleNext = () => {
  if (validate()) emit('next', { category: local.category })
}
</script>

<style scoped>
.choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

button {
  padding: 1.5rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

button.selected {
  background: #22c55e;
  color: white;
  border-color: #22c55e;
}

.error {
  color: #ef4444;
  font-size: 0.9rem;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  margin-top: 1rem;
}
</style>