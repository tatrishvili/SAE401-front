<template>
  <main class="badges-page">
    <header class="badges-header">
      <button class="back-btn" @click="$router.push('/')">Retour</button>
      <div>
        <h1>Galerie des Trophees</h1>
        <p>Debloque des badges en progressant dans ton parcours eco.</p>
      </div>
    </header>

    <XpDisplay :xp="xp" :next-threshold="nextBadgeThreshold" />

    <section class="badges-grid" v-if="displayedBadges.length > 0">
      <article
        v-for="badge in displayedBadges"
        :key="badge.id"
        class="badge-card"
        :class="{ locked: !isUnlocked(badge.id), unlocked: isUnlocked(badge.id) }"
      >
        <span class="xp-threshold">{{ badge.xpRequired }} XP</span>
        <div class="badge-icon" :title="badge.name">{{ badge.icon }}</div>
        <h2>{{ badge.name }}</h2>
        <p>{{ badge.description }}</p>
      </article>
    </section>

    <p v-if="loading" class="status-text">Chargement des trophees...</p>
    <p v-if="errorMessage" class="status-text error">{{ errorMessage }}</p>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import XpDisplay from '@/components/XpDisplay.vue'

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const BADGE_SEEN_KEY = 'seenUnlockedBadgesCount'

const DEFAULT_BADGES = [
  {
    id: 'sprout',
    name: 'Sprout',
    description: 'Premier pas vers une routine plus verte.',
    icon: '🌱',
    xpRequired: 25,
  },
  {
    id: 'recycler',
    name: 'Recycler',
    description: 'Tri et recyclage valides plusieurs fois.',
    icon: '♻️',
    xpRequired: 60,
  },
  {
    id: 'water-saver',
    name: 'Eco Eau',
    description: 'Habitudes d economie d eau maintenues.',
    icon: '💧',
    xpRequired: 100,
  },
  {
    id: 'bike-rider',
    name: 'Mobilite Douce',
    description: 'Deplacements responsables et reguliers.',
    icon: '🚲',
    xpRequired: 180,
  },
  {
    id: 'solar-mind',
    name: 'Energie Claire',
    description: 'Actions liees a la reduction energetique.',
    icon: '☀️',
    xpRequired: 260,
  },
  {
    id: 'planet-guardian',
    name: 'Gardien Planete',
    description: 'Palier elite de progression eco.',
    icon: '🏆',
    xpRequired: 400,
  },
]

const xp = ref(0)
const earnedBadges = ref([])
const badgesCatalog = ref(DEFAULT_BADGES)
const nextBadgeThreshold = ref(100)
const loading = ref(false)
const errorMessage = ref('')

const toValidNumber = (...values) => {
  for (const value of values) {
    const num = Number(value)
    if (Number.isFinite(num) && num >= 0) {
      return num
    }
  }

  return null
}

const normalizeBadge = (badge) => ({
  id: String(badge.id ?? badge.slug ?? badge.code ?? badge.name ?? '').toLowerCase(),
  name: badge.name ?? badge.label ?? 'Badge',
  description: badge.description ?? badge.details ?? 'Badge a debloquer',
  icon: badge.icon ?? '🏅',
  xpRequired: Number(badge.xpRequired ?? badge.requiredXp ?? badge.threshold ?? 0),
})

const normalizeBadgesArray = (value) =>
  Array.isArray(value) ? value.map(normalizeBadge).filter((badge) => badge.id) : []

const displayedBadges = computed(() => {
  const earnedMap = new Map(
    normalizeBadgesArray(earnedBadges.value).map((badge) => [badge.id, badge]),
  )
  const catalog = normalizeBadgesArray(badgesCatalog.value)

  const merged = catalog.map((badge) => {
    const unlockedVersion = earnedMap.get(badge.id)
    return unlockedVersion ? { ...badge, ...unlockedVersion } : badge
  })

  for (const unlocked of earnedMap.values()) {
    if (!merged.find((badge) => badge.id === unlocked.id)) {
      merged.push(unlocked)
    }
  }

  return merged
})

const unlockedIds = computed(() => {
  const unlockedFromApi = normalizeBadgesArray(earnedBadges.value).map((badge) => badge.id)
  const unlockedFromXp = normalizeBadgesArray(badgesCatalog.value)
    .filter((badge) => badge.xpRequired > 0 && xp.value >= badge.xpRequired)
    .map((badge) => badge.id)

  return new Set([...unlockedFromApi, ...unlockedFromXp])
})
const isUnlocked = (badgeId) => unlockedIds.value.has(String(badgeId).toLowerCase())
const unlockedCount = computed(
  () => displayedBadges.value.filter((badge) => isUnlocked(badge.id)).length,
)

const computeNextThreshold = (data) => {
  const directThreshold = Number(
    data?.nextBadgeXp ??
      data?.nextBadgeThreshold ??
      data?.nextThreshold ??
      data?.next_badge_xp ??
      data?.progress?.nextBadgeXp,
  )

  if (Number.isFinite(directThreshold) && directThreshold > 0) {
    return directThreshold
  }

  const fromCatalog = displayedBadges.value
    .filter((badge) => !isUnlocked(badge.id) && badge.xpRequired > xp.value)
    .sort((a, b) => a.xpRequired - b.xpRequired)[0]

  if (fromCatalog) {
    return fromCatalog.xpRequired
  }

  return Math.max(100, xp.value + 100)
}

const fetchStepsXpFallback = async (token) => {
  const stepsResponse = await fetch(`${API_BASE}/steps`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!stepsResponse.ok) {
    return false
  }

  const stepsPayload = await stepsResponse.json()
  const steps = Array.isArray(stepsPayload?.data)
    ? stepsPayload.data
    : Array.isArray(stepsPayload)
      ? stepsPayload
      : []
  const completedCount = steps.filter((step) => step?.isCompleted).length
  xp.value = completedCount * 25
  return true
}

const fetchStats = async () => {
  loading.value = true
  errorMessage.value = ''
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

      xp.value = xpFromApi ?? 0
      earnedBadges.value = Array.isArray(data?.badges) ? data.badges : []

      const catalogFromApi =
        data?.allBadges ??
        data?.badgesCatalog ??
        data?.availableBadges ??
        data?.catalog ??
        data?.badges_catalog

      if (Array.isArray(catalogFromApi) && catalogFromApi.length > 0) {
        badgesCatalog.value = catalogFromApi
      }

      if (xpFromApi === null) {
        await fetchStepsXpFallback(token)
      }

      nextBadgeThreshold.value = computeNextThreshold(data)
      localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value))
    } else {
      const fallbackWorked = await fetchStepsXpFallback(token)
      nextBadgeThreshold.value = computeNextThreshold({})
      localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value))
      if (!fallbackWorked) {
        errorMessage.value = 'Impossible de recuperer ta progression pour le moment.'
      }
    }
  } catch {
    const fallbackWorked = await fetchStepsXpFallback(token)
    nextBadgeThreshold.value = computeNextThreshold({})
    localStorage.setItem(BADGE_SEEN_KEY, String(unlockedCount.value))
    if (!fallbackWorked) {
      errorMessage.value = 'Impossible de recuperer ta progression pour le moment.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped lang="scss">
@use '@/assets/variables' as v;

.badges-page {
  min-height: 100vh;
  padding: 34px 18px 48px;
  color: v.$text-white;
  background:
    radial-gradient(circle at 5% 0%, rgba(v.$eco-green, 0.12), transparent 36%),
    radial-gradient(circle at 92% 18%, rgba(v.$badge-gold, 0.14), transparent 32%), v.$bg-dark;
}

.badges-header {
  display: flex;
  align-items: center;
  gap: 14px;
  max-width: 1100px;
  margin: 0 auto 20px;

  h1 {
    margin: 0;
    font-size: clamp(1.35rem, 2vw, 2rem);
  }

  p {
    margin: 6px 0 0;
    color: v.$text-muted;
  }
}

.back-btn {
  border: 1px solid v.$card-border;
  background: rgba(v.$card-bg, 0.95);
  color: v.$text-white;
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
  border: 1px solid rgba(v.$card-border, 0.85);
  background: linear-gradient(180deg, rgba(v.$card-bg, 0.98), rgba(v.$status-btn-bg, 0.94));
  box-shadow: 0 12px 24px rgba(v.$black, 0.22);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease,
    opacity 0.22s ease;

  .xp-threshold {
    position: absolute;
    top: 10px;
    right: 10px;
    border-radius: 999px;
    padding: 4px 9px;
    font-size: 0.72rem;
    font-weight: 800;
    background: rgba(v.$badge-gold, 0.2);
    color: v.$badge-gold;
    border: 1px solid rgba(v.$badge-gold, 0.45);
  }

  .badge-icon {
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-size: 1.9rem;
    background: rgba(v.$badge-gold, 0.18);
    border: 1px solid rgba(v.$badge-gold, 0.45);
  }

  h2 {
    margin: 0;
    font-size: 1rem;
  }

  p {
    margin: 8px 0 0;
    color: v.$text-gray;
    font-size: 0.84rem;
    line-height: 1.4;
  }

  &.unlocked {
    .xp-threshold {
      background: rgba(v.$success, 0.2);
      color: v.$success;
      border-color: rgba(v.$success, 0.45);
    }

    .badge-icon {
      box-shadow: 0 8px 18px rgba(v.$badge-gold, 0.35);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 18px 28px rgba(v.$black, 0.28);
    }
  }

  &.locked {
    filter: grayscale(1);
    opacity: 0.45;
  }
}

.status-text {
  text-align: center;
  color: v.$text-muted;
  margin-top: 20px;

  &.error {
    color: v.$danger;
  }
}

@media (max-width: 640px) {
  .badges-page {
    padding: 18px 12px 32px;
  }

  .badges-header {
    align-items: flex-start;
    gap: 10px;

    h1 {
      font-size: 1.25rem;
    }

    p {
      font-size: 0.85rem;
    }
  }

  .back-btn {
    padding: 8px 10px;
    font-size: 0.85rem;
  }

  .badges-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .badge-card {
    padding: 12px;

    .xp-threshold {
      top: 8px;
      right: 8px;
      padding: 3px 7px;
      font-size: 0.66rem;
    }

    .badge-icon {
      width: 54px;
      height: 54px;
      font-size: 1.6rem;
      margin-bottom: 8px;
    }

    h2 {
      font-size: 0.9rem;
    }

    p {
      font-size: 0.78rem;
    }
  }
}
</style>
