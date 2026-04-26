<template>
  <main class="badges-page">

    <!-- Header matching global style -->
    <header>
      <button class="retour back-btn" @click="$router.push('/challenges')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1>Galerie des Trophées</h1>
    </header>

    <!-- XP Bar -->
    <XpDisplay :xp="xp" :next-threshold="nextBadgeThreshold" />

    <!-- Subtitle -->
    <p class="page-subtitle">Débloque des badges en progressant dans ton parcours éco.</p>

    <!-- Loading / Error -->
    <p v-if="loading" class="status-text">Chargement des trophées...</p>
    <p v-if="errorMessage" class="status-text error">{{ errorMessage }}</p>

    <!-- Badges grid -->
    <section class="badges-grid" v-if="displayedBadges.length > 0">
      <article
          v-for="(badge, index) in displayedBadges"
          :key="badge.id"
          class="badge-card"
          :class="{
          locked: !isUnlocked(badge.id),
          unlocked: isUnlocked(badge.id),
        }"
      >
        <span class="xp-pill">{{ badge.xpRequired }} XP</span>

        <div class="badge-visual">
          <img
              class="badge-photo"
              :class="{
              unlocked: isUnlocked(badge.id),
              locked: !isUnlocked(badge.id),
            }"
              :src="resolveBadgeImage(badge, index)"
              :alt="badge.name"
          />
          <div v-if="!isUnlocked(badge.id)" class="lock-icon">🔒</div>
        </div>

        <h2>{{ badge.name }}</h2>
        <p>{{ badge.description }}</p>
      </article>
    </section>

  </main>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import XpDisplay from "@/components/XpDisplay.vue";
import { mergeXpWithLocal } from "@/services/xpLocal";
import {
  DEFAULT_BADGE_CATALOG,
  getUnlockedBadgesFromXp,
  normalizeBadgesArray,
  resolveBadgeImage,
} from "@/services/badges";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api";
const BADGE_SEEN_KEY = "seenUnlockedBadgesCount";

const xp = ref(0);
const earnedBadges = ref([]);
const badgesCatalog = ref(DEFAULT_BADGE_CATALOG);
const nextBadgeThreshold = ref(100);
const loading = ref(false);
const errorMessage = ref("");

const toValidNumber = (...values) => {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return null;
};

const displayedBadges = computed(() => {
  const earnedMap = new Map(
      normalizeBadgesArray(earnedBadges.value).map((badge) => [badge.id, badge]),
  );
  const catalog = normalizeBadgesArray(badgesCatalog.value);
  const merged = catalog.map((badge) => {
    const unlockedVersion = earnedMap.get(badge.id);
    return unlockedVersion ? { ...badge, ...unlockedVersion } : badge;
  });
  for (const unlocked of earnedMap.values()) {
    if (!merged.find((badge) => badge.id === unlocked.id))
      merged.push(unlocked);
  }
  return merged.sort((a, b) => a.xpRequired - b.xpRequired);
});

const unlockedIds = computed(() => {
  const unlockedFromApi = normalizeBadgesArray(earnedBadges.value).map(
      (badge) => badge.id,
  );
  const unlockedFromXp = getUnlockedBadgesFromXp(xp.value)
      .filter((badge) => badge.xpRequired > 0)
      .map((badge) => badge.id);
  return new Set([...unlockedFromApi, ...unlockedFromXp]);
});

const isUnlocked = (badgeId) =>
    unlockedIds.value.has(String(badgeId).toLowerCase());

const unlockedCount = computed(
    () => displayedBadges.value.filter((badge) => isUnlocked(badge.id)).length,
);

const computeNextThreshold = (data) => {
  const directThreshold = Number(
      data?.nextBadgeXp ?? data?.nextBadgeThreshold ?? data?.nextThreshold ??
      data?.next_badge_xp ?? data?.progress?.nextBadgeXp,
  );
  if (Number.isFinite(directThreshold) && directThreshold > 0)
    return directThreshold;
  const fromCatalog = displayedBadges.value
      .filter((badge) => !isUnlocked(badge.id) && badge.xpRequired > xp.value)
      .sort((a, b) => a.xpRequired - b.xpRequired)[0];
  return fromCatalog ? fromCatalog.xpRequired : Math.max(100, xp.value + 100);
};

const fetchStepsXpFallback = async (token) => {
  const stepsResponse = await fetch(`${API_BASE}/steps`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!stepsResponse.ok) return false;
  const stepsPayload = await stepsResponse.json();
  const steps = Array.isArray(stepsPayload?.data)
      ? stepsPayload.data
      : Array.isArray(stepsPayload) ? stepsPayload : [];
  const completedCount = steps.filter((step) => step?.isCompleted).length;
  xp.value = mergeXpWithLocal(completedCount * 25);
  return true;
};

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = "";
  const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
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
          data?.xp, data?.totalXp, data?.xpTotal, data?.experience,
          data?.experienceTotal, data?.points, data?.progress?.xp,
          data?.progress?.totalXp, payload?.xp, payload?.totalXp,
      );
      xp.value = mergeXpWithLocal(xpFromApi ?? 0);
      earnedBadges.value = Array.isArray(data?.badges) ? data.badges : [];
      const catalogFromApi =
          data?.allBadges ?? data?.badgesCatalog ?? data?.availableBadges ??
          data?.catalog ?? data?.badges_catalog;
      if (Array.isArray(catalogFromApi) && catalogFromApi.length > 0)
        badgesCatalog.value = normalizeBadgesArray(catalogFromApi);
      if (xpFromApi === null) await fetchStepsXpFallback(token);
      nextBadgeThreshold.value = computeNextThreshold(data);
      localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value));
    } else {
      const fallbackWorked = await fetchStepsXpFallback(token);
      nextBadgeThreshold.value = computeNextThreshold({});
      localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value));
      if (!fallbackWorked)
        errorMessage.value = "Impossible de récupérer ta progression pour le moment.";
    }
  } catch {
    const fallbackWorked = await fetchStepsXpFallback(token);
    nextBadgeThreshold.value = computeNextThreshold({});
    localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value));
    if (!fallbackWorked)
      errorMessage.value = "Impossible de récupérer ta progression pour le moment.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

.badges-page {
  display: flex;
  flex-direction: column;
  padding: 0 16px 100px;
  background-color: #222631;
  color: #ffffff;
  font-family: "M PLUS Rounded 1c", sans-serif;
}

/* ── Header — matches global header style ── */
header {
  background-color: #373E4E !important;
  height: 10vh !important;
  min-height: 56px !important;
  padding: 0 16px !important;
  margin: 0 -16px 2vh -16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 100 !important;
  width: calc(100% + 32px) !important;
  box-sizing: border-box !important;

  h1 {
    margin: 0;
    text-align: center;
    flex: 1;
    font-size: 18px;
    font-weight: 700;
    font-family: "M PLUS Rounded 1c", sans-serif;
    text-transform: capitalize;
    color: #ffffff;
  }
}

/* ── Back button — override global button style ── */
.back-btn {
  all: unset !important;
  position: absolute !important;
  left: 16px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 44px !important;
  height: 44px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  color: #c8d0da !important;
  background: transparent !important;
  border: none !important;
  border-bottom: none !important;
  border-right: none !important;
  border-left: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-size: unset !important;

  &:hover { color: #ffffff !important; }
  &:active { border: none !important; }

  svg {
    width: 22px;
    height: 22px;
    stroke: currentColor;
    fill: none;
  }
}

/* ── Page subtitle ── */
.page-subtitle {
  font-size: 14px;
  color: #8792A4;
  margin: 0 0 2vh;
  text-align: center;
}

/* ── Badges grid ── */
.badges-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  margin-top: 2vh;
}

.badge-card {
  position: relative;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #373E4E;
  background-color: #2a3242;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  &.unlocked {
    border-color: rgba(#4CAF50, 0.4);
  }

  &.locked {
    opacity: 0.75;
  }

  h2 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: #8792A4;
    line-height: 1.4;
  }
}

/* ── XP pill ── */
.xp-pill {
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(#F96750, 0.15);
  color: #F96750;
  border: 1px solid rgba(#F96750, 0.35);
}

/* ── Badge image ── */
.badge-visual {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #373E4E;
  border: 2px solid #4E5669;
  flex-shrink: 0;

  .badge-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    filter: grayscale(1) brightness(0.7);

    &.unlocked {
      filter: none;
    }
  }

  .lock-icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    background: rgba(0, 0, 0, 0.3);
  }
}

.badge-card.unlocked .badge-visual {
  border-color: rgba(#4CAF50, 0.6);
}

/* ── Status text ── */
.status-text {
  text-align: center;
  color: #8792A4;
  font-size: 0.9rem;
  margin: 16px 0;

  &.error { color: #F96750; }
}

/* ── Responsive ── */
@media (max-width: 400px) {
  .badges-grid {
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }
}
</style>