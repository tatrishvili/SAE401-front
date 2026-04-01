<template>
  <div class="home">
    <div class="hero">
      <h2>{{ t('home.welcome') }} </h2>
      <p>{{ t('home.description') }}</p>
      <RouterLink to="/calculateur" class="btn-primary">
        {{ t('home.startButton') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

p {
  font-size: 1.2rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 1rem 2rem;
  background: #22c55e;
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #16a34a;
  transform: translateY(-2px);
}
</style>