<template>
  <div class="dashboard-screen">

    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="title">Tableau de bord</h1>
    </div>

    <!-- Score du jour -->
    <div class="card">
      <p class="card-title">Score du jour</p>
      <apexchart
        type="radialBar"
        :options="scoreOptions"
        :series="scoreSeries"
        height="220"
      />
    </div>

    <!-- Actions du jour (Donut) -->
    <div class="card">
      <p class="card-title">Actions du jour</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <template v-else>
        <apexchart
          type="donut"
          :options="donutOptions"
          :series="donutSeries"
          height="260"
        />
        <div class="legend">
          <div v-for="(label, i) in donutOptions.labels" :key="i" class="legend-item">
            <span class="legend-dot" :style="{ backgroundColor: donutColors[i] }" />
            <span class="legend-label">{{ label }}</span>
            <span class="legend-value">{{ donutSeries[i] }} kg</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Actions de la semaine (Bar) -->
    <div class="card">
      <p class="card-title">Actions de la semaine</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart
        v-else
        type="bar"
        :options="barOptions"
        :series="barSeries"
        height="200"
      />
    </div>

    <!-- Évolution mensuelle (Line) -->
    <div class="card">
      <p class="card-title">Évolution mensuelle</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart
        v-else
        type="line"
        :options="lineOptions"
        :series="lineSeries"
        height="200"
      />
    </div>

    <!-- Calendrier (Heatmap) -->
    <div class="card">
      <p class="card-title">Calendrier</p>
      <div v-if="loading" class="loader">Chargement...</div>
      <apexchart
        v-else
        type="heatmap"
        :options="heatmapOptions"
        :series="heatmapSeries"
        height="180"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ─── FETCH API ────────────────────────────────────────────────────
const rawData = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const response = await fetch('https://ton-api-symfony.com/api/actions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    rawData.value = await response.json()
  } catch (e) {
    console.error('Erreur API :', e)
  } finally {
    loading.value = false
  }
})

// ─── SCORE DU JOUR ────────────────────────────────────────────────
const scoreSeries = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayData = rawData.value.filter(item => item.date === today)
  if (!todayData.length) return [68]
  const total = todayData.reduce((sum, item) => sum + item.co2, 0)
  const score = Math.max(0, Math.min(100, Math.round(100 - total * 5)))
  return [score]
})

const scoreOptions = computed(() => ({
  chart: { background: 'transparent', toolbar: { show: false } },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: { size: '60%' },
      track: { background: '#373E4E', strokeWidth: '100%' },
      dataLabels: {
        name: {
          show: true,
          fontSize: '14px',
          color: '#8792A4',
          offsetY: 20,
          formatter: () => "aujourd'hui"
        },
        value: {
          fontSize: '24px',
          fontWeight: 800,
          color: '#ffffff',
          offsetY: -10,
          formatter: (val) => {
            if (val >= 70) return '🌿 Excellent'
            if (val >= 40) return '⚡ Correct'
            return '🔥 À améliorer'
          }
        }
      }
    }
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      colorStops: (() => {
        const val = scoreSeries.value[0]
        if (val >= 70) return [
          { offset: 0,   color: '#4CAF50', opacity: 1 },
          { offset: 100, color: '#81C784', opacity: 1 },
        ]
        if (val >= 40) return [
          { offset: 0,   color: '#FFD166', opacity: 1 },
          { offset: 100, color: '#FFB347', opacity: 1 },
        ]
        return [
          { offset: 0,   color: '#F96750', opacity: 1 },
          { offset: 100, color: '#e05030', opacity: 1 },
        ]
      })()
    }
  },
  stroke: { lineCap: 'round' },
  theme: { mode: 'dark' },
}))

// ─── ACTIONS DU JOUR (Donut) ─────────────────────────────────────
const donutColors = ['#4ECDC4', '#F6D6D6', '#F96750', '#FFD166', '#8792A4']

const donutSeries = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const categories = ['Transport', 'Alimentation', 'Energie', 'Consommation', 'Déchets']
  return categories.map(cat =>
    rawData.value
      .filter(item => item.date === today && item.categorie === cat)
      .reduce((sum, item) => sum + item.co2, 0)
  )
})

const donutOptions = {
  labels: ['Transport', 'Alimentation', 'Energie', 'Consommation', 'Déchets'],
  colors: donutColors,
  legend: { show: false },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            color: '#8792A4',
            fontSize: '14px',
            formatter: (w) => {
              const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              return sum.toFixed(1) + ' kg'
            }
          },
          value: { color: '#ffffff', fontSize: '20px', fontWeight: 700 }
        }
      }
    }
  },
  tooltip: { y: { formatter: (val) => val + ' kg CO₂' } },
  theme: { mode: 'dark' },
  chart: { background: 'transparent', toolbar: { show: false } }
}

// ─── ACTIONS DE LA SEMAINE (Bar) ─────────────────────────────────
const barSeries = computed(() => {
  const categories = ['Transport', 'Alimentation']
  const derniersSeptJours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
  return categories.map(cat => ({
    name: cat,
    data: derniersSeptJours.map(date =>
      rawData.value
        .filter(item => item.date === date && item.categorie === cat)
        .reduce((sum, item) => sum + item.co2, 0)
    )
  }))
})

const barOptions = {
  chart: { background: 'transparent', toolbar: { show: false }, stacked: false },
  colors: ['#4ECDC4', '#F6D6D6'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '55%' } },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    labels: { style: { colors: '#8792A4' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#8792A4' } } },
  grid: { borderColor: '#373E4E', strokeDashArray: 4 },
  legend: { show: false },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark', y: { formatter: (val) => val + ' kg' } },
  theme: { mode: 'dark' },
}

// ─── ÉVOLUTION MENSUELLE (Line) ───────────────────────────────────
const lineSeries = computed(() => {
  const categories = ['Transport', 'Alimentation', 'Energie']
  const derniers30Jours = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return d.toISOString().split('T')[0]
  })
  return categories.map(cat => ({
    name: cat,
    data: derniers30Jours.map(date =>
      rawData.value
        .filter(item => item.date === date && item.categorie === cat)
        .reduce((sum, item) => sum + item.co2, 0)
    )
  }))
})

const lineOptions = {
  chart: { background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
  colors: ['#F96750', '#F6D6D6', '#4ECDC4'],
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    categories: Array.from({ length: 30 }, (_, i) => i + 1),
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: { labels: { style: { colors: '#8792A4' } } },
  grid: { borderColor: '#373E4E', strokeDashArray: 4 },
  legend: { show: false },
  dataLabels: { enabled: false },
  tooltip: { theme: 'dark', y: { formatter: (val) => val + ' kg' } },
  theme: { mode: 'dark' },
}

// ─── CALENDRIER (Heatmap) ─────────────────────────────────────────
const heatmapSeries = computed(() => {
  const jours = ['Dim', 'Sam', 'Ven', 'Jeu', 'Mer', 'Mar', 'Lun']

  const scoreMap = {}
  for (const item of rawData.value) {
    if (!scoreMap[item.date]) scoreMap[item.date] = 0
    scoreMap[item.date] += item.co2
  }

  return jours.map((jour, jourIndex) => {
    const data = []
    const today = new Date()

    for (let semaine = 15; semaine >= 0; semaine--) {
      const date = new Date(today)
      const diff = semaine * 7 + (today.getDay() - (6 - jourIndex))
      date.setDate(today.getDate() - diff)

      const dateStr = date.toISOString().split('T')[0]
      const co2 = scoreMap[dateStr] ?? 0
      const score = co2 === 0 ? 0 : Math.max(0, Math.min(100, Math.round(100 - co2 * 5)))

      data.push({ x: `S${16 - semaine}`, y: score })
    }

    return { name: jour, data }
  })
})

const heatmapOptions = {
  chart: { background: 'transparent', toolbar: { show: false }, zoom: { enabled: false } },
  dataLabels: { enabled: false },
  colors: ['#4CAF50'],
  plotOptions: {
    heatmap: {
      radius: 3,
      enableShades: true,
      shadeIntensity: 0.8,
      colorScale: {
        ranges: [
          { from: 0,  to: 0,   color: '#222631', name: 'Aucune donnée' },
          { from: 1,  to: 30,  color: '#F96750', name: 'À améliorer' },
          { from: 31, to: 60,  color: '#FFD166', name: 'Correct' },
          { from: 61, to: 80,  color: '#81C784', name: 'Bien' },
          { from: 81, to: 100, color: '#4CAF50', name: 'Excellent' },
        ]
      }
    }
  },
  xaxis: {
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: '#8792A4', fontSize: '10px' } }
  },
  grid: { show: false },
  legend: { show: false },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => {
        if (val === 0) return 'Aucune donnée'
        if (val <= 30) return `Score ${val} — À améliorer`
        if (val <= 60) return `Score ${val} — Correct`
        if (val <= 80) return `Score ${val} — Bien`
        return `Score ${val} — Excellent`
      }
    }
  },
  theme: { mode: 'dark' },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.dashboard-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  padding: 48px 16px 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 8px;
}

.back-btn {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: #c8d0da;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.back-btn:hover { color: #ffffff; }
.back-btn svg { width: 22px; height: 22px; }

.title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.card {
  background-color: #2a3242;
  border-radius: 16px;
  padding: 16px;
  animation: fadeUp 0.5s ease both;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
}

.loader {
  text-align: center;
  color: #8792A4;
  font-size: 0.85rem;
  padding: 24px 0;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.82rem;
  color: #c8d0da;
  flex: 1;
}

.legend-value {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>