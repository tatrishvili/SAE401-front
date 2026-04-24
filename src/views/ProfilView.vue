<script setup>
import { ref, computed } from 'vue'

import baseAvatar from '../assets/icones/pdp.png'

// Avatars Couronnes (Jours)
import crownChoc from '../assets/icones/badge_crown-chocolate_avatar.png'
import crownBronz from '../assets/icones/badge_crown-bronze_avatar.png'
import crownSilv from '../assets/icones/badge_crown-silver_avatar.png'
import crownGold from '../assets/icones/badge_crown-gold_avatar.png'
import crownDiam from '../assets/icones/badge_crown-diamond_avatar.png'

// Avatars Badges (XP)
import badgeMus from '../assets/icones/badge_mustache.png'
import badgeGla from '../assets/icones/badge_glasses.png'
import badgeSun from '../assets/icones/badge_sunglasses.png'
import badgeMon from '../assets/icones/badge_monocle.png'
import badgeCac from '../assets/icones/badge_cacheoreille.png'
import badgeFlo from '../assets/icones/badge_flowers.png'
import badgeChr from '../assets/icones/badge_christmas.png'
import badgeDee from '../assets/icones/badge_deer.png'
import badgePir from '../assets/icones/badge_pirate.png'

const user = ref({
  name: 'M. Patate',
  xp: 150, // Test avec 15 XP
  joursConnexion: 5, // Test avec 5 jours
  avatar: 0 
})

// Variable d'état pour ouvrir fermer le menu d'avatars
const isEditingAvatar = ref(false)

// Liste globale de toutes les images pour l'avatar
const avatars = [
  { id: 0, src: baseAvatar, type: 'base', required: 0, name: 'Base' },
  // Jours de connexion
  { id: 1, src: crownChoc, type: 'days', required: 1, name: 'Couronne Chocolat' },
  { id: 2, src: crownBronz, type: 'days', required: 3, name: 'Couronne Bronze' },
  { id: 3, src: crownSilv, type: 'days', required: 7, name: 'Couronne Argent' },
  { id: 4, src: crownGold, type: 'days', required: 10, name: 'Couronne Or' },
  { id: 5, src: crownDiam, type: 'days', required: 25, name: 'Couronne Diamant' },
  // XP
  { id: 6, src: badgeMus, type: 'xp', required: 10, name: 'Moustache' },
  { id: 7, src: badgeGla, type: 'xp', required: 25, name: 'Lunettes' },
  { id: 8, src: badgeSun, type: 'xp', required: 50, name: 'Lunettes de Soleil' },
  { id: 9, src: badgeMon, type: 'xp', required: 100, name: 'Monocle' },
  { id: 10, src: badgeCac, type: 'xp', required: 150, name: 'Cache-oreille' },
  { id: 11, src: badgeFlo, type: 'xp', required: 200, name: 'Fleurs' },
  { id: 12, src: badgeChr, type: 'xp', required: 250, name: 'Noël' },
  { id: 13, src: badgeDee, type: 'xp', required: 350, name: 'Cerf' },
  { id: 14, src: badgePir, type: 'xp', required: 500, name: 'Pirate' },
]

function isAvatarLocked(avatar) {
  if (avatar.type === 'base') return false;
  if (avatar.type === 'days') return user.value.joursConnexion < avatar.required;
  if (avatar.type === 'xp') return user.value.xp < avatar.required;
  return false;
}

function selectAvatar(avatar) {
  if (!isAvatarLocked(avatar)) {
    user.value.avatar = avatar.id;
    isEditingAvatar.value = false; // Ferme le modal après sélection
  }
}

// Récupère l'image de l'avatar sélectionné
const currentAvatarSrc = computed(() => {
  const found = avatars.find(a => a.id === user.value.avatar)
  return found ? found.src : avatars[0].src
})

const earnedBadges = computed(() => {
  // Garde uniquement les badges type XP pour la section Badges bloqués / débloqués plus bas
  return avatars.filter(a => a.type === 'xp' && user.value.xp >= a.required)
})

</script>

<template>
  <div class="profile-page">

    <section class="avatar-section">
      <div class="avatar-wrapper">
        <!-- Bouton flottant sur l'avatar -->
        <button class="edit-avatar-btn" @click="isEditingAvatar = !isEditingAvatar">
          <img src="../assets/icones/modifier.png" alt="Modifier">
        </button>
        <div class="avatar-circle">
          <img :src="currentAvatarSrc" alt="Avatar" />
        </div>
      </div>
      <h2 class="username">{{ user.name }}</h2>
      <p class="xp-text">{{ user.xp }} XP</p>
    </section>

    <!-- Modal d'édition des Avatars (Apparaît au clic) -->
    <section v-if="isEditingAvatar" class="avatar-picker card">
      <h3>Choisir un Avatar</h3>
      <div class="avatars-grid">
        <div 
          v-for="avatar in avatars" 
          :key="avatar.id"
          class="avatar-option"
          :class="{ locked: isAvatarLocked(avatar), selected: user.avatar === avatar.id }"
          @click="selectAvatar(avatar)"
        >
          <img :src="avatar.src" :alt="avatar.name" />
          
          <!-- Cadenas si pas assez de jours ou d'XP -->
          <div v-if="isAvatarLocked(avatar)" class="lock-overlay">
            🔒
            <!-- Affichage conditionnel (j ou XP) -->
            <span>{{ avatar.required }} {{ avatar.type === 'xp' ? 'XP' : 'j' }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Badges Section -->
    <section v-if="!isEditingAvatar" class="badges-container">
      <h3>Badges débloqués</h3>
      <div class="badges-list">
        <div v-for="badge in earnedBadges" :key="badge.id" class="badge">
          <img :src="badge.src" alt="badge" class="badge-img" />
          <span class="badge-name">{{ badge.name }}</span>
        </div>
        <p v-if="earnedBadges.length === 0" class="no-badges">Aucun badge pour l'instant.</p>
      </div>
    </section>

    <button v-if="!isEditingAvatar" class="logout-btn">Déconnexion</button>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.profile-page {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  width: 100%;
  padding: 40px 16px 100px 16px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-sizing: border-box;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.edit-avatar-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #2a3242;
  border: 2px solid #4ECDC4;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.edit-avatar-btn:hover {
  transform: scale(1.1);
}

.edit-avatar-btn img {
  width: 16px;
  height: 16px;
  filter: invert(1);
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background-color: #4ECDC4;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 4px solid #2a3242;
}

.avatar-circle img {
  width: 80%;
  height: auto;
  object-fit: contain;
}

.username {
  font-size: 1.4rem;
  margin: 0 0 4px 0;
}

.xp-text {
  color: #4CAF50;
  font-weight: 800;
  font-size: 1.1rem;
  margin: 0;
}

/* AVATAR PICKER */
.card {
  background-color: #2a3242;
  border-radius: 16px;
  padding: 16px;
  text-align: left;
}

.avatar-picker {
  width: 100%;
  max-width: 400px;
  max-height: 55vh; /* Le scroll va se faire à l'intérieur de ce carré */
  overflow-y: auto;
  margin-bottom: 24px;
  padding-bottom: 50px; /* Plus de padding à l'intérieur de la carte */
  animation: fadeDown 0.3s ease;
  -webkit-overflow-scrolling: touch;
}

.avatar-picker h3 {
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  color: #c8d0da;
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.avatars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); /* Automatiquement responsive */
  gap: 16px; /* Aéré */
}

.avatar-option {
  position: relative;
  aspect-ratio: 1;
  background-color: #1e2530;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: all 0.2s;
}

.avatar-option img {
  width: 70%;
  height: auto;
}

.avatar-option.selected {
  border-color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.2);
}

.avatar-option:hover:not(.locked) {
  border-color: #4ECDC4;
  transform: scale(1.05);
}

.avatar-option.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.avatar-option.locked img {
  filter: grayscale(100%);
}

.lock-overlay {
  position: absolute;
  inset: 0;
  background-color: transparent; 
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.lock-overlay span {
  font-size: 0.75rem;
  color: #F96750;
  margin-top: 4px;
}

/* BADGES */
.badges-container {
  width: 100%;
  max-width: 400px;
  margin-bottom: 24px;
}

.badges-container h3 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #c8d0da;
  text-align: left;
}

.badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.badge {
  background-color: #2a3242;
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #373E4E;
  transition: transform 0.2s ease;
}

.badge:hover {
  transform: translateY(-2px);
}

.badge-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.badge-name {
  font-size: 0.9rem;
  font-weight: bold;
}

.no-badges {
  color: #8792A4;
  font-style: italic;
}

/* LOGOUT */
.logout-btn {
  background-color: #F96750;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: auto;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 400px;
}

.logout-btn:hover {
  background-color: #e05030;
}
</style>
