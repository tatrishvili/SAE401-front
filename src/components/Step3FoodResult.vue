<template>
  <div class="step3-food-result">
    <h2>Résultat alimentaire</h2>

    <!-- Total -->
    <div class="total-card">
      <p class="total-label">🌍 Total CO₂ aujourd'hui</p>
      <p class="total-value">{{ totalCo2 }} kg CO₂e</p>
    </div>

    <!-- Breakdown per item -->
    <div class="breakdown">
      <h3>Détail par aliment</h3>
      <div
          v-for="item in data.selectedFoods"
          :key="item.slug"
          class="breakdown-item"
      >
        <span class="item-name">{{ item.name }}</span>
        <span class="item-value">{{ (item.ecv / 1000).toFixed(3) }} kg CO₂/kg</span>
      </div>
    </div>

    <div class="actions">
      <button @click="$emit('prev')" class="btn-back">← Retour</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ selectedFoods: [] }),
  }
})
defineEmits(['prev'])

// ecv is already in kg CO2 per kg of food, sum all selected items
const totalCo2 = computed(() => {
  const total = (props.data.selectedFoods ?? []).reduce((sum, item) => {
    return sum + (item.ecv ?? 0)
  }, 0)
  return (total / 1000).toFixed(3)
})
</script>

<style scoped lang="scss">
.step3-food-result {
  padding: 1rem;

  .total-card {
    background: #f0fdf4;
    border: 2px solid #22c55e;
    border-radius: 1rem;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;

    .total-label {
      font-size: 1rem;
      color: #555;
      margin-bottom: 0.5rem;
    }

    .total-value {
      font-size: 2rem;
      font-weight: bold;
      color: #16a34a;
    }
  }

  .breakdown {
    margin-bottom: 1.5rem;

    h3 {
      font-size: 0.95rem;
      color: #555;
      margin-bottom: 0.75rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 0.6rem 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.9rem;

      .item-name {
        font-weight: 500;
      }

      .item-value {
        color: #888;
      }
    }
  }

  .actions {
    .btn-back {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: none;
      background: #f3f4f6;
      color: #333;
      font-size: 1rem;
      cursor: pointer;
    }
  }
}
</style>