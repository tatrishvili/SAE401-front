<template>
  <div class="wizard">
    <!-- Sélecteur de langue -->
    <div class="language-selector">
      <button @click="changeLocale('fr')" :class="{ active: locale === 'fr' }">🇫🇷 FR</button>
      <button @click="changeLocale('en')" :class="{ active: locale === 'en' }">🇬🇧 EN</button>
    </div>

    <!-- Progress bar -->
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${progress}%` }"></div>
    </div>

    <component
        :is="currentStepComponent"
        :data="formData"
        @next="nextStep"
        @prev="prevStep"
        @reset="resetWizard"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Step1Category from './steps/Step1Category.vue'
import Step2Transport from './steps/Step2Transport.vue'
import Step2Food from './steps/Step2Food.vue'
import Step3Result from './steps/Step3Result.vue'

const { locale } = useI18n()

const currentStep = ref(0)
const formData = reactive({
  category: null,
  type: null,
  quantity: null,
})

const steps = computed(() => {
  const baseSteps = [Step1Category]

  if (formData.category === 'transport') {
    return [...baseSteps, Step2Transport, Step3Result]
  } else if (formData.category === 'food') {
    return [...baseSteps, Step2Food, Step3Result]
  }

  return baseSteps
})

const currentStepComponent = computed(() => steps.value[currentStep.value])

const progress = computed(() => {
  return ((currentStep.value + 1) / steps.value.length) * 100
})

const nextStep = (stepData) => {
  Object.assign(formData, stepData)
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const resetWizard = () => {
  currentStep.value = 0
  formData.category = null
  formData.type = null
  formData.quantity = null
}

const changeLocale = (newLocale) => {
  locale.value = newLocale
}
</script>

<style scoped>
.wizard {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.language-selector {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.language-selector button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  cursor: pointer;
}

.language-selector button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}
</style>