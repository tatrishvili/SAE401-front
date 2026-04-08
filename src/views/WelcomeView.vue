<template>
  <div class="welcome-screen">
    <div class="content">
      <div class="koala-container">
        <div class="koala-circle">
          <!-- Koala SVG à mettre img -->
        </div>
      </div>

      <h1 class="title">Bienvenue&nbsp;!</h1>

      <p class="description">
        EcoCarbo est une application complètement indépendante qui vous aide
        à réduire votre production de CO2.
      </p>
    </div>

    <div class="footer">
    <button class="continue-btn" @click="router.push('/connexion')">
  Continuer
</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

</script>
