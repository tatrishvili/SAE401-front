<template>
  <div class="wizard">
    <component
        :is="currentStepComponent"
        :data="formData"
        @next="nextStep"
        @prev="prevStep"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import Step1Category   from './steps/Step1Category.vue'
import Step2Transport  from './steps/Step2Transport.vue'
import Step2Food       from './steps/Step2Food.vue'
import Step3Result     from './steps/Step3Result.vue'
import Step3FoodResult from './steps/Step3FoodResult.vue'

const currentStep = ref(0)
const formData = reactive({
  category: null,
  transportId: null,
  km: null,
  selectedFoods: [],
})

const currentStepComponent = computed(() => {
  if (currentStep.value === 0) return Step1Category

  if (currentStep.value === 1) {
    return formData.category === 'transport' ? Step2Transport : Step2Food
  }

  if (currentStep.value === 2) {
    return formData.category === 'transport' ? Step3Result : Step3FoodResult
  }

  return Step1Category
})

const nextStep = (stepData) => {
  Object.assign(formData, stepData)
  currentStep.value++
}

const prevStep = () => currentStep.value--
</script>