<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const { user, logout, fetchUserProfile } = useAuth()
const { fetchApi } = useApi()

const entries = ref([])
const loading = ref(true)
const error = ref('')

const totalEntries = computed(() => entries.value.length)

const totalCo2 = computed(() => {
  return entries.value.reduce((sum, e) => sum + parseFloat(e.co2Value || 0), 0).toFixed(2)
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
  return todayEntries.reduce((sum, e) => sum + parseFloat(e.co2Value || 0), 0).toFixed(2)
})

const sortedEntries = computed(() => {
  return [...entries.value].sort((a, b) => {
    return new Date(b.entryDate) - new Date(a.entryDate)
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

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
  logout()
  router.push('/connexion')
}

const goBack = () => {
  router.back()
}

// ✅ Fixed: Added "async" before the arrow function
onMounted(async () => {
  await fetchUserProfile()
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
      <!-- ✅ Fixed: Shows name first, then email as fallback -->
      <h2 class="username">{{ user?.name || user?.email || 'Utilisateur' }}</h2>
    </section>

    <section class="stats-container">
      <div class="card">
        <p>Production quotidienne :
          <span v-if="loading">Chargement...</span>
          <span v-else>{{ todayCo2 }} kg CO₂</span>
        </p>
      </div>
      <div class="card">
        <p>Production totale :
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
        <router-link to="/calculateur" class="link">Commencer un calcul →</router-link>
      </div>

      <div v-else class="entries-list">
        <div v-for="entry in sortedEntries" :key="entry.id" class="card entry-card">
          <div class="entry-info">
            <span class="entry-icon">
              {{ entry.category === 'transport' ? '🚗' : '🍽️' }}
            </span>
            <div class="entry-details">
              <p class="entry-value">{{ entry.co2Value }} kg CO₂</p>
              <p class="entry-date">{{ formatDate(entry.entryDate) }}</p>
            </div>
          </div>
          <button class="delete-btn" @click="deleteEntry(entry.id)">🗑️</button>
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

    <button class="logout-btn" @click="handleLogout">Déconnexion</button>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 0px;
  background-color: #242933;
  color: white;
}

.header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  margin-bottom: 30px;
  background-color: #3b4252;

  h1 {
    font-size: 1.5rem;
    font-weight: 500;
  }

  .icon-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 5px;

    img {
      width: 24px;
      height: 24px;
    }
  }
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;

  .avatar-circle {
    width: 140px;
    height: 140px;
    background-color: white;
    border-radius: 50%;
    margin: 0 auto 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    img {
      width: 70%;
    }
  }

  .username {
    font-size: 1.2rem;
    font-weight: 600;
  }
}

.stats-container,
.challenges-container,
.history-container {
  width: 100%;
  max-width: 320px;
  padding: 0 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.8);
}

.card {
  background-color: #3b4252;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 12px;

  p {
    margin: 0;
    font-size: 0.9rem;
  }

  &.challenge {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.entry-card {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .entry-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .entry-icon {
    font-size: 1.5rem;
  }

  .entry-details {
    .entry-value {
      font-weight: 600;
      color: #88c999;
      margin-bottom: 4px;
    }

    .entry-date {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .delete-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px;
    opacity: 0.7;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}

.entries-list {
  max-height: 250px;
  overflow-y: auto;
}

.link {
  display: inline-block;
  margin-top: 10px;
  color: #88c999;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.separator {
  width: 60%;
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  margin: 20px 0;
}

.logout-btn {
  margin-top: auto;
  background-color: #ff6b4a;
  color: white;
  border: none;
  padding: 15px;
  width: 80%;
  max-width: 250px;
  border-radius: 15px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 20px;

  &:active {
    opacity: 0.8;
  }
}
</style>