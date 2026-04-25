<template>
  <main class="path-container">
    <Transition name="bounce">
      <div v-if="showToast" class="custom-toast" :class="toastType">
        <div class="toast-content">
          <span class="toast-icon">{{
            toastType === "error" ? "⚠️" : "🎉"
          }}</span>
          <div class="toast-text">
            <span class="toast-title">{{
              toastType === "error" ? "Oups !" : "Cool !"
            }}</span>
            <span class="toast-msg">{{ toastMessage }}</span>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="badge-pop">
      <div
        v-if="showBadgeCelebration"
        class="reward-overlay"
        @click.self="closeBadgeCelebration"
      >
        <div
          class="reward-popup badge-celebration-popup"
          role="dialog"
          aria-modal="true"
        >
          <p class="reward-kicker">Nouveau badge</p>
          <h2>Félicitations !</h2>
          <div class="reward-badge-frame">
            <div v-if="celebrationBadge" class="reward-badge-fallback">🏅</div>
          </div>
          <p v-if="celebrationBadge">
            Tu viens de débloquer <strong>{{ celebrationBadge.name }}</strong
            >.
          </p>
          <p v-if="celebrationBadgeCount > 1" class="reward-subtext">
            {{ celebrationBadgeCount }} nouveaux badges viennent de s’ajouter à
            ta collection.
          </p>
          <button
            type="button"
            class="reward-btn"
            @click="closeBadgeCelebration"
          >
            Continuer
          </button>
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
      <div v-if="steps.length === 0" class="loading">
        Chargement du parcours...
      </div>

      <div
        v-for="(step, index) in steps"
        :key="step.id"
        class="step-item"
        :data-step-position="step.position"
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
            <span v-if="isTreasureStep(step.position)" class="treasure-icon"
              >🏆</span
            >
            <span v-else class="step-number">{{ step.position }}</span>
            <span v-if="!step.isUnlocked" class="lock-icon">🔒</span>
            <span v-if="step.isCompleted" class="check-icon">✓</span>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="showScrollTopButton"
      class="scroll-top-btn"
      type="button"
      aria-label="Revenir en haut"
      @click="scrollToTop"
    >
      ↑
    </button>
  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import { mergeXpWithLocal } from "@/services/xpLocal";
import {
  DEFAULT_BADGE_CATALOG,
  getUnlockedBadgesFromXp,
} from "@/services/badges";

const steps = ref([]);
const router = useRouter();
const route = useRoute();
const hasNewBadges = ref(false);
const currentUnlockedBadges = ref(0);
const showBadgeCelebration = ref(false);
const celebrationBadge = ref(null);
const celebrationBadgeCount = ref(0);
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";
const BADGE_SEEN_KEY = "seenUnlockedBadgesCount";
const BADGES_THRESHOLDS = DEFAULT_BADGE_CATALOG.map(
  (badge) => badge.xpRequired,
);
const SCROLL_DURATION = 480;
const SCROLL_TOP_THRESHOLD = 240;

const showToast = ref(false);
const toastMessage = ref("");
const toastType = ref("error");
const showScrollTopButton = ref(false);
let toastTimeoutId = null;
let scrollRafId = null;

const unlockedCount = computed(
  () => steps.value.filter((s) => s.isUnlocked).length,
);
const calculateOffset = (index) => Math.sin(index * 1) * 60;
const isTreasureStep = (position) =>
  Number(position) === 1 || Number(position) % 5 === 0;

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

const animateScrollTo = (targetY, duration = SCROLL_DURATION) => {
  if (typeof window === "undefined") return;
  if (scrollRafId) cancelAnimationFrame(scrollRafId);

  const startY = window.scrollY || window.pageYOffset || 0;
  const distance = targetY - startY;
  if (Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    return;
  }

  const startTime = performance.now();
  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const nextY = startY + distance * easeOutCubic(progress);
    window.scrollTo(0, nextY);
    if (progress < 1) scrollRafId = requestAnimationFrame(step);
  };
  scrollRafId = requestAnimationFrame(step);
};

const updateScrollTopButton = () => {
  if (typeof window === "undefined") return;
  showScrollTopButton.value = window.scrollY > SCROLL_TOP_THRESHOLD;
};

const scrollToTop = () => animateScrollTo(0, 420);

const scrollToReachedStep = async () => {
  await nextTick();
  const targetStep =
    [...steps.value].reverse().find((step) => step?.isUnlocked) ||
    steps.value[0];
  if (!targetStep || typeof document === "undefined") return;
  const targetElement = document.querySelector(
    `[data-step-position="${targetStep.position}"]`,
  );
  if (!targetElement) return;
  const targetY =
    targetElement.getBoundingClientRect().top +
    window.scrollY -
    window.innerHeight * 0.22;
  animateScrollTo(Math.max(0, targetY), 520);
};

const triggerToast = (msg, type = "error") => {
  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  toastMessage.value = msg;
  toastType.value = type;
  showToast.value = true;
  toastTimeoutId = setTimeout(() => {
    showToast.value = false;
  }, 3500);
};

const closeBadgeCelebration = () => {
  showBadgeCelebration.value = false;
  celebrationBadge.value = null;
  celebrationBadgeCount.value = 0;
};

const triggerBadgeCelebration = (xpValue) => {
  const unlockedBadges = getUnlockedBadgesFromXp(xpValue);
  const seenCount = Number(localStorage.getItem(BADGE_SEEN_KEY) || 0);
  const newBadgeCount = Math.max(0, unlockedBadges.length - seenCount);
  if (newBadgeCount <= 0) return;
  celebrationBadgeCount.value = newBadgeCount;
  celebrationBadge.value =
    unlockedBadges[seenCount] ??
    unlockedBadges[unlockedBadges.length - 1] ??
    null;
  showBadgeCelebration.value = Boolean(celebrationBadge.value);
};

const handleStepClick = async (step) => {
  if (!step.isUnlocked) {
    triggerToast("Ce jour est encore verrouillé !", "error");
    return;
  }

  if (step.isCompleted) {
    router.push(`/challenges/${step.id}`);
    return;
  }

  try {
    await api.get(`/steps/${step.id}/challenges`);
    router.push(`/challenges/${step.id}`);
  } catch (error) {
    if (error?.response?.status === 403) {
      triggerToast("Pas encore disponible ! Reviens après 24h.", "error");
    } else {
      triggerToast("Erreur de connexion au serveur.", "error");
    }
  }
};

const toValidNumber = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return null;
};

const computeUnlockedByXp = (xpValue) =>
  BADGES_THRESHOLDS.filter((threshold) => xpValue >= threshold).length;

const resolveXpForNotification = async (stepsData) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_BASE}/me/stats`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (response.ok) {
      const payload = await response.json();
      const data = payload?.data ?? payload;
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
      );
      if (xpFromApi !== null) return mergeXpWithLocal(xpFromApi);
    }
  } catch {
    // fallback below
  }

  const completedCount = Array.isArray(stepsData)
    ? stepsData.filter((step) => step?.isCompleted).length
    : 0;
  return mergeXpWithLocal(completedCount * 25);
};

const updateBadgesNotification = async (stepsData) => {
  const xpValue = await resolveXpForNotification(stepsData);
  const unlockedCountByXp = computeUnlockedByXp(xpValue);
  currentUnlockedBadges.value = unlockedCountByXp;
  const seenCount = Number(localStorage.getItem(BADGE_SEEN_KEY) || 0);
  hasNewBadges.value = unlockedCountByXp > seenCount;
  return xpValue;
};

const openBadges = () => {
  localStorage.setItem(BADGE_SEEN_KEY, String(currentUnlockedBadges.value));
  hasNewBadges.value = false;
  closeBadgeCelebration();
  router.push("/badges");
};

onMounted(async () => {
  updateScrollTopButton();
  window.addEventListener("scroll", updateScrollTopButton, { passive: true });

  try {
    const stepsResponse = await api.get("/steps");
    const stepList = Array.isArray(stepsResponse.data)
      ? stepsResponse.data
      : (stepsResponse.data?.data ?? []);
    steps.value = stepList;
    const xpValue = await updateBadgesNotification(stepList);
    await scrollToReachedStep();

    if (route.query.validated === "true") {
      triggerBadgeCelebration(xpValue);
      const gainedXp = Number(route.query.gainedXp ?? 0);
      const successMessage =
        gainedXp > 0
          ? `Journée validée avec succès ! +${gainedXp} XP gagnés aujourd'hui.`
          : "Journée validée avec succès ! À demain.";
      triggerToast(successMessage, "success");
      router.replace({ path: "/challenges" });
    }
  } catch (error) {
    console.error("Erreur chargement étapes:", error);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", updateScrollTopButton);
  }
  if (scrollRafId) cancelAnimationFrame(scrollRafId);
});
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

.custom-toast {
  position: fixed;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 12px 25px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(v.$d5, 0.4);
  min-width: 300px;
  border: 2px solid rgba(v.$l1, 0.2);

  &.error {
    background: v.$c1;
  }
  &.success {
    background: v.$c2;
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
    color: v.$l1;
  }
  .toast-msg {
    font-size: 0.9rem;
    color: rgba(v.$l1, 0.9);
  }
}

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

.reward-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(v.$d5, 0.72);
  backdrop-filter: blur(10px);
}

.reward-popup {
  width: min(420px, 100%);
  padding: 24px 20px 22px;
  border-radius: 26px;
  border: 1px solid rgba(v.$l1, 0.14);
  background: linear-gradient(180deg, rgba(v.$d3, 0.99), rgba(v.$d4, 0.96));
  box-shadow: 0 24px 60px rgba(v.$d5, 0.4);
  text-align: center;
}

.reward-kicker {
  margin: 0 0 8px;
  color: v.$c1;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.reward-popup h2 {
  margin: 0;
  font-size: 1.7rem;
}
.reward-badge-frame {
  width: 174px;
  height: 174px;
  margin: 18px auto 14px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(v.$d5, 0.18);
  border: 1px solid rgba(v.$c1, 0.2);
  overflow: hidden;
}
.reward-badge-fallback {
  font-size: 5rem;
}
.reward-subtext {
  margin-top: 10px;
  color: v.$l5;
}
.reward-btn {
  border: none;
  padding: 12px 18px;
  margin-top: 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, v.$c1, v.$d1);
  color: v.$l1;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 0 v.$d1;
}

.badge-pop-enter-active {
  animation: badge-pop-in 0.38s ease;
}
.badge-pop-leave-active {
  animation: badge-pop-in 0.28s ease reverse;
}
@keyframes badge-pop-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.path-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 10px 90px;
  min-height: 100vh;
  background-color: v.$d4;
  color: v.$l1;
  font-family: "Inter", sans-serif;
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
  background: v.$c1;
  color: v.$l1;
  border: none;
  padding: 18px 60px;
  border-radius: 15px;
  font-weight: 900;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 6px 0 v.$d1;
}
.badges-dot {
  position: absolute;
  top: -4px;
  left: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff2c2c;
  border: 2px solid v.$l1;
}
.stats {
  background: v.$d3;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  color: v.$l5;
  border: 1px solid v.$d1;
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
}
.node-circle {
  width: 75px;
  height: 75px;
  background-color: v.$l5;
  border-radius: 50%;
  box-shadow: 0 6px 0 v.$d1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.step-number {
  font-size: 1.8rem;
  font-weight: 900;
  color: v.$l1;
}
.treasure-icon {
  font-size: 2.2rem;
}
.check-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  background: v.$c2;
  color: v.$l1;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border: 3px solid v.$d4;
}
.lock-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 0.8rem;
}
.node.locked .node-circle {
  background-color: v.$d3;
}
.node.completed .node-circle {
  background-color: v.$c1;
}
.node.treasure .node-circle {
  border: 2px solid rgba(255, 210, 104, 0.75);
}
.loading {
  color: v.$l5;
  text-align: center;
}
.scroll-top-btn {
  position: fixed;
  right: 18px;
  bottom: 18px;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: v.$c1;
  color: v.$l1;
  font-size: 1.35rem;
  font-weight: 900;
  box-shadow: 0 6px 0 v.$d1;
  cursor: pointer;
  z-index: 40;
}
@media (max-width: 640px) {
  .header {
    margin-bottom: 28px;
    gap: 12px;
  }
  .scroll-area {
    gap: 34px;
  }
  .badges-link {
    padding: 16px 42px;
    font-size: 1rem;
  }
}
</style>
