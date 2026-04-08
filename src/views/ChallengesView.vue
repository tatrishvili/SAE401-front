<template>
  <div class="challenge-page">
    <Transition name="fade-toast">
      <div v-if="showToast" class="custom-toast success">
        <div class="toast-content">
          <span class="toast-icon">🎉</span>
          <div class="toast-text">
            <span class="toast-title">Cool !</span>
            <span class="toast-msg">{{ toastMessage }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="reward-pop">
      <div v-if="showTreasurePopup" class="reward-overlay" @click.self="closeTreasurePopup">
        <div class="reward-popup" role="dialog" aria-modal="true" aria-label="Recompense tresor">
          <p class="reward-kicker">Jour trésor</p>
          <h2>Félicitations !</h2>
          <p>
            Tu as atteint le jour {{ currentStepPosition }}.<br />
            Voici une récompense: <strong>+{{ treasureBonusXp }} XP</strong>.
          </p>
          <button type="button" class="reward-btn" @click="closeTreasurePopup">Super !</button>
        </div>
      </div>
    </Transition>

    <header class="header">
      <button @click="$router.push('/')" class="back-btn">←</button>
      <div class="title-group">
        <h1>Jour {{ currentStepPosition }}</h1>
        <p v-if="isAlreadyCompleted" class="status-done">✓ Journée complétée</p>
        <p v-else class="subtitle">Chaque geste compte pour la planète</p>
      </div>
    </header>

    <div class="challenges-list">
      <div v-if="loading" class="loading">Chargement de vos missions...</div>

      <div
        v-else
        v-for="(challenge, index) in challenges"
        :key="challengeKey(challenge, index)"
        class="challenge-card"
      >
        <div class="card-body">
          <div class="card-meta">
            <span class="category">{{ challenge.category }}</span>
            <div class="meta-right">
              <span class="reward">🌱 +{{ challenge.co2Reward }}kg CO2</span>
              <span class="xp-reward">+{{ getChallengeXp(challenge) }} XP</span>
            </div>
          </div>
          <h3>{{ challenge.title }}</h3>
          <p>{{ challenge.description }}</p>
        </div>

        <div class="card-actions" v-if="!isAlreadyCompleted">
          <button
            class="status-btn done"
            :class="{ active: getStatus(challengeKey(challenge, index)) === 'done' }"
            @click="setStatus(challengeKey(challenge, index), 'done', challenge)"
          >
            <div class="icon-circle">✓</div>
            <span>C'est fait !</span>
          </button>

          <button
            class="status-btn skip"
            :class="{ active: getStatus(challengeKey(challenge, index)) === 'skip' }"
            @click="setStatus(challengeKey(challenge, index), 'skip', challenge)"
          >
            <div class="icon-circle">✕</div>
            <span>Je ne peux pas</span>
          </button>
        </div>

        <div v-else class="card-footer-done">
          <span class="badge-done">Missions archivées</span>
        </div>
      </div>

      <div v-if="!loading && !isAlreadyCompleted && challenges.length > 0" class="actions-area">
        <button @click="validateDay" class="btn-primary">Valider ma journée</button>
      </div>

      <div v-if="!loading && isAlreadyCompleted" class="actions-area">
        <button @click="$router.push('/')" class="btn-back-home">Retour au parcours</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import {
  claimTreasureXpForStep,
  getTreasureXpForStep,
  setChallengeXpForStep,
} from '../services/xpLocal'

const route = useRoute()
const router = useRouter()
const challenges = ref([])
const loading = ref(true)
const isAlreadyCompleted = ref(false)
const currentStepPosition = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const showTreasurePopup = ref(false)
const treasureBonusXp = ref(0)
const currentStepId = ref(null)
const treasureNeedsClaim = ref(false)
const TREASURE_BONUS_XP = 50
let toastTimeoutId = null

// Stockage des choix (on ne met rien par défaut pour forcer un choix)
const challengeStatuses = ref({})

const isTreasurePosition = (position) => Number(position) === 1 || Number(position) % 5 === 0

const closeTreasurePopup = () => {
  if (treasureNeedsClaim.value && currentStepId.value) {
    const claimedAmount = claimTreasureXpForStep(currentStepId.value, TREASURE_BONUS_XP)
    treasureBonusXp.value = claimedAmount
    treasureNeedsClaim.value = false
  }

  showTreasurePopup.value = false
}

onMounted(async () => {
  try {
    const stepResponse = await api.get('/steps')
    const currentStep = stepResponse.data.find((s) => s.id == route.params.id)

    if (currentStep) {
      isAlreadyCompleted.value = currentStep.isCompleted
      currentStepPosition.value = currentStep.position
      currentStepId.value = Number(currentStep.id)

      const isTreasure = isTreasurePosition(currentStep.position)

      if (isTreasure) {
        const alreadyClaimed = getTreasureXpForStep(currentStepId.value)

        if (alreadyClaimed > 0) {
          treasureBonusXp.value = alreadyClaimed
        } else {
          treasureBonusXp.value = TREASURE_BONUS_XP
          showTreasurePopup.value = true
          treasureNeedsClaim.value = true
        }
      }
    }

    const response = await api.get(`/steps/${route.params.id}/challenges`)
    challenges.value = response.data
  } catch (error) {
    if (error.response && error.response.status === 403) {
      router.push('/')
    }
  } finally {
    loading.value = false
  }
})

const challengeKey = (challenge, index) => {
  const rawId = challenge?.id ?? challenge?.challengeId ?? challenge?.slug ?? 'mission'
  return `${String(rawId)}-${index}`
}

const getStatus = (key) => challengeStatuses.value[key]
const getChallengeXp = (challenge) => {
  const value = Number(
    challenge?.xp ?? challenge?.xpReward ?? challenge?.rewardXp ?? challenge?.points ?? 25,
  )
  return Number.isFinite(value) && value > 0 ? value : 25
}

const triggerSuccessToast = (message) => {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId)
  }

  toastMessage.value = message
  showToast.value = true
  toastTimeoutId = setTimeout(() => {
    showToast.value = false
  }, 2800)
}

const setStatus = (key, status, challenge) => {
  // Si on reclique sur le même, on peut décocher (optionnel)
  if (challengeStatuses.value[key] === status) {
    challengeStatuses.value[key] = null
  } else {
    challengeStatuses.value[key] = status

    if (status === 'done') {
      const xp = getChallengeXp(challenge)
      triggerSuccessToast(`T'as fait : ${challenge?.title || 'Défi validé'} (+${xp} XP)`)
    }
  }
}

const validateDay = async () => {
  try {
    const baseXp = challenges.value
      .filter((challenge, index) => getStatus(challengeKey(challenge, index)) === 'done')
      .reduce((total, challenge) => total + getChallengeXp(challenge), 0)

    if (currentStepId.value) {
      setChallengeXpForStep(currentStepId.value, baseXp)
    }

    const gainedXp = baseXp + treasureBonusXp.value

    await api.post(`/steps/${route.params.id}/unlock-next`)
    router.push({
      path: '/',
      query: {
        validated: 'true',
        gainedXp: String(gainedXp),
        treasureBonusXp: String(treasureBonusXp.value),
      },
    })
  } catch {
    console.error('Erreur validation')
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/variables' as v;

.custom-toast {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 10px 14px;
  border-radius: 16px;
  min-width: min(92vw, 360px);
  border: 2px solid rgba(v.$text-white, 0.18);
  box-shadow: 0 10px 24px rgba(v.$black, 0.35);

  &.success {
    background: linear-gradient(140deg, v.$success, v.$eco-green-dark);
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .toast-icon {
    font-size: 1.35rem;
  }

  .toast-text {
    display: flex;
    flex-direction: column;
  }

  .toast-title {
    font-size: 0.95rem;
    font-weight: 900;
    color: v.$text-white;
  }

  .toast-msg {
    font-size: 0.82rem;
    color: rgba(v.$text-white, 0.96);
  }
}

.fade-toast-enter-active,
.fade-toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.fade-toast-enter-from,
.fade-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

.reward-pop-enter-active,
.reward-pop-leave-active {
  transition: opacity 0.24s ease;
}

.reward-pop-enter-from,
.reward-pop-leave-to {
  opacity: 0;
}

.reward-overlay {
  position: fixed;
  inset: 0;
  background: rgba(249, 103, 80, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 1100;
}

.reward-popup {
  width: min(92vw, 420px);
  border-radius: 20px;
  border: 2px solid #f96750;
  padding: 22px 20px;
  background: linear-gradient(165deg, #f96750, #e85d47 58%, #cc533e);
  box-shadow: 0 18px 40px rgba(204, 83, 62, 0.48);
  text-align: center;
  color: v.$text-white;
  animation: reward-pop-in 0.32s ease;

  h2 {
    margin: 6px 0 10px;
    font-size: 1.6rem;
    color: v.$text-white;
  }

  p {
    margin: 0;
    line-height: 1.45;
    color: rgba(v.$text-white, 0.95);
  }
}

.reward-kicker {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffd0c6;
}

.reward-btn {
  margin-top: 18px;
  border: none;
  border-radius: 15px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 900;
  color: v.$text-white;
  background: linear-gradient(180deg, #ff8a73, #f96750);
  box-shadow: 0 5px 0 #cc533e;
  cursor: pointer;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 #cc533e;
  }
}

@keyframes reward-pop-in {
  0% {
    transform: scale(0.84);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.challenge-page {
  padding: 30px 20px;
  max-width: 600px;
  margin: 0 auto;
  color: v.$text-white;
  min-height: 100vh;
  background-color: v.$bg-dark;

  .header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;
  }

  .back-btn {
    background: v.$card-bg;
    border: 1px solid v.$card-border;
    color: v.$text-white;
    font-size: 1.2rem;
    padding: 10px 18px;
    border-radius: 15px;
    cursor: pointer;
  }

  .title-group {
    h1 {
      margin: 0;
      font-size: 1.8rem;
    }
  }

  .subtitle {
    color: v.$text-muted;
    margin: 5px 0 0;
    font-size: 0.9rem;
  }

  .status-done {
    color: v.$eco-green;
    font-weight: bold;
    margin: 5px 0 0;
  }
}

.challenge-card {
  background: v.$card-bg;
  border-radius: 24px;
  padding: 22px;
  margin-bottom: 20px;
  border: 1px solid v.$card-border;

  h3 {
    margin: 0 0 8px;
    font-size: 1.3rem;
  }

  p {
    color: v.$text-gray;
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 20px;
  }
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}

.meta-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.category {
  background: rgba(v.$eco-green, 0.1);
  color: v.$eco-green;
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: 800;
}

.reward {
  color: v.$eco-green-dark;
  font-weight: bold;
  font-size: 0.8rem;
}

.xp-reward {
  background: rgba(v.$success, 0.16);
  color: v.$success;
  font-weight: 800;
  border-radius: 999px;
  border: 1px solid rgba(v.$success, 0.35);
  padding: 3px 10px;
  font-size: 0.78rem;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.status-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: v.$status-btn-bg;
  border: 2px solid transparent;
  padding: 15px 10px;
  border-radius: 15px;
  color: v.$text-muted;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;

  .icon-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
  }

  &.done {
    &.active {
      background: rgba(v.$success, 0.1);
      color: v.$success;
      border-color: v.$success;
    }
  }

  &.skip {
    &.active {
      background: rgba(v.$danger, 0.1);
      color: v.$danger;
      border-color: v.$danger;
    }
  }
}

.badge-done {
  display: block;
  text-align: center;
  background: rgba(v.$text-muted, 0.2);
  color: v.$text-muted;
  padding: 10px;
  border-radius: 12px;
}

.actions-area {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
}

.btn-primary {
  background: v.$eco-green-dark;
  color: v.$text-white;
  border: none;
  padding: 18px 60px;
  border-radius: 15px;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 6px 0 v.$eco-green-shadow;

  &:active {
    transform: translateY(4px);
    box-shadow: 0 2px 0 v.$eco-green-shadow;
  }
}

.btn-back-home {
  background: transparent;
  color: v.$text-muted;
  border: 1px solid v.$card-border;
  padding: 14px 40px;
  border-radius: 15px;
  cursor: pointer;
}

.loading {
  text-align: center;
  color: v.$text-muted;
  padding-top: 50px;
}

@media (max-width: 640px) {
  .challenge-page {
    padding: 18px 12px 24px;

    .header {
      gap: 12px;
      margin-bottom: 16px;
    }

    .back-btn {
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 1rem;
    }

    .title-group h1 {
      font-size: 1.3rem;
    }
  }

  .challenge-card {
    padding: 14px;
    border-radius: 16px;

    h3 {
      font-size: 1.08rem;
      margin-bottom: 6px;
    }

    p {
      font-size: 0.9rem;
      margin-bottom: 14px;
    }
  }

  .card-actions {
    flex-direction: column;
    gap: 10px;
  }

  .status-btn {
    flex-direction: row;
    justify-content: flex-start;
    padding: 11px 12px;
    border-radius: 15px;
  }

  .btn-primary {
    width: 100%;
    padding: 14px 16px;
    border-radius: 15px;
    font-size: 1rem;
    box-shadow: 0 4px 0 v.$eco-green-shadow;
  }

  .actions-area {
    padding-bottom: 18px;
  }
}
</style>
