<template>
  <div class="profile-page">

    <section class="avatar-section">
      <div class="avatar-wrapper">
        <button class="edit-avatar-btn" @click="isEditingAvatar = !isEditingAvatar">
          <img src="../assets/icones/modifier.png" alt="Modifier">
        </button>
        <div class="avatar-circle">
          <img :src="currentAvatarSrc" alt="Avatar" />
        </div>
      </div>
      <h2 class="username">{{ pseudo }}</h2>
      <div class="stats-badges">
        <span class="stat-pill">✨ {{ userXp }} XP</span>
        <span class="stat-pill">📅 {{ joursConnexion }} Jours</span>
      </div>
    </section>

    <section v-if="!isEditingAvatar" class="carbon-card card" @click="$router.push('/calculateur')">
      <div class="carbon-content">
        <h3>Mon Bilan Carbone</h3>
        <p>Calcule ton empreinte pour voir ton impact !</p>
      </div>
      <div class="carbon-arrow">➔</div>
    </section>

    <section v-if="isEditingAvatar" class="avatar-picker card">
      <div class="picker-header">
        <h3>Choisir un Avatar</h3>
        <button @click="isEditingAvatar = false" class="close-picker">✕</button>
      </div>
      <div class="avatars-grid">
        <div
            v-for="avatar in avatars"
            :key="avatar.id"
            class="avatar-option"
            :class="{ locked: isAvatarLocked(avatar), selected: selectedAvatar === avatar.id }"
            @click="selectAvatar(avatar)"
        >
          <img :src="avatar.src" :alt="avatar.name" />
          <div v-if="isAvatarLocked(avatar)" class="lock-overlay">
            🔒
            <span>{{ avatar.required }}{{ avatar.type === 'xp' ? 'XP' : 'j' }}</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="!isEditingAvatar" class="badges-container">
      <h3>Badges débloqués</h3>
      <div class="badges-list">
        <div v-for="badge in earnedBadges" :key="badge.id" class="badge">
          <div class="badge-icon-wrapper">
            <img :src="badge.src" alt="badge" class="badge-img" />
          </div>
          <span class="badge-name">{{ badge.name }}</span>
        </div>
        <div v-if="earnedBadges.length === 0" class="no-badges">
          <p>Continue tes défis pour gagner des badges !</p>
        </div>
      </div>
    </section>

    <button v-if="!isEditingAvatar" class="logout-btn" @click="handleLogout">
      Déconnexion
    </button>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

import baseAvatar from '../assets/icones/pdp.png'
import crownChoc from '../assets/icones/badge_crown-chocolate_avatar.png'
import crownBronz from '../assets/icones/badge_crown-bronze_avatar.png'
import crownSilv from '../assets/icones/badge_crown-silver_avatar.png'
import crownGold from '../assets/icones/badge_crown-gold_avatar.png'
import crownDiam from '../assets/icones/badge_crown-diamond_avatar.png'
import badgeMus from '../assets/icones/badge_mustache.png'
import badgeGla from '../assets/icones/badge_glasses.png'
import badgeSun from '../assets/icones/badge_sunglasses.png'
import badgeMon from '../assets/icones/badge_monocle.png'
import badgeCac from '../assets/icones/badge_cacheoreille.png'
import badgeFlo from '../assets/icones/badge_flowers.png'
import badgeChr from '../assets/icones/badge_christmas.png'
import badgeDee from '../assets/icones/badge_deer.png'
import badgePir from '../assets/icones/badge_pirate.png'

const router = useRouter()
const auth = useAuth()

const userXp = ref(0)
const joursConnexion = ref(0)
const isEditingAvatar = ref(false)
const selectedAvatar = ref(parseInt(localStorage.getItem('selectedAvatar') ?? '0'))

const pseudo = computed(() =>
    auth.user.value?.name || auth.user.value?.email || 'Éco-Héros'
)

const avatars = [
  { id: 0,  src: baseAvatar,  type: 'base', required: 0,    name: 'Base' },
  { id: 1,  src: crownChoc,   type: 'days', required: 1,    name: 'Chocolat' },
  { id: 2,  src: crownBronz,  type: 'days', required: 3,    name: 'Bronze' },
  { id: 3,  src: crownSilv,   type: 'days', required: 7,    name: 'Argent' },
  { id: 4,  src: crownGold,   type: 'days', required: 10,   name: 'Or' },
  { id: 5,  src: crownDiam,   type: 'days', required: 25,   name: 'Diamant' },
  { id: 6,  src: badgeMus,    type: 'xp',   required: 50,   name: 'Moustache' },
  { id: 7,  src: badgeGla,    type: 'xp',   required: 150,  name: 'Lunettes' },
  { id: 8,  src: badgeSun,    type: 'xp',   required: 300,  name: 'Soleil' },
  { id: 9,  src: badgeMon,    type: 'xp',   required: 500,  name: 'Monocle' },
  { id: 10, src: badgeCac,    type: 'xp',   required: 750,  name: 'Hiver' },
  { id: 11, src: badgeFlo,    type: 'xp',   required: 1000, name: 'Printemps' },
  { id: 12, src: badgeChr,    type: 'xp',   required: 1500, name: 'Noël' },
  { id: 13, src: badgeDee,    type: 'xp',   required: 2000, name: 'Cerf' },
  { id: 14, src: badgePir,    type: 'xp',   required: 3000, name: 'Pirate' },
]

onMounted(async () => {
  if (!auth.isLoggedIn.value) {
    router.push('/connexion')
    return
  }
  await auth.fetchUserProfile()
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
  const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

  try {
    const statsRes = await fetch(`${API_URL}/me/stats`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    })
    if (statsRes.ok) {
      const stats = await statsRes.json()
      userXp.value = Number(stats?.xp ?? 0)
    }
    const stepsRes = await fetch(`${API_URL}/steps`, {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
    })
    if (stepsRes.ok) {
      const stepsData = await stepsRes.json()
      const stepList = Array.isArray(stepsData) ? stepsData : (stepsData?.data ?? [])
      joursConnexion.value = stepList.filter(s => s.isCompleted).length
    }
  } catch (err) {
    console.error('Erreur chargement profil:', err)
  }
})

function isAvatarLocked(avatar) {
  if (avatar.type === 'base') return false
  if (avatar.type === 'days') return joursConnexion.value < avatar.required
  if (avatar.type === 'xp')   return userXp.value < avatar.required
  return false
}

function selectAvatar(avatar) {
  if (!isAvatarLocked(avatar)) {
    selectedAvatar.value = avatar.id
    localStorage.setItem('selectedAvatar', avatar.id)
    isEditingAvatar.value = false
  }
}

const currentAvatarSrc = computed(() => {
  const found = avatars.find(a => a.id === selectedAvatar.value)
  return found ? found.src : avatars[0].src
})

const earnedBadges = computed(() =>
    avatars.filter(a => a.id !== 0 && !isAvatarLocked(a))
)

function handleLogout() {
  localStorage.removeItem('selectedAvatar')
  auth.logout()
  router.push('/connexion')
}
</script>

<style scoped lang="scss">
.profile-page {
  background-color: #1e2530;
  width: 100%;
  padding: 40px 20px 100px 20px;
  color: white;
  font-family: 'Nunito', sans-serif;
  display: flex;
  flex-direction: column;
  gap: 30px;
  box-sizing: border-box;
}

.avatar-section {
  text-align: center;
  .avatar-wrapper {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto 15px;
    .avatar-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #373e4e;
      border: 4px solid #3d5150;
      overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; }
    }
    .edit-avatar-btn {
      all: unset;
      position: absolute;
      bottom: 0;
      right: 0;
      background: #728e8d;
      border-radius: 50%;
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 2;
      img { width: 18px; }
    }
  }
  .username { margin: 0 0 10px 0; font-size: 1.5rem; font-weight: 800; }
  .stats-badges {
    display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;
    .stat-pill {
      background: rgba(255,255,255,0.1);
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
    }
  }
}

/* CARBON CARD STYLE */
.carbon-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #3d5150;

  &:active { transform: scale(0.98); }

  .carbon-content {
    h3 { margin: 0; font-size: 1.1rem; color: #8691a3; }
    p { margin: 5px 0 0; font-size: 0.85rem; color: #c8d0da; }
  }
  .carbon-arrow {
    color: #8590a2;
    font-size: 1.2rem;
    font-weight: bold;
  }
}

.card {
  background: #2a3242;
  border-radius: 20px;
  padding: 20px;
}

.picker-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
  h3 { margin: 0; font-size: 1.1rem; }
  .close-picker { all: unset; color: #8792a4; font-size: 1.2rem; cursor: pointer; padding: 4px 8px; }
}

.avatars-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 15px;
  .avatar-option {
    aspect-ratio: 1; position: relative; cursor: pointer;
    img { width: 100%; border-radius: 12px; transition: transform 0.2s; }
    &.selected img { border: 3px solid #F96750; transform: scale(1.1); }
    &.locked {
      opacity: 0.5; cursor: not-allowed;
      .lock-overlay {
        position: absolute; inset: 0; background: rgba(0,0,0,0.6);
        border-radius: 12px; display: flex; flex-direction: column;
        align-items: center; justify-content: center; font-size: 1rem;
        span { font-size: 0.6rem; color: #F96750; margin-top: 2px; }
      }
    }
  }
}

.badges-container {
  h3 { font-size: 1.1rem; margin: 0 0 15px 0; color: #c8d0da; }
  .badges-list {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;
    .badge {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      .badge-icon-wrapper {
        width: 60px; height: 60px; background: #373e4e; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        img { width: 40px; }
      }
      .badge-name { font-size: 0.75rem; text-align: center; color: #c8d0da; }
    }
  }
  .no-badges { grid-column: span 3; text-align: center; color: #8792a4; padding: 20px; font-size: 0.9rem; p { margin: 0; } }
}

.logout-btn {
  all: unset; display: block; width: 100%; box-sizing: border-box; background: transparent;
  border: 2px solid #F96750; color: #F96750; padding: 14px; border-radius: 15px;
  font-weight: 800; cursor: pointer; text-align: center; font-size: 1rem; transition: all 0.2s;
  &:hover { background: #F96750; color: white; }
}
</style>