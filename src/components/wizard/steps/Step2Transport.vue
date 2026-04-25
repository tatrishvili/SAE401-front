<template>
  <div class="step step2">
    <h2>Votre trajet</h2>

    <div class="choices">
      <button
          v-for="t in transports"
          :key="t.id"
          :class="['choice-btn', { selected: local.transportId === t.id }]"
          @click="local.transportId = t.id"
      >
        <span class="icon">{{ t.icon }}</span>
        <span class="label">{{ t.label }}</span>
        <span v-if="local.transportId === t.id" class="checkmark">✓</span>
      </button>
    </div>
    <span class="error" v-if="errors.transport">{{ errors.transport }}</span>

    <div class="inpuuut">
      <label>Distance (km)</label>
      <input
          v-model.number="local.km"
          type="number"
          min="1"
          placeholder="Ex: 150"
      />
      <span class="error" v-if="errors.km">{{ errors.km }}</span>
    </div>

    <button @click="handleNext" class="suivant">Calculer</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps(['data'])
const emit = defineEmits(['next', 'prev'])

const transports = [
  { id: 2,  label: 'Voiture',       icon: '🚗' },
  { id: 10, label: 'Train (TGV)',   icon: '🚄' },
  { id: 14, label: 'Avion',         icon: '✈️' },
  { id: 7,  label: 'Vélo / Marche', icon: '🚲' },
]

const local = reactive({
  transportId: props.data.transportId ?? null,
  km: props.data.km ?? null,
})

const errors = reactive({ transport: '', km: '' })

const validate = () => {
  errors.transport = local.transportId !== null ? '' : 'Choisissez un moyen de transport'
  errors.km = local.km && local.km > 0 ? '' : 'Entrez une distance valide'
  return !errors.transport && !errors.km
}

const handleNext = () => {
  if (validate()) emit('next', { transportId: local.transportId, km: local.km })
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/abstracts/variables' as *;

.choices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2vh;
  width: 100%;
  margin-bottom: 2vh;
}

.choice-btn {
  all: unset;
  position: relative;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.4rem;
  background-color: $d3;
  color: $l1;
  border: 3px solid transparent;
  border-radius: 16px;
  font-size: $body;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, background-color 0.2s ease,
              transform 0.12s ease, box-shadow 0.2s ease;
  box-sizing: border-box;
  padding: 1rem;

  .icon { font-size: 2.2rem; line-height: 1; }
  .label { font-weight: 700; font-size: 0.95rem; }

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
  }

  .checkmark {
    position: absolute;
    top: 8px;
    right: 10px;
    color: #4ECDC4;
    font-size: 1.1rem;
    font-weight: 900;
  }
}

.inpuuut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1vh;
  margin-bottom: 2vh;

  label {
    color: $l1;
    font-weight: 600;
  }

  input {
    background-color: $d3;
    border-radius: 1vh;
    font-size: $button;
    padding: 1.5vh;
    color: $l1;
    border: 2px solid $d1;
    width: 60%;
    max-width: 280px;
    text-align: center;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: #4ECDC4;
    }
  }
}

.error {
  color: $c1;
  font-size: $subbody;
  display: block;
  text-align: center;
  margin: 0.5vh 0;
}

.suivant {
  margin-top: 1vh;
}
</style>
