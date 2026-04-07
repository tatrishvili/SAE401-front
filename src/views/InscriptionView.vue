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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.inscription-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 28px;
  box-sizing: border-box;
}

.content {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  animation: fadeUp 0.5s ease both;
}

/* Header */
.header {
  display: flex;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #c8d0da;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.back-btn:hover { color: #ffffff; }

.back-btn svg {
  width: 22px;
  height: 22px;
}

/* Title */
.title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.subtitle {
  font-size: 0.88rem;
  color: #7a8899;
  margin: -8px 0 0;
  line-height: 1.5;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  background-color: #2a3242;
  border: 1.5px solid transparent;
  border-radius: 14px;
  padding: 16px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  color: #ffffff;
  outline: none;
  box-sizing: border-box;
  transition: background-color 0.2s, border-color 0.2s;
}

.input::placeholder { color: #7a8899; }

.input:focus {
  background-color: #313d52;
  border-color: #3a4f6a;
}

.input-error {
  border-color: #f07050 !important;
}

.error-msg {
  color: #f07050;
  font-size: 0.78rem;
  margin: 0 0 0 4px;
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #7a8899;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
}

.toggle-password:hover { color: #aab4c0; }
.toggle-password svg { width: 20px; height: 20px; }

/* Strength bar */
.strength-bar {
  display: flex;
  gap: 5px;
  margin-top: 2px;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 4px;
  background-color: #3a4555;
  transition: background-color 0.3s;
}

.strength-segment.very-weak  { background-color: #e05030; }
.strength-segment.weak       { background-color: #f08030; }
.strength-segment.medium     { background-color: #f0c030; }
.strength-segment.strong     { background-color: #60c070; }
.strength-segment.very-strong{ background-color: #30b060; }
.strength-segment.empty      { background-color: #3a4555; }

.strength-label {
  font-size: 0.75rem;
  margin: 0 0 0 2px;
}

.strength-label.very-weak  { color: #e05030; }
.strength-label.weak       { color: #f08030; }
.strength-label.medium     { color: #f0c030; }
.strength-label.strong     { color: #60c070; }
.strength-label.very-strong{ color: #30b060; }

/* Button */
.inscription-btn {
  background-color: #f07050;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: 50px;
  padding: 16px 0;
  width: 100%;
  cursor: pointer;
  margin-top: 4px;
  transition: background-color 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(240, 112, 80, 0.35);
}

.inscription-btn:hover {
  background-color: #e05f40;
  box-shadow: 0 6px 24px rgba(240, 112, 80, 0.5);
  transform: translateY(-1px);
}

.inscription-btn:active { transform: translateY(1px); }

/* Login link */
.login-link {
  text-align: center;
  font-size: 0.85rem;
  color: #7a8899;
  margin: 0;
}

.link {
  color: #f07050;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.link:hover { color: #e05f40; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>