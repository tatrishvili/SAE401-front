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
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800&display=swap');
 
.welcome-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 60px 32px 48px;
  box-sizing: border-box;
}
 
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  flex: 1;
  justify-content: center;
}
 
/* Koala circle */
.koala-container {
  animation: fadeDown 0.6s ease both;
}
 
.koala-circle {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
 
.koala-svg {
  width: 90px;
  height: 90px;
}
 
/* Title */
.title {
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  text-align: center;
  animation: fadeUp 0.6s 0.15s ease both;
}
 
/* Description */
.description {
  font-size: 1rem;
  font-weight: 400;
  color: #a0aab8;
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 280px;
  animation: fadeUp 0.6s 0.25s ease both;
}
 
/* Footer */
.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  animation: fadeUp 0.6s 0.4s ease both;
}
 
.continue-btn {
  background-color: #f07050;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  padding: 16px 0;
  width: 100%;
  max-width: 280px;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(240, 112, 80, 0.35);
}
 
.continue-btn:hover {
  background-color: #e05f40;
  box-shadow: 0 6px 24px rgba(240, 112, 80, 0.5);
  transform: translateY(-1px);
}
 
.continue-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(240, 112, 80, 0.3);
}
 
/* Animations */
@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
 
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
