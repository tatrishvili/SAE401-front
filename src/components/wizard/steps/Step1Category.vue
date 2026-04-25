<template>
  <div class="step step1">
    <h2>Que souhaitez-vous calculer ?</h2>

    <div class="choices">
      <button
          v-for="cat in categories"
          :key="cat.value"
          :class="['choice-btn', { selected: local.category === cat.value }]"
          @click="local.category = cat.value"
      >
        <span class="icon">{{ cat.icon }}</span>
        <span class="label">{{ cat.label }}</span>
        <span v-if="local.category === cat.value" class="checkmark">✓</span>
      </button>
    </div>
    <span class="error" v-if="error">{{ error }}</span>

    <button @click="handleNext" class="suivant">Suivant →</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const props = defineProps(['data'])
const emit = defineEmits(['next'])

const categories = [
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'repas',     label: 'Repas',     icon: '🍽️' },
]

const local = reactive({ category: props.data.category ?? null })
const error = ref('')

const handleNext = () => {
  if (!local.category) {
    error.value = 'Veuillez choisir une catégorie'
    return
  }
  error.value = ''
  emit('next', { category: local.category })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as *;

.choices {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  width: 100%;
  align-items: center;
}

.choice-btn {
  all: unset;
  position: relative;
  width: 80%;
  max-width: 360px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: $d3;
  color: $l1;
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: $button;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, background-color 0.2s ease,
              transform 0.12s ease, box-shadow 0.2s ease;

  .icon { font-size: 2.5rem; line-height: 1; }
  .label { font-weight: 700; }

  &:hover {
    border-color: rgba(78, 205, 196, 0.5);
  }

  &:active {
    transform: scale(0.97);
  }

  &.selected {
    border-color: #4ECDC4;
    background-color: rgba(78, 205, 196, 0.18);
    box-shadow: 0 0 0 4px rgba(78, 205, 196, 0.18);

    .icon {
      transform: scale(1.1);
      transition: transform 0.2s ease;
    }
  }

  .checkmark {
    position: absolute;
    top: 10px;
    right: 14px;
    color: #4ECDC4;
    font-size: 1.3rem;
    font-weight: 900;
  }
}

.error {
  color: $c1;
  font-size: $subbody;
  display: block;
  margin-top: 1vh;
}

.suivant {
  margin-top: 2vh;
}
</style>
