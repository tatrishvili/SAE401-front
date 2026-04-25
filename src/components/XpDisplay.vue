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
      <div
        class="progress-fill"
        :style="{ '--fill': `${progressPercent}%` }"
      ></div>
    </div>

    <p class="xp-next" v-if="nextThreshold > xp">
      Encore {{ remainingXp }} XP avant le prochain palier ({{ nextThreshold }}
      XP)
    </p>
    <p class="xp-next" v-else>Palier suivant atteint, bravo.</p>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  xp: { type: Number, default: 0 },
  nextThreshold: { type: Number, default: 100 },
});

const safeThreshold = computed(() =>
  props.nextThreshold > 0 ? props.nextThreshold : 100,
);
const progressPercent = computed(() =>
  Math.max(
    0,
    Math.min(100, Math.round((props.xp / safeThreshold.value) * 100)),
  ),
);
const remainingXp = computed(() => Math.max(0, safeThreshold.value - props.xp));
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

.xp-display {
  width: min(520px, 100%);
  margin: 0 auto 28px;
  padding: 20px;
  box-sizing: border-box;
  min-width: 0;
  border-radius: 18px;
  border: 1px solid rgba(v.$d1, 0.22);
  background: linear-gradient(135deg, rgba(v.$d3, 0.95), rgba(v.$d4, 0.18));
  box-shadow:
    0 16px 36px rgba(v.$d5, 0.24),
    inset 0 1px 0 rgba(v.$l1, 0.06);
}

.xp-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}
.xp-label {
  margin: 0;
  color: v.$l5;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.78rem;
  font-weight: 700;
}
.xp-value {
  margin: 0;
  color: v.$c1;
  font-size: 1.25rem;
  font-weight: 900;
}
.progress-track {
  height: 14px;
  border-radius: 999px;
  background: rgba(v.$d3, 0.9);
  border: 1px solid rgba(v.$l5, 0.7);
  overflow: hidden;
}
.progress-fill {
  --fill: 0%;
  width: var(--fill);
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, v.$c1, v.$d1);
  box-shadow: 0 0 16px rgba(v.$c1, 0.35);
}
.xp-next {
  margin: 10px 0 0;
  color: v.$l5;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
</style>
