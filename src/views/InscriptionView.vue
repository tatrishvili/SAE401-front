<template>
  <div class="inscription">
    <div class="content">

      <h1>Créer un compte</h1>
      <p>Rejoignez EcoCarbo<br>et réduisez votre empreinte de CO2 !</p>

      <div class="form">

        <div class="input-wrapper">
          <input
              v-model="nom"
              type="text"
              placeholder="Pseudo"
              class="input"
              :class="{ 'input-error': submitted && !nomValide }"
              autocomplete="name"
              :disabled="loading"
          />
        </div>
        <p v-if="submitted && !nomValide" class="error-msg">
          Le pseudo doit contenir au moins 2 caractères.
        </p>

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
              autocomplete="new-password"
              :disabled="loading"
              @keyup.enter="handleInscription"
          />
          <button type="button" class="toggle-password" @click="showPassword = !showPassword">
            <img :src="showPassword ? EyeOpen : EyeClosed" alt="Afficher / Masquer le mot de passe" />
          </button>
        </div>
        <p v-if="submitted && !passwordValide" class="error-msg">
          Le mot de passe doit être composé d'au moins 5 caractères dont une majuscule, une minuscule et un caractère spécial.
        </p>

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

        <p v-if="apiError" class="error-msg api-error">⚠️ {{ apiError }}</p>
        <p v-if="successMessage" class="success-msg">✅ {{ successMessage }}</p>

        <button
            @click="handleInscription"
            :disabled="loading"
            :class="{ 'btn-loading': loading }"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Créer mon compte</span>
        </button>

      </div>

      <p>
        Vous avez déjà un compte ?<br>
        <a @click="router.push('/connexion')">Se connecter</a>
      </p>

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
const { register, login, loading } = useAuth()

const nom = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)
const apiError = ref('')
const successMessage = ref('')

const nomValide = computed(() => nom.value.trim().length >= 2)

const emailValide = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
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

async function handleInscription() {
  submitted.value = true
  apiError.value = ''
  successMessage.value = ''

  if (!formValide.value) return

  const cleanName = nom.value.trim()
  const cleanEmail = email.value.trim()
  const cleanPassword = password.value

  try {

    await register(cleanName, cleanEmail, cleanPassword)
    successMessage.value = 'Compte créé avec succès ! Connexion en cours...'

    await login(cleanEmail, cleanPassword)

    router.push('/profile')
  } catch (e) {
    console.error('Erreur inscription :', e)
    apiError.value = e.message || "Erreur lors de l'inscription"
  }
}
</script>