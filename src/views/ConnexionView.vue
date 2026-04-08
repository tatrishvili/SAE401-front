<template>
  <div class="connexion-screen">
    <div class="content">
      <h1 class="title">Connexion</h1>

      <div class="form">
        <div class="input-wrapper">
          <input
              v-model="email"
              type="email"
              placeholder="E-Mail"
              class="input"
              :class="{ 'input-error': submitted && !emailValide }"
              autocomplete="email"
              :disabled="loading"
          />
        </div>
        <p v-if="submitted && !emailValide" class="error-msg">
          Adresse e-mail invalide.
        </p>

        <div class="input-wrapper">
          <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe"
              class="input"
              :class="{ 'input-error': submitted && !passwordValide }"
              autocomplete="current-password"
              :disabled="loading"
              @keyup.enter="handleLogin"
          />
          <button
              class="toggle-password"
              type="button"
              @click="showPassword = !showPassword"
              tabindex="-1"
          >
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
          Veuillez entrer votre mot de passe.
        </p>

        <p v-if="apiError" class="error-msg api-error">
           {{ apiError }}
        </p>

        <div class="forgot-row">
          <a href="#" class="forgot-link">Mot de passe oublié&nbsp;?</a>
        </div>

        <button
            class="connexion-btn"
            type="button"
            @click="handleLogin"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Connexion</span>
        </button>
      </div>

      <div class="separator">
        <span class="separator-line" />
        <span class="separator-text">Ou créer un compte avec</span>
        <span class="separator-line" />
      </div>

      <div class="social-buttons">
        <button class="social-btn" type="button" @click="handleEmailSignup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="social-icon">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 7l10 7 10-7"/>
          </svg>
          E-Mail
        </button>

        <button class="social-btn" type="button" @click="handleAppleSignup">
          <svg viewBox="0 0 24 24" fill="currentColor" class="social-icon apple-icon">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, loading } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const apiError = ref('')

const emailValide = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
})

const passwordValide = computed(() => {
  return password.value.trim().length > 0
})

const formValide = computed(() => {
  return emailValide.value && passwordValide.value
})

async function handleLogin() {
  submitted.value = true
  apiError.value = ''

  if (!formValide.value) return

  const cleanEmail = email.value.trim()
  const cleanPassword = password.value

  try {
    await login(cleanEmail, cleanPassword)
    router.push('/profile')
  } catch (e) {
    console.error('Erreur connexion :', e)
    apiError.value = e.message || 'Erreur de connexion. Vérifiez vos identifiants.'
  }
}

function handleEmailSignup() {
  router.push('/inscription')
}

function handleAppleSignup() {
  console.log('Apple signup not implemented')
}
</script>