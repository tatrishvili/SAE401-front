<template>
  <div class="dashboard-screen">
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="title">Tableau de bord</h1>
    </div>

    <div v-if="loading || !isReady" class="loader">
      <div class="spinner"></div>
      <p>Chargement de vos données...</p>
    </div>

    <template v-else>
      <div class="card summary-grid">
        <div class="summary-item">
          <span class="summary-label">Aujourd'hui</span>
          <span class="summary-value">{{ summary.daily.toFixed(1) }}<small> kg</small></span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cette semaine</span>
          <span class="summary-value">{{ summary.weekly.toFixed(1) }}<small> kg</small></span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Ce mois</span>
          <span class="summary-value">{{ summary.monthly.toFixed(1) }}<small> kg</small></span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Cette année</span>
          <span class="summary-value">{{ summary.yearly.toFixed(1) }}<small> kg</small></span>
        </div>
      </div>

      <div class="card">
        <p class="card-title">Score du jour</p>
        <apexchart
            v-if="scoreSeries.length"
            type="radialBar"
            :options="scoreOptions"
            :series="scoreSeries"
            height="220"
        />
      </div>

      <div class="card">
        <p class="card-title">Répartition du jour</p>
        <apexchart
            v-if="donutSeries.some(v => v > 0)"
            type="donut"
            :options="donutOptions"
            :series="donutSeries"
            height="260"
        />
        <div v-else class="empty-chart">Pas de données aujourd'hui</div>

        <div class="legend">
          <div v-for="(label, i) in CATEGORY_LABELS" :key="i" class="legend-item">
            <span class="legend-dot" :style="{ backgroundColor: donutColors[i] }"/>
            <span class="legend-label">{{ label }}</span>
            <span class="legend-value">{{ (donutSeries[i] || 0).toFixed(1) }} kg</span>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="card-title">Transport vs Repas (7j)</p>
        <apexchart type="bar" :options="barOptions" :series="barSeries" height="200" />
      </div>

      <div class="card">
        <p class="card-title">Évolution sur 30 jours</p>
        <apexchart type="line" :options="lineOptions" :series="lineSeries" height="200" />
      </div>

      <div class="card">
        <p class="card-title">Calendrier d'activité</p>
        <apexchart type="heatmap" :options="heatmapOptions" :series="heatmapSeries" height="200" />
      </div>

      <div v-if="rawData.length === 0" class="empty-state">
        <p>📊 Aucune donnée pour l'instant.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi.js'

const router = useRouter()
const { loading, fetchApi } = useApi()
const isReady = ref(false)

// ─── STATE ───
const rawData = ref([])
const summary = ref({ daily: 0, weekly: 0, monthly: 0, yearly: 0 })

const CATEGORIES = ['transport', 'repas']
const CATEGORY_LABELS = ['Transport', 'Alimentation']
const donutColors = ['#4ECDC4', '#FFD166']

// ─── FETCH ───
onMounted(async () => {
  try {
    const data = await fetchApi('/stats')
    rawData.value = data.entries ?? []
    summary.value = data.summary ?? { daily: 0, weekly: 0, monthly: 0, yearly: 0 }

    // Attendre que Vue injecte le HTML avant d'autoriser ApexCharts
    await nextTick()
    isReady.value = true
  } catch (e) {
    console.error('Erreur dashboard:', e)
  }
})

// ─── HELPERS ───
const todayStr = () => new Date().toLocaleDateString('en-CA')
const lastNDays = (n) => Array.from({ length: n }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
  return d.toLocaleDateString('en-CA')
})

// ─── CALCULS DES SERIES (Gardés inchangés mais sécurisés) ───

const scoreSeries = computed(() => {
  const score = Math.max(0, Math.min(100, Math.round(100 - (summary.value.daily || 0) * 5)))
  return [score]
})

const scoreOptions = computed(() => ({
  chart: { background: 'transparent', toolbar: { show: false } },
  plotOptions: {
    radialBar: {
      startAngle: -135, endAngle: 135,
      hollow: { size: '60%' },
      track: { background: '#373E4E' },
      dataLabels: {
        name: { show: true, fontSize: '14px', color: '#8792A4', offsetY: 20 },
        value: {
          fontSize: '22px', fontWeight: 800, color: '#ffffff', offsetY: -10,
          formatter: (val) => val >= 70 ? 'Top' : val >= 40 ? 'Moyen' : 'Bof'
        }
      }
    }
  },
  fill: { colors: [scoreSeries.value[0] >= 70 ? '#4CAF50' : '#F96750'] },
  theme: { mode: 'dark' }
}))

const donutSeries = computed(() => {
  const t = todayStr()
  return CATEGORIES.map(cat =>
      rawData.value
          .filter(item => item.date === t && item.category === cat)
          .reduce((sum, item) => sum + item.co2, 0)
  )
})

const donutOptions = computed(() => ({
  labels: CATEGORY_LABELS,
  colors: donutColors,
  legend: { show: false },
  stroke: { width: 0 },
  plotOptions: { pie: { donut: { size: '70%' } } },
  theme: { mode: 'dark' }
}))

const barSeries = computed(() => {
  const days = lastNDays(7)
  return CATEGORIES.map((cat, idx) => ({
    name: CATEGORY_LABELS[idx],
    data: days.map(date =>
        rawData.value
            .filter(item => item.date === date && item.category === cat)
            .reduce((sum, item) => sum + (item.co2 || 0), 0)
    )
  }))
})

const barOptions = {
  chart: { background: 'transparent', toolbar: { show: false }, stacked: true },
  colors: donutColors,
  xaxis: { categories: ['L', 'M', 'M', 'J', 'V', 'S', 'D'], labels: { style: { colors: '#8792A4' } } },
  theme: { mode: 'dark' }
}

const lineSeries = computed(() => {
  const days = lastNDays(30)
  return CATEGORIES.map((cat, idx) => ({
    name: CATEGORY_LABELS[idx],
    data: days.map(date =>
        rawData.value
            .filter(item => item.date === date && item.category === cat)
            .reduce((sum, item) => sum + (item.co2 || 0), 0)
    )
  }))
})

const lineOptions = {
  chart: { background: 'transparent', toolbar: { show: false } },
  colors: donutColors,
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { labels: { show: false } },
  theme: { mode: 'dark' }
}

const heatmapSeries = computed(() => {
  const scoreMap = {}
  rawData.value.forEach(item => { scoreMap[item.date] = (scoreMap[item.date] || 0) + item.co2 })
  const today = new Date()
  const start = new Date(today); start.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((jour, dIdx) => {
    const data = []
    for (let w = 10; w >= 0; w--) {
      const cellDate = new Date(start)
      cellDate.setDate(start.getDate() - w * 7 + dIdx)
      const co2 = scoreMap[cellDate.toLocaleDateString('en-CA')] ?? 0
      data.push({ x: '.', y: co2 === 0 ? 0 : Math.max(1, 100 - co2 * 5) })
    }
    return { name: jour, data }
  }).reverse()
})

const heatmapOptions = {
  chart: { background: 'transparent', toolbar: { show: false } },
  plotOptions: { heatmap: { colorScale: { ranges: [
          { from: 0, to: 0, color: '#222631' },
          { from: 1, to: 100, color: '#4CAF50' }
        ]}}},
  theme: { mode: 'dark' }
}
</script>

<style lang="scss" scoped>
.dashboard-screen {
  background-color: #1e2530;
  min-height: 100vh;
  padding-bottom: 120px;
  color: white;

  .header {
    background-color: #373E4E;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: sticky; top: 0; z-index: 100;

    .title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #ffffff !important; /* Force le blanc */
      margin: 0;
    }

    .back-btn {
      all: unset;
      position: absolute; left: 16px;
      color: #ffffff; cursor: pointer;
      svg { width: 24px; height: 24px; }
    }
  }

  .card {
    background-color: #2a3242;
    border-radius: 16px;
    padding: 16px;
    margin: 16px;
    .card-title { font-size: 0.9rem; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
  }

  .summary-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
    .summary-item {
      display: flex; flex-direction: column;
      .summary-label { font-size: 0.7rem; color: #8792A4; text-transform: uppercase; }
      .summary-value { font-size: 1.3rem; font-weight: 800; color: white; }
    }
  }

  .empty-chart {
    text-align: center;
    padding: 20px;
    color: #8792A4;
    font-size: 0.8rem;
  }

  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 0;
    color: #8792A4;
  }
}
</style>