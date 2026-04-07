<template>
  <div class="connexion-screen">
    <div class="content">
      <h1 class="title">Connexion</h1>

      <div class="form">
        <!-- Email -->
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

        <!-- Mot de passe -->
        <div class="input-wrapper">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Mot de passe"
            class="input"
            :class="{ 'input-error': submitted && !passwordValide }"
            autocomplete="current-password"
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

        <!-- Mot de passe oublié -->
        <div class="forgot-row">
          <a href="#" class="forgot-link">Mot de passe oublié&nbsp;?</a>
        </div>

        <!-- Bouton Connexion -->
        <button class="connexion-btn" @click="handleLogin">
          Connexion
        </button>
      </div>

      <!-- Séparateur -->
      <div class="separator">
        <span class="separator-line" />
        <span class="separator-text">Ou créer un compte avec</span>
        <span class="separator-line" />
      </div>

      <!-- Boutons sociaux -->
      <div class="social-buttons">
        <button class="social-btn" @click="handleEmailSignup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="social-icon">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M2 7l10 7 10-7"/>
          </svg>
          E-Mail
        </button>

        <button class="social-btn" @click="handleAppleSignup">
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

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitted = ref(false)

const emailValide = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})



const passwordValide = computed(() => {
  const v = password.value
  return (
    v.length >= 5 &&
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /[^a-zA-Z0-9]/.test(v)
  )
})

const formValide = computed(() => emailValide.value && passwordValide.value)

function handleLogin() {
  submitted.value = true
  if (!formValide.value) return
  router.push('/home')
}

function handleEmailSignup() {
  router.push('/inscription')
}  
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

.connexion-screen {
  font-family: 'Nunito', sans-serif;
  background-color: #1e2530;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
  box-sizing: border-box;
}

.content {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: fadeUp 0.5s ease both;
}

.title {
  font-size: 1.9rem;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  margin: 0 0 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.input::placeholder {
  color: #7a8899;
}

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
  margin: -8px 0 0 4px;
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

.toggle-password:hover {
  color: #aab4c0;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 0.85rem;
  color: #c8d0da;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.forgot-link:hover {
  color: #ffffff;
}

.connexion-btn {
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

.connexion-btn:hover {
  background-color: #e05f40;
  box-shadow: 0 6px 24px rgba(240, 112, 80, 0.5);
  transform: translateY(-1px);
}

.connexion-btn:active {
  transform: translateY(1px);
}

.separator {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
}

.separator-line {
  flex: 1;
  height: 1px;
  background-color: #3a4555;
}

.separator-text {
  font-size: 0.82rem;
  color: #7a8899;
  white-space: nowrap;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: transparent;
  border: 1.5px solid #f07050;
  border-radius: 50px;
  padding: 14px 0;
  width: 100%;
  font-family: 'Nunito', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.15s;
}

.social-btn:hover {
  background-color: rgba(240, 112, 80, 0.08);
  transform: translateY(-1px);
}

.social-btn:active {
  transform: translateY(1px);
}

.social-icon {
  width: 20px;
  height: 20px;
}

.apple-icon {
  width: 18px;
  height: 18px;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>