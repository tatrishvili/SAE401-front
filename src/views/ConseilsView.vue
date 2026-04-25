<template>
  <div class="conseils-screen">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h1 class="title">Conseils</h1>
    </div>

    <!-- Tabs Menu -->
    <div class="tabs-menu">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'conseils' }"
        @click="activeTab = 'conseils'"
      >
        <span class="tab-icon">💡</span>
        <span class="tab-label">Conseils</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'challenges' }"
        @click="activeTab = 'challenges'"
      >
        <span class="tab-icon">🏆</span>
        <span class="tab-label">Challenges</span>
      </button>
    </div>

    <!-- Contenu Conseils -->
    <div v-if="activeTab === 'conseils'" class="tab-content">
      <div class="accordion">
        <div
          v-for="(category, index) in categories"
          :key="category.title"
          class="accordion-item"
          :style="{ animationDelay: index * 0.07 + 's' }"
        >
          <!-- Header de la catégorie -->
          <button
            class="accordion-header"
            @click="toggle(category.title)"
            :class="{ open: openCategories.includes(category.title) }"
          >
            <span class="accordion-title">{{ category.title }}</span>
            <svg
              class="accordion-icon"
              :class="{ rotated: openCategories.includes(category.title) }"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          <!-- Contenu déroulant -->
          <transition name="expand">
            <div
              v-if="openCategories.includes(category.title)"
              class="accordion-body"
            >
              <div
                v-for="(conseil, i) in category.conseils"
                :key="i"
                class="conseil-item"
                :class="{ 'not-last': i < category.conseils.length - 1 }"
              >
                <p>{{ conseil.text }}</p>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Contenu Challenges — Parcours Zigzag -->
    <div v-else class="tab-content">
      <div v-if="challengesLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement du parcours...</p>
      </div>
      <div v-else-if="challengesError" class="error-state">
        <p>⚠️ {{ challengesError }}</p>
      </div>
      <div v-else-if="steps.length === 0" class="empty-state">
        <p>Aucune étape disponible pour le moment.</p>
      </div>
      <div v-else class="path-scroll-area">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="path-step-item"
          :data-step-position="step.position"
        >
          <div
            class="path-node"
            :class="{
              locked: !step.isUnlocked,
              completed: step.isCompleted,
              treasure: isTreasureStep(step.position),
            }"
            :style="{ transform: `translateX(${Math.sin(index * 1) * 60}px)` }"
            @click="goToStep(step)"
          >
            <div class="path-node-circle">
              <span
                v-if="isTreasureStep(step.position)"
                class="path-treasure-icon"
                >🏆</span
              >
              <span v-else class="path-step-number">{{ step.position }}</span>
              <span v-if="!step.isUnlocked" class="path-lock-icon">🔒</span>
              <span v-if="step.isCompleted" class="path-check-icon">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import conseils from "@/data/conseils-home.json";
import api from "@/services/api";

const router = useRouter();
const activeTab = ref("conseils");

// Regrouper les conseils par titre (catégorie)
const categories = computed(() => {
  const map = {};
  for (const conseil of conseils) {
    if (!map[conseil.title]) {
      map[conseil.title] = { title: conseil.title, conseils: [] };
    }
    map[conseil.title].conseils.push(conseil);
  }
  return Object.values(map);
});

// Catégories ouvertes
const openCategories = ref([]);

function toggle(title) {
  const idx = openCategories.value.indexOf(title);
  if (idx === -1) {
    openCategories.value.push(title);
  } else {
    openCategories.value.splice(idx, 1);
  }
}

// Challenges data
const steps = ref([]);
const challengesLoading = ref(false);
const challengesError = ref("");

const isTreasureStep = (position) =>
  Number(position) === 1 || Number(position) % 5 === 0;

function goToStep(step) {
  if (!step.isUnlocked) return;
  router.push(`/challenges/${step.id}`);
}

async function loadSteps() {
  challengesLoading.value = true;
  challengesError.value = "";
  try {
    const response = await api.get("/steps");
    const stepList = Array.isArray(response.data)
      ? response.data
      : (response.data?.data ?? []);
    steps.value = stepList;
  } catch (error) {
    console.error("Erreur chargement étapes:", error);
    if (error?.response?.status === 401) {
      challengesError.value = "Session expirée. Veuillez vous reconnecter.";
    } else {
      challengesError.value =
        "Impossible de charger les défis. Vérifiez votre connexion.";
    }
  } finally {
    challengesLoading.value = false;
  }
}

onMounted(() => {
  loadSteps();
});
</script>
