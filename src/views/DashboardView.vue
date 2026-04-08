<template>
  <div class="dashboard-screen">
    <!-- HEADER -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="title">Tableau de bord</h1>
    </div>

    <!-- SCORE -->
    <div class="card">
      <p class="card-title">Score du jour</p>
      <apexchart type="radialBar" :options="scoreOptions" :series="scoreSeries" height="220"/>
    </div>

    <!-- DONUT -->
    <div class="card">
      <p class="card-title">Actions du jour</p>

      <div v-if="loading" class="loader">Chargement...</div>

      <template v-else>
        <div v-if="donutSeries.every(v => v === 0)" class="empty-state">
          Aucune donnée aujourd’hui
        </div>

        <template v-else>
          <apexchart type="donut" :options="donutOptions" :series="donutSeries" height="260"/>

          <div class="legend">
            <div v-for="(label, i) in donutOptions.labels" :key="i" class="legend-item">
              <span class="legend-dot" :style="{ backgroundColor: donutColors[i] }" />
              <span class="legend-label">{{ label }}</span>
              <span class="legend-value">{{ donutSeries[i].toFixed(2) }} kg</span>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- BAR -->
    <div class="card">
      <p class="card-title">Actions de la semaine</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart v-else type="bar" :options="barOptions" :series="barSeries" height="200"/>
    </div>

    <!-- LINE -->
    <div class="card">
      <p class="card-title">Évolution mensuelle</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart v-else type="line" :options="lineOptions" :series="lineSeries" height="200"/>
    </div>

    <!-- HEATMAP -->
    <div class="card">
      <p class="card-title">Calendrier</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart v-else type="heatmap" :options="heatmapOptions" :series="heatmapSeries" height="180"/>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useEntries } from '@/composables/useEntries'

  const router = useRouter()
  const {
  loading,
  donutSeries,
  barSeries,
  lineSeries,
  heatmapSeries,
  scoreSeries,
  CATEGORIES
} = useEntries()

  const donutColors = ['#4ECDC4', '#F6D6D6']

  const scoreOptions = { chart: { background: 'transparent' }, plotOptions: { radialBar: { hollow: { size: '60%' }, dataLabels: { value: { formatter: val => val === 0 ? '—' : val + '%' } } } } }
  const donutOptions = { labels: CATEGORIES, colors: donutColors, legend: { show: false } }
  const barOptions = { chart: { background: 'transparent' } }
  const lineOptions = { chart: { background: 'transparent' } }
  const heatmapOptions = { chart: { background: 'transparent' } }
</script>

<style scoped>
.dashboard-screen {
  background: #1e2530;
  min-height: 100vh;
  padding: 20px;
  color: white;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.card {
  background: #2a3242;
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
}

.loader {
  text-align: center;
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #aaa;
}

.legend {
  margin-top: 10px;
}

.legend-item {
  display: flex;
  justify-content: space-between;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>