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
import Step1Category  from './Step1Category.vue'
import Step2Transport from './Step2Transport.vue'
import Step3Result    from './Step3Result.vue'

const steps = [Step1Category, Step2Transport, Step3Result]
const currentStep = ref(0)

// transportId holds the numeric API ID (e.g. 2 for voiture thermique)
const formData = reactive({
  category:    null,
  transportId: null,
  km:          null,
})

const currentStepComponent = computed(() => steps[currentStep.value])

const nextStep = (stepData) => {
  Object.assign(formData, stepData)
  currentStep.value++
}
const prevStep = () => currentStep.value--
</script>