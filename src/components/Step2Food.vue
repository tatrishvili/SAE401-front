<template>
  <div>
    <h2>{{ t('food.title') }}</h2>

    <div class="choices" v-if="!loading">
      <button
        v-for="food in foods"
        :key="food.slug"
        :class="{ selected: local.foodType === food.slug }"
        @click="local.foodType = food.slug"
      >
        {{ food.icon }} {{ food.label }}
      </button>
    </div>

    <span class="error" v-if="errors.foodType">{{ errors.foodType }}</span>

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

const foods = ref([])
const loading = ref(true)

const local = reactive({
  foodType: props.data.foodType ?? null,
})

const errors = reactive({ foodType: '' })

onMounted(async () => {
  const data = await fetchApi(`/emission-factors?category=food&locale=${locale.value}`)
  foods.value = data
  loading.value = false
})

const validate = () => {
  errors.foodType = local.foodType ? '' : t('food.selectFood')
  return !errors.foodType
}

const handleNext = () => {
  if (validate()) {
    emit('next', {
      type: local.foodType,
      quantity: 1, // 1 repas
      category: 'food',
    })
  }
}
</script>