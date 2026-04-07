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

      <div v-else v-for="challenge in challenges" :key="challenge.id" class="challenge-card">
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
            :class="{ active: getStatus(challenge.id) === 'done' }"
            @click="setStatus(challenge.id, 'done')"
          >
            <div class="icon-circle">✓</div>
            <span>C'est fait !</span>
          </button>

          <button
            class="status-btn skip"
            :class="{ active: getStatus(challenge.id) === 'skip' }"
            @click="setStatus(challenge.id, 'skip')"
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

const route = useRoute()
const router = useRouter()
const challenges = ref([])
const loading = ref(true)
const isAlreadyCompleted = ref(false)
const currentStepPosition = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
let toastTimeoutId = null

// Stockage des choix (on ne met rien par défaut pour forcer un choix)
const challengeStatuses = ref({})

onMounted(async () => {
  try {
    const stepResponse = await api.get('/steps')
    const currentStep = stepResponse.data.find((s) => s.id == route.params.id)

    if (currentStep) {
      isAlreadyCompleted.value = currentStep.isCompleted
      currentStepPosition.value = currentStep.position
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

const getStatus = (id) => challengeStatuses.value[id]
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

const setStatus = (id, status) => {
  // Si on reclique sur le même, on peut décocher (optionnel)
  if (challengeStatuses.value[id] === status) {
    challengeStatuses.value[id] = null
  } else {
    challengeStatuses.value[id] = status

    if (status === 'done') {
      const challenge = challenges.value.find((item) => item.id === id)
      const xp = getChallengeXp(challenge)
      triggerSuccessToast(`T'as fait : ${challenge?.title || 'Défi validé'} (+${xp} XP)`)
    }
  }
}

const validateDay = async () => {
  try {
    const gainedXp = challenges.value
      .filter((challenge) => getStatus(challenge.id) === 'done')
      .reduce((total, challenge) => total + getChallengeXp(challenge), 0)

    await api.post(`/steps/${route.params.id}/unlock-next`)
    router.push({ path: '/', query: { validated: 'true', gainedXp: String(gainedXp) } })
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
  border-radius: 20px;
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
  border-radius: 35px;
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
  border-radius: 25px;
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
    border-radius: 14px;
  }

  .btn-primary {
    width: 100%;
    padding: 14px 16px;
    border-radius: 16px;
    font-size: 1rem;
    box-shadow: 0 4px 0 v.$eco-green-shadow;
  }

  .actions-area {
    padding-bottom: 18px;
  }
}
</style>
