<template>
  <main class="path-container">
    <Transition name="bounce">
      <div v-if="showToast" class="custom-toast" :class="toastType">
        <div class="toast-content">
          <span class="toast-icon">{{ toastType === 'error' ? '⚠️' : '🎉' }}</span>
          <div class="toast-text">
            <span class="toast-title">{{ toastType === 'error' ? 'Oups !' : 'Cool !' }}</span>
            <span class="toast-msg">{{ toastMessage }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <header class="header">
      <h1>Mon Parcours Éco</h1>
      <div class="stats">
        <span>🌱 {{ unlockedCount }} / {{ steps.length }} Jours</span>
      </div>
      <button class="badges-link" @click="openBadges">
        <span v-if="hasNewBadges" class="badges-dot"></span>
        Voir mes badges
      </button>
    </header>

    <div class="scroll-area">
      <div v-if="steps.length === 0" class="loading">Chargement du parcours...</div>

      <div v-for="(step, index) in steps" :key="step.id" class="step-item">
        <div
          class="node"
          :class="{
            locked: !step.isUnlocked,
            completed: step.isCompleted,
          }"
          :style="{ transform: `translateX(${calculateOffset(index)}px)` }"
          @click="handleStepClick(step)"
        >
          <div class="node-circle">
            <span class="step-number">{{ step.position }}</span>
            <span v-if="!step.isUnlocked" class="lock-icon">🔒</span>
            <span v-if="step.isCompleted" class="check-icon">✓</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const steps = ref([])
const router = useRouter()
const route = useRoute()
const hasNewBadges = ref(false)
const currentUnlockedBadges = ref(0)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const BADGE_SEEN_KEY = 'seenUnlockedBadgesCount'
const BADGES_THRESHOLDS = [25, 60, 100, 180, 260, 400]

// États pour la notification "Toast"
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('error')
let toastTimeoutId = null

const unlockedCount = computed(() => steps.value.filter((s) => s.isUnlocked).length)
const calculateOffset = (index) => Math.sin(index * 1.0) * 60

// Fonction pour déclencher le message joli
const triggerToast = (msg, type = 'error') => {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId)
  }

  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  // Disparaît automatiquement après 3 secondes
  toastTimeoutId = setTimeout(() => {
    showToast.value = false
  }, 3500)
}

const handleStepClick = async (step) => {
  if (!step.isUnlocked) {
    triggerToast('Ce jour est encore verrouillé !', 'error')
    return
  }

  if (step.isCompleted) {
    router.push(`/challenges/${step.id}`)
    return
  }

  try {
    await api.get(`/steps/${step.id}/challenges`)
    router.push(`/challenges/${step.id}`)
  } catch (error) {
    if (error.response && error.response.status === 403) {
      // Ton message personnalisé pour les 24h
      triggerToast('Pas encore disponible ! Reviens après 24h.', 'error')
    } else {
      triggerToast('Erreur de connexion au serveur.', 'error')
    }
  }
}

const toValidNumber = (...values) => {
  for (const value of values) {
    const num = Number(value)
    if (Number.isFinite(num) && num >= 0) {
      return num
    }
  }

  return null
}

const computeUnlockedByXp = (xpValue) =>
  BADGES_THRESHOLDS.filter((threshold) => xpValue >= threshold).length

const resolveXpForNotification = async (stepsData) => {
  const token = localStorage.getItem('token')

  try {
    const response = await fetch(`${API_BASE}/me/stats`, {
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (response.ok) {
      const payload = await response.json()
      const data = payload?.data ?? payload

      const xpFromApi = toValidNumber(
        data?.xp,
        data?.totalXp,
        data?.xpTotal,
        data?.experience,
        data?.experienceTotal,
        data?.points,
        data?.progress?.xp,
        data?.progress?.totalXp,
        payload?.xp,
        payload?.totalXp,
      )

      if (xpFromApi !== null) {
        return xpFromApi
      }
    }
  } catch {
    // fallback on steps below
  }

  const completedCount = Array.isArray(stepsData)
    ? stepsData.filter((step) => step?.isCompleted).length
    : 0
  return completedCount * 25
}

const updateBadgesNotification = async (stepsData) => {
  const xpValue = await resolveXpForNotification(stepsData)
  const unlockedCountByXp = computeUnlockedByXp(xpValue)
  currentUnlockedBadges.value = unlockedCountByXp
  const seenCount = Number(localStorage.getItem(BADGE_SEEN_KEY) || 0)
  hasNewBadges.value = unlockedCountByXp > seenCount
}

const openBadges = () => {
  localStorage.setItem(BADGE_SEEN_KEY, String(currentUnlockedBadges.value))
  hasNewBadges.value = false
  router.push('/badges')
}

onMounted(async () => {
  try {
    const stepsResponse = await api.get('/steps')
    steps.value = stepsResponse.data
    await updateBadgesNotification(stepsResponse.data)

    if (route.query.validated === 'true') {
      const gainedXp = Number(route.query.gainedXp ?? 0)
      const successMessage =
        gainedXp > 0
          ? `Journée validée avec succès ! +${gainedXp} XP gagnés aujourd'hui.`
          : 'Journée validée avec succès ! À demain.'
      triggerToast(successMessage, 'success')
      router.replace({ path: '/' })
    }
  } catch (error) {
    console.error('Erreur chargement étapes:', error)
  }
})
</script>

<style scoped lang="scss">
@use '@/assets/variables' as v;

/* --- STYLE DU MESSAGE FLOTTANT (TOAST) --- */
.custom-toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 12px 25px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(v.$black, 0.4);
  min-width: 300px;
  border: 2px solid rgba(v.$text-white, 0.2);

  &.error {
    background: v.$danger;
  }

  &.success {
    background: v.$success;
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .toast-icon {
    font-size: 1.8rem;
  }

  .toast-text {
    display: flex;
    flex-direction: column;
  }

  .toast-title {
    font-weight: 800;
    font-size: 1.1rem;
    color: v.$text-white;
  }

  .toast-msg {
    font-size: 0.9rem;
    color: rgba(v.$text-white, 0.9);
  }
}

/* Animation "Bounce" (Rebond) */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: translate(-50%, -100px) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, 20px) scale(1.1);
  }
  100% {
    transform: translate(-50%, 0) scale(1);
    opacity: 1;
  }
}
.path-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 10px;
  min-height: 100vh;
  background-color: v.$bg-dark;
  color: v.$text-white;
  font-family: 'Inter', sans-serif;
}

.header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 60px;
}

.badges-link {
  position: relative;
  background: #f96750;
  color: v.$text-white;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(v.$black, 0.2);
}

.badges-dot {
  position: absolute;
  top: -4px;
  left: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff2c2c;
  border: 2px solid v.$text-white;
}

.stats {
  background: v.$card-bg;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: v.$text-muted;
  border: 1px solid v.$card-border;
  margin-top: 10px;
  display: inline-block;
}

.scroll-area {
  display: flex;
  flex-direction: column;
  gap: 50px;
  width: 100%;
  max-width: 400px;
}

.step-item {
  display: flex;
  justify-content: center;
}

.node {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;

  .node-circle {
    width: 75px;
    height: 75px;
    background-color: v.$text-muted;
    border-radius: 50%;
    box-shadow: 0 6px 0 v.$card-border;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .step-number {
      font-size: 1.8rem;
      font-weight: 900;
      color: v.$text-white;
    }

    .check-icon {
      position: absolute;
      top: -5px;
      right: -5px;
      background: v.$eco-green-dark;
      color: v.$text-white;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      border: 3px solid v.$bg-dark;
    }

    .lock-icon {
      position: absolute;
      bottom: 8px;
      right: 8px;
      font-size: 0.8rem;
    }
  }

  &.locked {
    .node-circle {
      background-color: v.$status-btn-bg;
      box-shadow: 0 6px 0 v.$locked-shadow;

      .step-number {
        color: v.$step-locked-text;
      }
    }
  }

  &.completed {
    .node-circle {
      background-color: v.$eco-green;
      box-shadow: 0 6px 0 v.$eco-green-mid;

      .step-number {
        color: v.$olive-text;
      }
    }
  }

  &:active:not(.locked) {
    transform: scale(0.95);
  }
}

.loading {
  color: v.$text-muted;
  text-align: center;
}

@media (max-width: 640px) {
  .header {
    margin-bottom: 28px;
    gap: 12px;
  }

  .badges-link {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .stats {
    font-size: 0.82rem;
  }
}
</style>
