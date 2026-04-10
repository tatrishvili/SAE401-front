<template>
  <div class="welcome">

    <div class="content">
      <img src="../assets/icones/logo.svg" alt="">
      <h1>Bienvenue !</h1>
      <p>
        EcoCarbo est une application<br>complètement indépendante qui vous aide<br>à réduire votre production de CO2.
      </p>
    </div>


    <button class="continue-btn" @click="router.push('/connexion')">
    Continuer
    </button>


  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

</script>
