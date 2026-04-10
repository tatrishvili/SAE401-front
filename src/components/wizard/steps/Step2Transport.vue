<template>
  <div class="step step2">
    <h2>Votre trajet</h2>

    <!-- 1. Choix du transport -->
    <div class="choices">
      <button
        v-for="t in transports"
        :key="t.slug"
        :class="{ selected: local.transport === t.slug }"
        @click="local.transport = t.slug"
      >
        {{ t.icon }} {{ t.label }}
      </button>
    </div>
    <span class="error" v-if="errors.transport">{{ errors.transport }}</span>

    <!-- 2. Distance -->
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

const transports = [
  { slug: 'voiturethermique', label: 'Voiture',       icon: '🚗' },
  { slug: 'tgv',              label: 'Train (TGV)',    icon: '🚄' },
  { slug: 'avion',            label: 'Avion',          icon: '✈️' },
  { slug: 'velo',             label: 'Vélo / Marche',  icon: '🚲' },
]

const local = reactive({
  transport: props.data.transport ?? null,
  km: props.data.km ?? null,
})

const errors = reactive({ transport: '', km: '' })

const validate = () => {
  errors.transport = local.transport ? '' : 'Choisissez un moyen de transport'
  errors.km = local.km && local.km > 0 ? '' : 'Entrez une distance valide'
  return !errors.transport && !errors.km
}

const handleNext = () => {
  if (validate()) emit('next', { transport: local.transport, km: local.km })
}
</script>

<style scoped>
button.selected {
  background: #8792A4;
  color: #373E4E;
  border-color: #8792A4;
}
</style>