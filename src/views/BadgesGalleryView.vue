<template>
  <main class="badges-page">
    <header class="badges-header">
      <button class="back-btn" @click="$router.push('/home')">Retour</button>
      <div>
        <h1>Galerie des Trophées</h1>
        <p>Débloque des badges en progressant dans ton parcours éco.</p>
      </div>
    </header>

    <XpDisplay :xp="xp" :next-threshold="nextBadgeThreshold" />

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
        <span class="xp-threshold">{{ badge.xpRequired }} XP</span>
        <div class="badge-visual" :title="badge.name">
          <img
            class="badge-photo"
            :class="{
              unlocked: isUnlocked(badge.id),
              locked: !isUnlocked(badge.id),
            }"
            :src="resolveBadgeImage(badge, index)"
            :alt="badge.name"
          />
        </div>
        <h2>{{ badge.name }}</h2>
        <p>{{ badge.description }}</p>
      </article>
    </section>

    <p v-if="loading" class="status-text">Chargement des trophées...</p>
    <p v-if="errorMessage" class="status-text error">{{ errorMessage }}</p>
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
    data?.nextBadgeXp ??
      data?.nextBadgeThreshold ??
      data?.nextThreshold ??
      data?.next_badge_xp ??
      data?.progress?.nextBadgeXp,
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
    : Array.isArray(stepsPayload)
      ? stepsPayload
      : [];
  const completedCount = steps.filter((step) => step?.isCompleted).length;
  xp.value = mergeXpWithLocal(completedCount * 25);
  return true;
};

const fetchStats = async () => {
  loading.value = true;
  errorMessage.value = "";
  const token =
    localStorage.getItem("token") || localStorage.getItem("auth_token");
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
      xp.value = mergeXpWithLocal(xpFromApi ?? 0);
      earnedBadges.value = Array.isArray(data?.badges) ? data.badges : [];
      const catalogFromApi =
        data?.allBadges ??
        data?.badgesCatalog ??
        data?.availableBadges ??
        data?.catalog ??
        data?.badges_catalog;
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
        errorMessage.value =
          "Impossible de recuperer ta progression pour le moment.";
    }
  } catch {
    const fallbackWorked = await fetchStepsXpFallback(token);
    nextBadgeThreshold.value = computeNextThreshold({});
    localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value));
    if (!fallbackWorked)
      errorMessage.value =
        "Impossible de recuperer ta progression pour le moment.";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);
</script>

<style scoped lang="scss">
@use "@/assets/variables" as v;

.badges-page {
  min-height: 100vh;
  padding: 34px 18px 48px;
  color: v.$l1;
  background:
    radial-gradient(circle at 5% 0%, rgba(v.$c1, 0.12), transparent 36%),
    radial-gradient(circle at 92% 18%, rgba(v.$c2, 0.14), transparent 32%),
    v.$d4;
}

.badges-header {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 1100px;
  margin: 0 auto 20px;
}
.badges-header h1 {
  margin: 0;
  font-size: clamp(1.35rem, 2vw, 2rem);
}
.badges-header p {
  margin: 6px 0 0;
  color: v.$l5;
}
.back-btn {
  border: 1px solid v.$d1;
  background: rgba(v.$d3, 0.95);
  color: v.$l1;
  border-radius: 12px;
  padding: 8px 14px;
  cursor: pointer;
}
.badges-grid {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
}
.badge-card {
  position: relative;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(v.$d1, 0.85);
  background: linear-gradient(180deg, rgba(v.$d3, 0.98), rgba(v.$d4, 0.94));
  box-shadow: 0 12px 24px rgba(v.$d5, 0.22);
}
.xp-threshold {
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 800;
  background: rgba(v.$c2, 0.2);
  color: v.$c2;
  border: 1px solid rgba(v.$c2, 0.45);
}
.badge-visual {
  position: relative;
  width: 72px;
  height: 72px;
  margin-bottom: 12px;
  border-radius: 50%;
  overflow: hidden;
  background:
    radial-gradient(circle at 30% 28%, rgba(v.$l1, 0.24), transparent 26%),
    rgba(v.$c1, 0.08);
  border: 2px solid rgba(v.$c2, 0.62);
}
.badge-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: scale(1.02);
  filter: grayscale(1) brightness(0.78) contrast(1.05);
}
.badge-photo.unlocked {
  filter: none;
}
.badge-card.unlocked .badge-visual {
  box-shadow:
    0 0 0 6px rgba(v.$c1, 0.12),
    inset 0 0 0 1px rgba(v.$l1, 0.04);
}
.badge-card.locked {
  opacity: 0.86;
}
.badge-card h2 {
  margin: 0 0 6px;
  font-size: 1rem;
}
.badge-card p {
  margin: 0;
  color: v.$l5;
  font-size: 0.88rem;
  line-height: 1.45;
}
.status-text {
  max-width: 1100px;
  margin: 16px auto 0;
  color: v.$l5;
}
.status-text.error {
  color: v.$c2;
}
</style>
