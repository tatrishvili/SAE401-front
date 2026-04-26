<template>
  <div class="step step2">
    <h2>Votre trajet</h2>

    <div class="choices">
      <button
          v-for="t in transports"
          :key="t.id"
          :class="{ selected: local.transportId === t.id }"
          @click="local.transportId = t.id"
      >
        {{ t.icon }} {{ t.label }}
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

    <button @click="$emit('prev')" class="disparait">← Retour</button>
    <button @click="handleNext" class="suivant">Calculer</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps(['data'])
const emit = defineEmits(['next', 'prev'])

// Transport IDs as expected by the impactco2.fr API
const transports = [
  { id: 2,  label: 'Voiture',      icon: '🚗' },
  { id: 10, label: 'Train (TGV)',  icon: '🚄' },
  { id: 14, label: 'Avion',        icon: '✈️' },
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

<style scoped>
button {
  cursor: pointer !important;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

button:hover {
  background-color: #e0502a !important;
  transform: scale(1.02);
}

button:active {
  transform: scale(0.98);
}

button.selected {
  border: 3px solid #22c55e !important;
  background-color: rgba(34, 197, 94, 0.15) !important;
  color: #ffffff !important;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
}

button.selected:hover {
  background-color: rgba(34, 197, 94, 0.25) !important;
}
</style>