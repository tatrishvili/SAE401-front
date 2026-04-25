<template>
  <div class="wizard">
    <Teleport to="body">
      <transition name="toast">
        <div v-if="successMessage" class="success-toast">
          ✅ {{ successMessage }}
        </div>
      </transition>
    </Teleport>

    <component
        :is="currentStepComponent"
        :data="formData"
        @next="nextStep"
        @prev="prevStep"
        @reset="handleReset"
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
const successMessage = ref('')

const initialData = () => ({
  category: null,
  transportId: null,
  km: null,
  selectedFoods: [],
})

const formData = reactive(initialData())

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

const handleReset = (msg = 'Action enregistrée avec succès !') => {
  Object.assign(formData, initialData())
  currentStep.value = 0
  successMessage.value = msg
  setTimeout(() => { successMessage.value = '' }, 3500)
}
</script>

<style lang="scss">
// Non-scoped pour que Teleport vers <body> fonctionne
.success-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: #4CAF50;
  color: #fff;
  padding: 14px 22px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.45);
  pointer-events: none;
  white-space: nowrap;
  max-width: 90vw;
}

.toast-enter-active {
  transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
