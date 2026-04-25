<template>
  <div class="accueil">
    <div class="card production">
      <h2>Production quotidienne : <span>{{ productionToday }} kg CO₂</span></h2>
    </div>
    <div class="card">
      <apexchart
          v-if="chartReady"
          type="radialBar"
          :options="scoreOptions"
          :series="scoreSeries"
          height="220"
      />
    </div>
    <div class="card defi">
      <h2>Défi du jour</h2>
      <p v-if="defiDuJour">{{ defiDuJour.description || defiDuJour.title }}</p>
      <p v-else>Chargement…</p>
    </div>
    <div class="card conseil">
      <h2>Conseil du jour</h2>
      <p v-if="conseilDuJour">{{ conseilDuJour.text }}</p>
      <p v-else>Chargement…</p>
    </div>
    <RouterLink to="/calculateur" class="btn">
      Entrer une action
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const { fetchEntries, isLoggedIn } = useAuth()
const { fetchApi } = useApi()

const rawData = ref([])
const chartReady = ref(false)
const defiDuJour = ref(null)
const conseilDuJour = ref(null)

function pickDailyItem(items) {
  if (!Array.isArray(items) || items.length === 0) return null
  const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return items[dayOfYear % items.length]
}

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      const entries = await fetchEntries()
      rawData.value = Array.isArray(entries) ? entries : []
    } catch (e) {
      console.error('Erreur chargement entrées :', e)
    }
  }

  try {
    const [challenges, tips] = await Promise.all([
      fetchApi('/challenges'),
      fetchApi('/tips')
    ])
    defiDuJour.value = pickDailyItem(challenges)
    conseilDuJour.value = pickDailyItem(tips)
  } catch (e) {
    console.error('Erreur chargement défi/conseil :', e)
  }

  chartReady.value = true
})

const productionToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const total = rawData.value
      .filter(entry => {
        const entryDay = (entry.entryDate ?? entry.date ?? '').substring(0, 10)
        return entryDay === today
      })
      .reduce((sum, entry) => sum + (entry.co2Value ?? entry.co2 ?? 0), 0)
  return total > 0 ? total.toFixed(3) : '--'
})

const scoreValue = computed(() => {
  if (productionToday.value === '--') return 100
  const total = parseFloat(productionToday.value)
  return Math.max(0, Math.min(100, Math.round(100 - total * 5)))
})

const scoreSeries = computed(() => [scoreValue.value])

const chartColor = computed(() => {
  const val = scoreValue.value
  if (val >= 70) return ['#4CAF50', '#81C784']
  if (val >= 40) return ['#FFD166', '#FFB347']
  return ['#F96750', '#e05030']
})

const scoreOptions = computed(() => ({
  chart: {
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        size: '55%',
        background: 'transparent',
      },
      track: {
        background: '#373E4E',
        strokeWidth: '100%',
        margin: 0,
      },
      dataLabels: {
        show: true,
        name: {
          show: true,
          fontSize: '13px',
          fontWeight: 400,
          color: '#8792A4',
          offsetY: 30,
          formatter: () => "aujourd'hui",
        },
        value: {
          show: true,
          fontSize: '20px',
          fontWeight: 800,
          color: '#ffffff',
          offsetY: 0,
          formatter: (val) => {
            const n = parseInt(val)
            if (n >= 70) return ' Excellent'
            if (n >= 40) return ' Correct'
            return ' À améliorer'
          },
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      gradientToColors: [chartColor.value[1]],
      stops: [0, 100],
      colorStops: [
        { offset: 0,   color: chartColor.value[0], opacity: 1 },
        { offset: 100, color: chartColor.value[1], opacity: 1 },
      ],
    },
  },
  colors: [chartColor.value[0]],
  stroke: { lineCap: 'round' },
  theme: { mode: 'dark' },
}))

</script>

<style></style>