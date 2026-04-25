<template>
  <div class="connexion">
    <div class="content">
      <h1>Connexion</h1>

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
        <p v-if="submitted && !emailValide" class="error">
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
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <img :src="showPassword ? EyeOpen : EyeClosed" alt="Afficher / Masquer le mot de passe" />
          </button>
        </div>
        <p v-if="submitted && !passwordValide" class="error">
          Mot de passe incorrecte.
        </p>

        <p v-if="apiError" class="error api-error">⚠️ {{ apiError }}</p>

        <div class="forgot">
          <p>Mot de passe oublié</p>
        </div>

        <button
            @click="handleLogin"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Connexion</span>
        </button>

      </div>

      <div class="span">
        <span class="span-line" />
        <span class="span-text">Ou créer un compte avec</span>
        <span class="span-line" />
      </div>

      <button @click="handleEmailSignup" class="button2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="social-icon">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="M2 7l10 7 10-7"/>
        </svg>
        E-Mail
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

import EyeOpen from '@/assets/icones/eye-open.svg'
import EyeClosed from '@/assets/icones/eye-closed.svg'

const router = useRouter()
const { login, loading } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const apiError = ref('')

const emailValide = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
)

const passwordValide = computed(() => password.value.trim().length > 0)

const formValide = computed(() => emailValide.value && passwordValide.value)

async function handleLogin() {
  submitted.value = true
  apiError.value = ''

  if (!formValide.value) return

  try {
    await login(email.value.trim(), password.value)
    router.push('/profil')
  } catch (e) {
    console.error('Erreur connexion :', e)
    apiError.value = e.message || 'Erreur de connexion. Vérifiez vos identifiants.'
  }
}

function handleEmailSignup() {
  router.push('/inscription')
}
</script>