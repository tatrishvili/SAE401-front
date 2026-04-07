<template>
  <section class="xp-display" aria-label="Progression experience">
    <div class="xp-header">
      <p class="xp-label">Experience totale</p>
      <p class="xp-value">{{ xp }} XP</p>
    </div>

    <div
      class="progress-track"
      role="progressbar"
      :aria-valuenow="progressPercent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-fill" :style="{ '--fill': `${progressPercent}%` }"></div>
    </div>

    <p class="xp-next" v-if="nextThreshold > xp">
      Encore {{ remainingXp }} XP avant le prochain palier ({{ nextThreshold }} XP)
    </p>
    <p class="xp-next" v-else>Palier suivant atteint, bravo.</p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  xp: {
    type: Number,
    default: 0,
  },
  nextThreshold: {
    type: Number,
    default: 100,
  },
})

const safeThreshold = computed(() => (props.nextThreshold > 0 ? props.nextThreshold : 100))
const progressPercent = computed(() => {
  const value = (props.xp / safeThreshold.value) * 100
  return Math.max(0, Math.min(100, Math.round(value)))
})
const remainingXp = computed(() => Math.max(0, safeThreshold.value - props.xp))
</script>

<style scoped lang="scss">
@use '@/assets/variables' as v;

.xp-display {
  width: min(520px, 100%);
  margin: 0 auto 28px;
  padding: 20px;
  box-sizing: border-box;
  min-width: 0;
  border-radius: 18px;
  border: 1px solid rgba(v.$eco-green, 0.22);
  background: linear-gradient(135deg, rgba(v.$card-bg, 0.95), rgba(v.$eco-green-dark, 0.18));
  box-shadow:
    0 16px 36px rgba(v.$black, 0.24),
    inset 0 1px 0 rgba(v.$text-white, 0.06);
}

.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.xp-label {
  margin: 0;
  color: v.$text-muted;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.78rem;
  font-weight: 700;
}

.xp-value {
  margin: 0;
  color: v.$eco-green;
  font-size: 1.25rem;
  font-weight: 900;
}

.progress-track {
  height: 14px;
  border-radius: 999px;
  background: rgba(v.$status-btn-bg, 0.9);
  border: 1px solid rgba(v.$card-border, 0.7);
  overflow: hidden;
}

.progress-fill {
  --fill: 0%;
  width: var(--fill);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, v.$eco-green-dark, v.$eco-green);
  box-shadow: 0 0 16px rgba(v.$eco-green, 0.35);
  animation: progress-load 1.1s ease-out forwards;
  transform-origin: left center;
}

.xp-next {
  margin: 10px 0 0;
  color: v.$text-gray;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .xp-display {
    padding: 14px;
    margin-bottom: 16px;
    border-radius: 14px;
  }

  .xp-header {
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .xp-label {
    font-size: 0.7rem;
  }

  .xp-value {
    font-size: 1.05rem;
  }

  .progress-track {
    height: 12px;
  }

  .xp-next {
    font-size: 0.82rem;
  }
}

@keyframes progress-load {
  from {
    width: 0;
    opacity: 0.6;
  }
  to {
    width: var(--fill);
    opacity: 1;
  }
}
</style>
