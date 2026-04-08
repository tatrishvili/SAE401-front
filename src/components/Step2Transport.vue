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
button.selected {
  background: #8792A4;
  color: #373E4E;
  border-color: #8792A4;
}
</style>