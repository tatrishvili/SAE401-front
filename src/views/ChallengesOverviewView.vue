<template>
  <div class="path-page">

    <Transition name="fade-toast">
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

    <div class="challenge-header">
      <div class="title-group">
        <h1>Mon Parcours Éco</h1>
        <p class="subtitle">🌱 {{ unlockedCount }} / {{ steps.length }} Jours validés</p>
      </div>
    </div>

    <div class="badges-bar">
      <button class="badges-btn" @click="openBadges">
        <span v-if="hasNewBadges" class="badges-dot"></span>
        <span class="icon">🏆</span> Voir mes badges
      </button>
    </div>

    <div class="scroll-area">
      <div v-if="stepsLoading" class="loading">Chargement du parcours...</div>

      <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-item"
      >
        <div
            class="node"
            :class="{
              locked: !step.isUnlocked,
              completed: step.isCompleted,
              treasure: isTreasureStep(step.position),
            }"
            :style="{ transform: `translateX(${calculateOffset(index)}px)` }"
            @click="handleStepClick(step)"
        >
          <div class="node-circle">
            <span v-if="isTreasureStep(step.position)" class="treasure-icon">🎁</span>
            <span v-else class="step-number">{{ step.position }}</span>

            <span v-if="!step.isUnlocked" class="lock-icon">🔒</span>
            <div v-if="step.isCompleted" class="check-badge">✓</div>
          </div>
        </div>
      </div>
    </div>

    <button v-if="showScrollTopButton" class="scroll-top-btn" @click="scrollToTop">↑</button>

  </div>
</template>

<script setup>
// ... (Script remains the same as your provided code) ...
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const steps = ref([])
const stepsLoading = ref(true)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const hasNewBadges = ref(false)
const showScrollTopButton = ref(false)

const unlockedCount = computed(() => steps.value.filter(s => s.isCompleted).length)
const isTreasureStep = (pos) => Number(pos) === 1 || Number(pos) % 5 === 0
const calculateOffset = (index) => Math.sin(index * 0.8) * 35

const handleStepClick = (step) => {
  if (!step.isUnlocked) {
    triggerToast('Ce jour est encore verrouillé !', 'error')
    return
  }
  router.push(`/challenges/${step.id}`)
}

const triggerToast = (msg, type = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

const openBadges = () => {
  hasNewBadges.value = false
  router.push('/badges')
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const handleScroll = () => { showScrollTopButton.value = window.scrollY > 300 }

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  try {
    const res = await api.get('/steps')
    steps.value = Array.isArray(res.data) ? res.data : (res.data?.data || [])
    if (route.query.validated === 'true') {
      triggerToast(`Félicitations ! +${route.query.gainedXp} XP`, 'success')
    }
  } catch (err) { console.error(err) } finally { stepsLoading.value = false }
})

onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

/* Chart Colors Applied:
   $d5: #0A0F15; $d4: #222631; $d3: #373E4E; $d1: #657084;
   $c1: #F96750 (Orange); $c2: #df4830 (Dark Orange Shadow);
*/

.path-page {
  background-color: v.$d4;
  min-height: 100vh;
  padding-bottom: 100px;
  color: v.$l1;
}

.challenge-header {
  background-color: v.$d3;
  height: 10vh;
  min-height: 60px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid v.$d5;

  h1 { font-size: 1.1rem; margin: 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
  .subtitle { font-size: 0.8rem; color: v.$c1; margin: 0; font-weight: 700; }
}

/* New Placement: A clean bar under the header */
.badges-bar {
  padding: 15px 20px;
  background-color: v.$d4;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid v.$d3;
}

.badges-btn {
  background: v.$c1;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.9rem;
  box-shadow: 0 4px 0 v.$c2; /* Fixed: Correct Dark Orange Shadow */
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.1s;

  &:active { transform: translateY(2px); box-shadow: 0 2px 0 v.$c2; }

  .icon { font-size: 1.1rem; }
}

.badges-dot {
  position: absolute; top: -2px; right: -2px;
  width: 12px; height: 12px; background: #ffffff;
  border: 2px solid v.$c1; border-radius: 50%;
}

/* --- SNAKE PATH --- */
.scroll-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  padding: 40px 0;
}

.node {
  cursor: pointer;
  transition: transform 0.2s ease;

  .node-circle {
    width: 70px; height: 70px;
    border-radius: 50%;
    background: v.$c1;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 0 v.$c2; /* Fixed: Correct Dark Orange Shadow */
    position: relative;

    .step-number { font-size: 1.5rem; font-weight: 900; color: white; }
    .treasure-icon { font-size: 1.8rem; }
    .lock-icon { font-size: 1.1rem; opacity: 0.8; }

    .check-badge {
      position: absolute; bottom: -2px; right: -2px;
      background: white; color: v.$c1;
      width: 24px; height: 24px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 0.8rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
  }

  &.locked {
    opacity: 0.5;
    .node-circle { background: v.$d1; box-shadow: 0 6px 0 v.$d5; }
  }

  &.treasure .node-circle {
    background: #FFCF4B;
    box-shadow: 0 6px 0 #D4A017;
  }
}

/* --- TOASTS (Matches Challenge Style) --- */
.custom-toast {
  position: fixed; top: 14px; left: 50%; transform: translateX(-50%);
  z-index: 3000; padding: 10px 18px; border-radius: 12px;
  background: v.$d3;
  border: 1px solid v.$c1;
  box-shadow: 0 10px 20px v.$d5;
  &.error { border-color: #ff4b2b; }
  .toast-title { color: v.$c1; font-weight: 900; }
}

.scroll-top-btn {
  position: fixed; bottom: 80px; right: 20px;
  width: 40px; height: 40px; background: v.$d3;
  color: v.$l1; border: 1px solid v.$d1;
  border-radius: 50%; font-weight: 900; cursor: pointer;
}
</style>