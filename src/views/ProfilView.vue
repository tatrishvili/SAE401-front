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
      <p class="xp-text">{{ userXp }} XP</p>
    </section>

    <section v-if="isEditingAvatar" class="avatar-picker card">
      <h3>Choisir un Avatar</h3>
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
            <span>{{ avatar.required }} {{ avatar.type === 'xp' ? 'XP' : 'j' }}</span>
          </div>
        </div>
      </div>
    </section>

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

    <button v-if="!isEditingAvatar" class="logout-btn" @click="handleLogout">Déconnexion</button>

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

// "name" in the DB is the pseudo the user typed at registration
const pseudo = computed(() =>
    auth.user.value?.name || auth.user.value?.email || 'Utilisateur'
)

const userXp = ref(150)
const joursConnexion = ref(5)
const selectedAvatar = ref(0)
const isEditingAvatar = ref(false)

onMounted(() => {
  auth.fetchUserProfile()
})

const avatars = [
  { id: 0,  src: baseAvatar,  type: 'base', required: 0,   name: 'Base' },
  { id: 1,  src: crownChoc,   type: 'days', required: 1,   name: 'Couronne Chocolat' },
  { id: 2,  src: crownBronz,  type: 'days', required: 3,   name: 'Couronne Bronze' },
  { id: 3,  src: crownSilv,   type: 'days', required: 7,   name: 'Couronne Argent' },
  { id: 4,  src: crownGold,   type: 'days', required: 10,  name: 'Couronne Or' },
  { id: 5,  src: crownDiam,   type: 'days', required: 25,  name: 'Couronne Diamant' },
  { id: 6,  src: badgeMus,    type: 'xp',   required: 10,  name: 'Moustache' },
  { id: 7,  src: badgeGla,    type: 'xp',   required: 25,  name: 'Lunettes' },
  { id: 8,  src: badgeSun,    type: 'xp',   required: 50,  name: 'Lunettes de Soleil' },
  { id: 9,  src: badgeMon,    type: 'xp',   required: 100, name: 'Monocle' },
  { id: 10, src: badgeCac,    type: 'xp',   required: 150, name: 'Cache-oreille' },
  { id: 11, src: badgeFlo,    type: 'xp',   required: 200, name: 'Fleurs' },
  { id: 12, src: badgeChr,    type: 'xp',   required: 250, name: 'Noël' },
  { id: 13, src: badgeDee,    type: 'xp',   required: 350, name: 'Cerf' },
  { id: 14, src: badgePir,    type: 'xp',   required: 500, name: 'Pirate' },
]

function isAvatarLocked(avatar) {
  if (avatar.type === 'base') return false
  if (avatar.type === 'days') return joursConnexion.value < avatar.required
  if (avatar.type === 'xp')   return userXp.value < avatar.required
  return false
}

function selectAvatar(avatar) {
  if (!isAvatarLocked(avatar)) {
    selectedAvatar.value = avatar.id
    isEditingAvatar.value = false
  }
}

const currentAvatarSrc = computed(() => {
  const found = avatars.find(a => a.id === selectedAvatar.value)
  return found ? found.src : avatars[0].src
})

const earnedBadges = computed(() =>
    avatars.filter(a => a.type === 'xp' && userXp.value >= a.required)
)

function handleLogout() {
  auth.logout()
  router.push('/connexion')
}
</script>