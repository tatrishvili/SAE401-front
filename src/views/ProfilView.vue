<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const router = useRouter()

// ✅ IMPORTANT: keep auth object (not destructuring refs)
const auth = useAuth()
const { fetchApi } = useApi()

const entries = ref([])
const loading = ref(true)
const error = ref('')

// 👇 reactive access
const user = auth.user

const totalEntries = computed(() => entries.value.length)

const totalCo2 = computed(() => {
  return entries.value
      .reduce((sum, e) => sum + parseFloat(e.co2Value || 0), 0)
      .toFixed(2)
})

const avgCo2 = computed(() => {
  if (entries.value.length === 0) return '0.00'
  return (parseFloat(totalCo2.value) / entries.value.length).toFixed(2)
})

const todayCo2 = computed(() => {
  const today = new Date().toISOString().split('T')[0]

  const todayEntries = entries.value.filter(e => {
    const entryDate = new Date(e.entryDate).toISOString().split('T')[0]
    return entryDate === today
  })

  return todayEntries
      .reduce((sum, e) => sum + parseFloat(e.co2Value || 0), 0)
      .toFixed(2)
})

const sortedEntries = computed(() => {
  return [...entries.value].sort(
      (a, b) => new Date(b.entryDate) - new Date(a.entryDate)
  )
})

const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

// 🔥 LOAD ENTRIES
const loadEntries = async () => {
  loading.value = true
  error.value = ''

  try {
    const data = await fetchApi('/entries')
    entries.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = e.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

// 🔥 DELETE ENTRY
const deleteEntry = async (id) => {
  if (!confirm('Supprimer cette entrée ?')) return

  try {
    await fetchApi(`/entries/${id}`, { method: 'DELETE' })
    entries.value = entries.value.filter(e => e.id !== id)
  } catch (e) {
    alert('Erreur lors de la suppression')
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/connexion')
}

const goBack = () => {
  router.back()
}

// 🔥 DEBUG + INIT
onMounted(async () => {
  await auth.fetchUserProfile()

  // 👇 IMPORTANT DEBUG LINE
  console.log('USER AFTER FETCH:', user.value)

  await loadEntries()
})
</script>

<template>
  <div class="profile-page">
    <header class="header">
      <button class="icon-btn" @click="goBack">
        <img src="../assets/icones/fleche.png" alt="Retour">
      </button>

      <h1>Profil</h1>

      <button class="icon-btn">
        <img src="../assets/icones/modifier.png" alt="Modifier">
      </button>
    </header>

    <section class="avatar-section">
      <div class="avatar-circle">
        <img src="@/assets/icones/pdp.png" alt="Avatar Koala" />
      </div>

      <h2 class="username">
        {{ user?.name || user?.email || 'Utilisateur' }}
      </h2>
    </section>

    <section class="stats-container">
      <div class="card">
        <p>
          Production quotidienne :
          <span v-if="loading">Chargement...</span>
          <span v-else>{{ todayCo2 }} kg CO₂</span>
        </p>
      </div>

      <div class="card">
        <p>
          Production totale :
          <span v-if="loading">Chargement...</span>
          <span v-else>{{ totalCo2 }} kg CO₂</span>
        </p>
      </div>
    </section>

    <hr class="separator" />

    <section class="history-container">
      <h3 class="section-title">Historique</h3>

      <div v-if="loading" class="card">
        <p>⏳ Chargement...</p>
      </div>

      <div v-else-if="error" class="card">
        <p>❌ {{ error }}</p>
      </div>

      <div v-else-if="sortedEntries.length === 0" class="card">
        <p>Aucune donnée enregistrée</p>
        <router-link to="/calculateur" class="link">
          Commencer un calcul →
        </router-link>
      </div>

      <div v-else class="entries-list">
        <div
            v-for="entry in sortedEntries"
            :key="entry.id"
            class="card entry-card"
        >
          <div class="entry-info">
            <span class="entry-icon">
              {{ entry.category === 'transport' ? '🚗' : '🍽️' }}
            </span>

            <div class="entry-details">
              <p class="entry-value">{{ entry.co2Value }} kg CO₂</p>
              <p class="entry-date">
                {{ formatDate(entry.entryDate) }}
              </p>
            </div>
          </div>

          <button class="delete-btn" @click="deleteEntry(entry.id)">
            🗑️
          </button>
        </div>
      </div>
    </section>

    <hr class="separator" />

    <section class="challenges-container">
      <div class="card challenge">
        <span class="trophy">🏆</span>
        <p>Challenges complétés : {{ totalEntries }} / 5</p>
      </div>
    </section>

    <button class="logout-btn" @click="handleLogout">
      Déconnexion
    </button>
  </div>
</template>

<style scoped>
</style>