<template>
  <div class="accueil">

    <div class="card production">
      <h2>Production quotidienne : <span>-- kg CO2</span></h2>
    </div>

    <div class="card graphique">
      <apexchart
        type="radialBar"
        :options="scoreOptions"
        :series="scoreSeries"
        height="220"
      />
    </div>

    <div class="card defi">
      <h2>Défi du jour</h2>
      <p>Ne manger qu'une seule fois de la viande.</p>
    </div>

    <div class="card conseil">
      <h2>Conseil du jour</h2>
      <p>{{ conseilDuJour }}</p>
    </div>

    <RouterLink to="/calculateur" class="btn">
      Entrer une action
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const rawData = ref([])

onMounted(async () => {
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
  }
})

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

const conseils = [
  "Manger moins de viande aide à baisser sa production de CO2, et est également bon pour la santé.",
  "Préférer les transports en commun réduit significativement ton empreinte carbone.",
  "Éteindre les appareils en veille peut réduire ta consommation électrique de 10%.",
  "Acheter local et de saison diminue l'impact lié au transport des aliments.",
]

// Change à chaque chargement de page
const conseilDuJour = ref(conseils[Math.floor(Math.random() * conseils.length)])
</script>
<style>

</style>