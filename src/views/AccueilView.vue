<template>
  <div class="accueil-screen">

    <!-- Header -->
    <h1 class="title">Accueil</h1>

    <!-- Production quotidienne -->
    <div class="card production-card">
      <span class="production-label">Production quotidienne :</span>
      <span class="production-value">{{ productionCO2 !== null ? productionCO2 + ' kg' : '– – –' }} CO2</span>
    </div>

    <!-- Graphique placeholder -->
    <div class="card chart-card">
      <!-- TODO: intégrer un vrai graphique (ex: Chart.js / vue-chartjs) -->
    </div>

    <!-- Défi du jour -->
    <div class="card defi-card">
      <p class="card-label">Défi du jour</p>
      <p class="card-text">{{ defi }}</p>
    </div>

    <!-- Conseil -->
    <div class="card conseil-card">
      <p class="card-label">Conseil</p>
      <p class="card-text">{{ conseil.text }}</p>
    </div>

    <!-- Bouton -->
    <button class="action-btn" @click="router.push('/calculateur')">
      Entrer une action
    </button>

    <!-- Navbar -->
    <nav class="navbar">
      <button class="nav-btn active" @click="router.push('/home')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      </button>
      <button class="nav-btn" @click="router.push('/calculateur')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M8 7h8M8 11h8M8 15h4"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </button>
      <button class="nav-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"/>
        </svg>
      </button>
    </nav>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import conseils from '@/data/conseils-home.json'

const router = useRouter()

// Production CO2 (null = pas encore calculée)
const productionCO2 = ref(null)

// Défi du jour (statique pour l'instant)
const defi = ref('Ne mangez qu\'une seule fois de la viande.')

// Conseil aléatoire à chaque chargement
const conseil = ref({ text: '', title: '' })

onMounted(() => {
  const index = Math.floor(Math.random() * conseils.length)
  conseil.value = conseils[index]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.accueil-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 100px;
  box-sizing: border-box;
  gap: 14px;
  animation: fadeUp 0.5s ease both;
}

/* Title */
.title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 4px;
  text-align: center;
}

/* Cards */
.card {
  background-color: #2a3242;
  border-radius: 16px;
  padding: 16px 20px;
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
}

.production-card {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.production-label {
  font-size: 0.95rem;
  color: #c8d0da;
  font-weight: 600;
}

.production-value {
  font-size: 0.95rem;
  color: #7a8899;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Chart placeholder */
.chart-card {
  height: 140px;
}

/* Défi & Conseil */
.card-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 6px;
}

.card-text {
  font-size: 0.85rem;
  color: #9aaabb;
  margin: 0;
  line-height: 1.5;
}

/* Action button */
.action-btn {
  background-color: #f07050;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  padding: 16px 0;
  width: 100%;
  max-width: 400px;
  cursor: pointer;
  margin-top: 6px;
  box-shadow: 0 4px 20px rgba(240, 112, 80, 0.35);
  transition: background-color 0.2s, transform 0.15s;
}

.action-btn:hover {
  background-color: #e05f40;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(1px);
}

/* Navbar */
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #242d3a;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0 20px;
  border-top: 1px solid #2e3a4a;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #5a6a7a;
  padding: 4px 12px;
  transition: color 0.2s;
}

.nav-btn svg {
  width: 24px;
  height: 24px;
  display: block;
}

.nav-btn.active {
  color: #ffffff;
}

.nav-btn:hover {
  color: #c8d0da;
}

/* Animation */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>