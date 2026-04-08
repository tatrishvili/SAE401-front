<template>
  <div class="accueil">

    <div class="card production">
      <h2>Production quotidienne : <span>-- kg CO2</span></h2>
    </div>

    <div class="card graphique">
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
import { ref } from 'vue'

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