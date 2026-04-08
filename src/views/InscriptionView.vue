<template>
  <div class="inscription-screen">
    <div class="content">

      <!-- Header -->
      <div class="header">
        <button class="back-btn" @click="router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <h1 class="title">Créer un compte</h1>
      <p class="subtitle">Rejoignez EcoCarbo et réduisez votre empreinte CO₂.</p>

      <div class="form">

        <!-- Nom -->
        <div class="field">
          <div class="input-wrapper">
            <input
              v-model="nom"
              type="text"
              placeholder="Nom"
              class="input"
              :class="{ 'input-error': submitted && !nomValide }"
              autocomplete="name"
            />
          </div>
          <p v-if="submitted && !nomValide" class="error-msg">
            Le nom doit contenir au moins 2 caractères.
          </p>
        </div>

        <!-- Email -->
        <div class="field">
          <div class="input-wrapper">
            <input
              v-model="email"
              type="email"
              placeholder="E-Mail"
              class="input"
              :class="{ 'input-error': submitted && !emailValide }"
              autocomplete="email"
            />
          </div>
          <p v-if="submitted && !emailValide" class="error-msg">
            Adresse e-mail invalide.
          </p>
        </div>

        <!-- Mot de passe -->
        <div class="field">
          <div class="input-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              class="input"
              :class="{ 'input-error': submitted && !passwordValide }"
              autocomplete="new-password"
            />
            <button class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <p v-if="submitted && !passwordValide" class="error-msg">
            Min. 5 caractères, une majuscule, une minuscule et un caractère spécial.
          </p>

          <!-- Indicateur de force -->
          <div v-if="password.length > 0" class="strength-bar">
            <div
              v-for="n in 4"
              :key="n"
              class="strength-segment"
              :class="strengthClass(n)"
            />
          </div>
          <p v-if="password.length > 0" class="strength-label" :class="strengthLabelClass">
            {{ strengthLabel }}
          </p>
        </div>

        <!-- Bouton -->
        <button class="inscription-btn" @click="handleInscription">
          Créer mon compte
        </button>

      </div>

      <!-- Lien connexion -->
      <p class="login-link">
        Déjà un compte ?
        <a @click="router.push('/connexion')" class="link">Se connecter</a>
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const nom = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)

// Validations
const nomValide = computed(() => nom.value.trim().length >= 2)

const emailValide = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
)

const passwordValide = computed(() => {
  const v = password.value
  return (
    v.length >= 5 &&
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /[^a-zA-Z0-9]/.test(v)
  )
})

const formValide = computed(() =>
  nomValide.value && emailValide.value && passwordValide.value
)

// Force du mot de passe (0 à 4)
const strengthScore = computed(() => {
  const v = password.value
  let score = 0
  if (v.length >= 5) score++
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++
  if (/[^a-zA-Z0-9]/.test(v)) score++
  if (v.length >= 10) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  return labels[strengthScore.value]
})

const strengthLabelClass = computed(() => {
  const classes = ['very-weak', 'weak', 'medium', 'strong', 'very-strong']
  return classes[strengthScore.value]
})

function strengthClass(n) {
  if (n > strengthScore.value) return 'empty'
  const classes = ['', 'very-weak', 'weak', 'medium', 'strong', 'very-strong']
  return classes[strengthScore.value]
}

function handleInscription() {
  submitted.value = true
  if (!formValide.value) return
  // TODO: logique d'inscription
  router.push('/home')
}
</script>


