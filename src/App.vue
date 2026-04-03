<template>
  <main class="path-container">
    <header class="header">
      <h1>Mon Parcours Éco</h1>
      <div class="stats">
        <span>🌱 {{ steps.filter(s => s.isUnlocked).length }} / {{ steps.length }} Jours</span>
      </div>
    </header>

    <div class="scroll-area">
      <div v-for="(step, index) in steps" :key="step.id" class="step-item">
        <div 
          class="node" 
          :class="{ 'locked': !step.isUnlocked }"
          :style="{ transform: `translateX(${calculateOffset(index)}px)` }"
        >
          <div class="node-circle">
            <span class="step-number">{{ step.position }}</span>
          </div>
          
          <div v-if="step.position === 1 && step.isUnlocked" class="status-badge">
            START
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const steps = ref([])

const calculateOffset = (index) => {
  // Amplitude de 60px pour rester bien sur mobile
  return Math.sin(index * 1.0) * 60 
}

onMounted(async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/steps')
    if (response.ok) {
      steps.value = await response.json()
    }
  } catch (error) {
    console.error("Erreur API:", error)
  }
})
</script>

<style>
/* Tes couleurs personnalisées */
body {
  margin: 0;
  background-color: #222631; /* Couleur du site demandée */
  color: white;
  font-family: 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

.path-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 50px;
}

.stats {
  background: #2d323e;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #657084;
  border: 1px solid #657084;
}

.scroll-area {
  display: flex;
  flex-direction: column;
  gap: 45px; 
  width: 100%;
  max-width: 350px;
  padding-bottom: 100px;
}

.step-item {
  display: flex;
  justify-content: center;
  width: 100%;
}

.node {
  position: relative;
  display: flex;
  justify-content: center;
}

.node-circle {
  width: 65px;
  height: 65px;
  background-color: #657084; /* Couleur des cercles demandée */
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6px 0 #4a5363; /* Ombre pour l'effet 3D bouton */
  cursor: pointer;
  z-index: 2;
  transition: transform 0.1s;
}

.step-number {
  color: white; /* Numéros en blanc */
  font-size: 1.4rem;
  font-weight: 800;
}

/* Style pour les jours verrouillés (plus sombres) */
.node.locked .node-circle {
  background-color: #363b47;
  box-shadow: 0 6px 0 #252932;
}

.node.locked .step-number {
  color: #555; /* Numéro grisé si verrouillé */
}

/* Petit badge "START" comme sur l'image */
.status-badge {
  position: absolute;
  top: -30px;
  background: #657084;
  color: white;
  padding: 2px 10px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 1px;
}

.status-badge::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #657084;
}

.node-circle:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #4a5363;
}
</style>