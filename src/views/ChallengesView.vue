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
      <div
        v-if="showTreasurePopup"
        class="reward-overlay"
        @click.self="closeTreasurePopup"
      >
        <div
          class="reward-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Recompense tresor"
        >
          <p class="reward-kicker">Jour trésor</p>
          <h2>Félicitations !</h2>
          <p>
            Tu as atteint le jour {{ currentStepPosition }}.<br />
            Voici une récompense: <strong>+{{ treasureBonusXp }} XP</strong>.
          </p>
          <button type="button" class="reward-btn" @click="closeTreasurePopup">
            Super !
          </button>
        </div>
      </div>
    </Transition>

    <header class="header">
      <button
        type="button"
        class="back-btn"
        @click="$router.push('/challenges')"
      >
        ←
      </button>
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

        <div v-if="!isAlreadyCompleted" class="card-actions">
          <button
            class="status-btn done"
            :class="{
              active: getStatus(challengeKey(challenge, index)) === 'done',
            }"
            @click="
              setStatus(challengeKey(challenge, index), 'done', challenge)
            "
          >
            <div class="icon-circle">✓</div>
            <span>C'est fait !</span>
          </button>

          <button
            class="status-btn skip"
            :class="{
              active: getStatus(challengeKey(challenge, index)) === 'skip',
            }"
            @click="
              setStatus(challengeKey(challenge, index), 'skip', challenge)
            "
          >
            <div class="icon-circle">✕</div>
            <span>Je ne peux pas</span>
          </button>
        </div>

        <div v-else class="card-footer-done">
          <span class="badge-done">Missions archivées</span>
        </div>
      </div>

      <div
        v-if="!loading && !isAlreadyCompleted && challenges.length > 0"
        class="actions-area"
      >
        <button type="button" class="btn-primary" @click="validateDay">
          Valider ma journée
        </button>
      </div>

      <div v-if="!loading && isAlreadyCompleted" class="actions-area">
        <button
          type="button"
          class="btn-back-home"
          @click="$router.push('/challenges')"
        >
          Retour au parcours
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/services/api";
import {
  claimTreasureXpForStep,
  getTreasureXpForStep,
  setChallengeXpForStep,
} from "@/services/xpLocal";

const route = useRoute();
const router = useRouter();

const challenges = ref([]);
const loading = ref(true);
const isAlreadyCompleted = ref(false);
const currentStepPosition = ref(null);
const showToast = ref(false);
const toastMessage = ref("");
const showTreasurePopup = ref(false);
const treasureBonusXp = ref(0);
const currentStepId = ref(null);
const treasureNeedsClaim = ref(false);
const challengeStatuses = ref({});
let toastTimeoutId = null;

const TREASURE_BONUS_XP = 50;
const isTreasurePosition = (position) =>
  Number(position) === 1 || Number(position) % 5 === 0;

const challengeKey = (challenge, index) =>
  `${String(challenge?.id ?? challenge?.slug ?? "mission")}-${index}`;
const getStatus = (key) => challengeStatuses.value[key];
const getChallengeXp = (challenge) =>
  Number.isFinite(
    Number(challenge?.xp ?? challenge?.xpReward ?? challenge?.points),
  )
    ? Math.max(
        0,
        Number(challenge?.xp ?? challenge?.xpReward ?? challenge?.points),
      )
    : 25;

const showMessage = (message) => {
  if (toastTimeoutId) clearTimeout(toastTimeoutId);
  toastMessage.value = message;
  showToast.value = true;
  toastTimeoutId = setTimeout(() => {
    showToast.value = false;
  }, 2800);
};

const setStatus = (key, status, challenge) => {
  if (challengeStatuses.value[key] === status) {
    challengeStatuses.value[key] = null;
    return;
  }

  challengeStatuses.value[key] = status;
  if (status === "done") {
    showMessage(
      `T'as fait : ${challenge?.title || "Défi validé"} (+${getChallengeXp(challenge)} XP)`,
    );
  }
};

const closeTreasurePopup = () => {
  if (treasureNeedsClaim.value && currentStepId.value) {
    treasureBonusXp.value = claimTreasureXpForStep(
      currentStepId.value,
      TREASURE_BONUS_XP,
    );
    treasureNeedsClaim.value = false;
  }
  showTreasurePopup.value = false;
};

const validateDay = async () => {
  try {
    const baseXp = challenges.value
      .filter(
        (challenge, index) =>
          getStatus(challengeKey(challenge, index)) === "done",
      )
      .reduce((total, challenge) => total + getChallengeXp(challenge), 0);

    if (currentStepId.value) {
      setChallengeXpForStep(currentStepId.value, baseXp);
    }

    const gainedXp = baseXp + treasureBonusXp.value;
    await api.post(`/steps/${route.params.id}/unlock-next`);
    router.push({
      path: "/home",
      query: {
        validated: "true",
        gainedXp: String(gainedXp),
        treasureBonusXp: String(treasureBonusXp.value),
      },
    });
  } catch (error) {
    console.error("Erreur validation", error);
  }
};

onMounted(async () => {
  try {
    const stepResponse = await api.get("/steps");
    const stepList = Array.isArray(stepResponse.data)
      ? stepResponse.data
      : (stepResponse.data?.data ?? []);
    const currentStep = stepList.find(
      (step) => String(step.id) === String(route.params.id),
    );

    if (currentStep) {
      currentStepPosition.value = currentStep.position;
      currentStepId.value = Number(currentStep.id);
      isAlreadyCompleted.value = Boolean(currentStep.isCompleted);

      if (isTreasurePosition(currentStep.position)) {
        const alreadyClaimed = getTreasureXpForStep(currentStepId.value);
        treasureBonusXp.value =
          alreadyClaimed > 0 ? alreadyClaimed : TREASURE_BONUS_XP;
        treasureNeedsClaim.value = alreadyClaimed <= 0;
        if (treasureNeedsClaim.value) {
          showTreasurePopup.value = true;
        }
      }
    }

    const response = await api.get(`/steps/${route.params.id}/challenges`);
    challenges.value = Array.isArray(response.data)
      ? response.data
      : (response.data?.data ?? []);
  } catch (error) {
    if (error?.response?.status === 403) {
      router.push("/home");
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

.challenge-page {
  padding: 30px 20px;
  max-width: 600px;
  margin: 0 auto;
  color: v.$l1;
  min-height: 100vh;
  background-color: v.$d4;
}
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}
.back-btn {
  background: v.$d3;
  border: 1px solid v.$d1;
  color: v.$l1;
  font-size: 1.2rem;
  padding: 10px 18px;
  border-radius: 15px;
  cursor: pointer;
  width: auto;
}
.title-group h1 {
  margin: 0;
  font-size: 1.8rem;
}
.subtitle {
  color: v.$l5;
  margin: 5px 0 0;
  font-size: 0.9rem;
}
.status-done {
  color: v.$c1;
  font-weight: bold;
  margin: 5px 0 0;
}
.badges-link {
  background: v.$c1;
  color: v.$l1;
  border: none;
  padding: 10px 18px;
  border-radius: 15px;
  font-weight: 900;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 5px 0 v.$d1;
  white-space: nowrap;
}
.challenge-card {
  background: v.$d3;
  border-radius: 24px;
  padding: 22px;
  margin-bottom: 20px;
  border: 1px solid v.$d1;
}
.challenge-card h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
}
.challenge-card p {
  color: v.$l5;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
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
  background: rgba(v.$c1, 0.1);
  color: v.$c1;
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  font-weight: 800;
}
.reward {
  color: v.$c2;
  font-weight: bold;
  font-size: 0.8rem;
}
.xp-reward {
  background: rgba(v.$c2, 0.16);
  color: v.$c1;
  font-weight: 800;
  border-radius: 999px;
  border: 1px solid rgba(v.$c1, 0.35);
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
  background: v.$d4;
  border: 2px solid transparent;
  padding: 15px 10px;
  border-radius: 15px;
  color: v.$l5;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
}
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
.status-btn.done.active {
  background: rgba(v.$c1, 0.1);
  color: v.$c1;
  border-color: v.$c1;
}
.status-btn.skip.active {
  background: rgba(v.$l5, 0.1);
  color: v.$l1;
  border-color: v.$l5;
}
.card-footer-done {
  display: flex;
  justify-content: center;
}
.badge-done {
  background: rgba(v.$c1, 0.14);
  color: v.$c1;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 800;
}
.actions-area {
  margin-top: 28px;
}
.btn-primary,
.btn-back-home {
  width: 100%;
}

/* ── Responsive mobile ── */
@media (max-width: 640px) {
  .challenge-page {
    padding: 20px 16px;
  }
  .header {
    gap: 12px;
    margin-bottom: 20px;
  }
  .back-btn {
    padding: 8px 14px;
    font-size: 1rem;
    border-radius: 12px;
  }
  .title-group h1 {
    font-size: 1.5rem;
  }
  .subtitle,
  .status-done {
    font-size: 0.8rem;
  }
  .challenge-card {
    padding: 16px;
    border-radius: 18px;
    margin-bottom: 14px;
  }
  .challenge-card h3 {
    font-size: 1.1rem;
  }
  .challenge-card p {
    font-size: 0.9rem;
    margin-bottom: 14px;
  }
  .card-actions {
    gap: 8px;
  }
  .status-btn {
    padding: 12px 8px;
    font-size: 0.85rem;
  }
  .icon-circle {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
  .category {
    font-size: 0.7rem;
    padding: 3px 10px;
  }
  .actions-area {
    margin-top: 20px;
  }
}
.custom-toast {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 10px 14px;
  border-radius: 16px;
  min-width: min(92vw, 360px);
  border: 2px solid rgba(v.$l1, 0.18);
  box-shadow: 0 10px 24px rgba(v.$d5, 0.35);
  background: linear-gradient(140deg, v.$c1, v.$d1);
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
  color: v.$l1;
}
.toast-msg {
  font-size: 0.82rem;
  color: rgba(v.$l1, 0.96);
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
  background: rgba(v.$d5, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 1100;
}
.reward-popup {
  width: min(92vw, 420px);
  border-radius: 22px;
  border: 1px solid rgba(v.$c2, 0.38);
  padding: 22px 20px;
  background:
    radial-gradient(circle at 14% 12%, rgba(v.$c2, 0.18), transparent 38%),
    linear-gradient(170deg, rgba(v.$d3, 0.98), rgba(v.$d4, 0.96));
  box-shadow: 0 20px 46px rgba(v.$d5, 0.42);
  text-align: center;
  color: v.$l1;
}
.reward-popup h2 {
  margin: 6px 0 10px;
  font-size: 1.6rem;
}
.reward-popup p {
  margin: 0;
  line-height: 1.45;
  color: rgba(v.$l1, 0.9);
}
.reward-kicker {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(v.$c2, 0.92);
}
.reward-btn {
  margin-top: 18px;
  border: none;
  border-radius: 15px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 900;
  color: v.$l1;
  background: linear-gradient(180deg, rgba(v.$c1, 0.96), rgba(v.$d1, 0.96));
  box-shadow: 0 5px 0 v.$c2;
  cursor: pointer;
}
</style>
