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
        <div
          ref="rewardPopupRef"
          class="reward-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Recompense tresor"
        >
          <div class="reward-content" :class="{ revealed: scratchRevealed }">
            <p class="reward-kicker">Jour trésor</p>
            <h2>Félicitations !</h2>
            <p>
              Tu as atteint le jour {{ currentStepPosition }}.<br />
              Voici une récompense: <strong>+{{ treasureBonusXp }} XP</strong>.
            </p>
            <button type="button" class="reward-btn" @click="closeTreasurePopup">Super !</button>
          </div>

          <canvas
            v-if="!scratchRevealed"
            ref="scratchCanvasRef"
            class="scratch-layer"
            @pointerdown="handleScratchStart"
            @pointermove="handleScratchMove"
            @pointerup="handleScratchEnd"
            @pointerleave="handleScratchEnd"
            @pointercancel="handleScratchEnd"
          ></canvas>
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
import { nextTick, ref, onBeforeUnmount, onMounted } from 'vue'
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
const scratchRevealed = ref(false)
const isScratching = ref(false)
const rewardPopupRef = ref(null)
const scratchCanvasRef = ref(null)
const TREASURE_BONUS_XP = 50
let toastTimeoutId = null

// Stockage des choix (on ne met rien par défaut pour forcer un choix)
const challengeStatuses = ref({})

const isTreasurePosition = (position) => Number(position) === 1 || Number(position) % 5 === 0

const drawScratchLayer = (cssWidth, cssHeight) => {
  const canvas = scratchCanvasRef.value
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const gradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight)
  gradient.addColorStop(0, '#f97d4d')
  gradient.addColorStop(1, '#db5728')

  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, cssWidth, cssHeight)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  for (let i = 0; i < 110; i += 1) {
    const x = Math.random() * cssWidth
    const y = Math.random() * cssHeight
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)'
  ctx.font = `${Math.max(30, Math.floor(cssWidth * 0.09))}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('GRATTER', cssWidth / 2, cssHeight / 2)
}

const initScratchCard = async () => {
  await nextTick()

  const popup = rewardPopupRef.value
  const canvas = scratchCanvasRef.value

  if (!popup || !canvas) {
    return
  }

  const ratio = window.devicePixelRatio || 1
  const cssWidth = Math.floor(popup.clientWidth || popup.getBoundingClientRect().width)
  const cssHeight = Math.floor(popup.clientHeight || popup.getBoundingClientRect().height)

  if (cssWidth <= 0 || cssHeight <= 0) {
    return
  }

  canvas.width = Math.floor(cssWidth * ratio)
  canvas.height = Math.floor(cssHeight * ratio)
  canvas.style.width = `${cssWidth}px`
  canvas.style.height = `${cssHeight}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  drawScratchLayer(cssWidth, cssHeight)
}

const openTreasurePopupWithScratch = async () => {
  showTreasurePopup.value = true
  scratchRevealed.value = false

  await nextTick()
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
  await initScratchCard()
}

const handleWindowResize = () => {
  if (showTreasurePopup.value && !scratchRevealed.value) {
    initScratchCard()
  }
}

const getPointerPosition = (event) => {
  const canvas = scratchCanvasRef.value
  if (!canvas) {
    return null
  }

  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  }
}

const scratchAt = (event) => {
  const canvas = scratchCanvasRef.value
  if (!canvas || scratchRevealed.value) {
    return
  }

  const ctx = canvas.getContext('2d')
  const point = getPointerPosition(event)

  if (!ctx || !point) {
    return
  }

  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(point.x, point.y, 24, 0, Math.PI * 2)
  ctx.fill()
}

const revealIfEnoughScratched = () => {
  const canvas = scratchCanvasRef.value
  if (!canvas || scratchRevealed.value) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  const { width, height } = canvas
  const pixels = ctx.getImageData(0, 0, width, height).data

  let transparentPixels = 0
  let sampledPixels = 0

  for (let i = 3; i < pixels.length; i += 16) {
    sampledPixels += 1
    if (pixels[i] < 20) {
      transparentPixels += 1
    }
  }

  if (sampledPixels > 0 && transparentPixels / sampledPixels >= 0.18) {
    scratchRevealed.value = true
  }
}

const handleScratchStart = async (event) => {
  if (scratchRevealed.value) {
    return
  }

  event.preventDefault()
  isScratching.value = true
  scratchAt(event)
  revealIfEnoughScratched()
}

const handleScratchMove = (event) => {
  if (!isScratching.value || scratchRevealed.value) {
    return
  }

  event.preventDefault()
  scratchAt(event)
  revealIfEnoughScratched()
}

const handleScratchEnd = () => {
  isScratching.value = false
}

const closeTreasurePopup = () => {
  if (treasureNeedsClaim.value && currentStepId.value) {
    const claimedAmount = claimTreasureXpForStep(currentStepId.value, TREASURE_BONUS_XP)
    treasureBonusXp.value = claimedAmount
    treasureNeedsClaim.value = false
  }

  showTreasurePopup.value = false
  scratchRevealed.value = false
  isScratching.value = false
}

onMounted(async () => {
  window.addEventListener('resize', handleWindowResize, { passive: true })

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
          treasureNeedsClaim.value = true
          await openTreasurePopupWithScratch()
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

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
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
  background: rgba(v.$black, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 1100;
}

.reward-popup {
  position: relative;
  width: min(92vw, 420px);
  min-height: 250px;
  border-radius: 22px;
  border: 1px solid rgba(v.$badge-gold, 0.38);
  padding: 22px 20px;
  background:
    radial-gradient(circle at 14% 12%, rgba(v.$badge-gold, 0.18), transparent 38%),
    linear-gradient(170deg, rgba(v.$card-bg, 0.98), rgba(v.$status-btn-bg, 0.96));
  box-shadow:
    0 20px 46px rgba(v.$black, 0.42),
    inset 0 1px 0 rgba(v.$text-white, 0.05);
  text-align: center;
  color: v.$text-white;
  animation: reward-pop-in 0.32s ease;
  overflow: hidden;

  .reward-content {
    transition:
      visibility 0.2s linear,
      opacity 0.24s ease;
  }

  .reward-content:not(.revealed) {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    user-select: none;
  }

  .reward-content.revealed {
    opacity: 1;
    visibility: visible;
  }

  h2 {
    margin: 6px 0 10px;
    font-size: 1.6rem;
    color: v.$text-white;
  }

  p {
    margin: 0;
    line-height: 1.45;
    color: rgba(v.$text-white, 0.9);
  }
}

.scratch-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  cursor: grab;
  touch-action: none;
  z-index: 3;
}

.reward-kicker {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(v.$badge-gold, 0.92);
}

.reward-btn {
  margin-top: 18px;
  border: none;
  border-radius: 15px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 900;
  color: v.$olive-text;
  background: linear-gradient(180deg, rgba(v.$eco-green, 0.96), rgba(v.$eco-green-dark, 0.96));
  box-shadow: 0 5px 0 v.$eco-green-shadow;
  cursor: pointer;

  &:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 v.$eco-green-shadow;
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
