<script setup>
</script>

<template>
  <div class="profile-page">
    <header class="header">
      <button class="icon-btn"><img src="../assets/icones/fleche.png" alt=""></button>
      <h1>Profil</h1>
      <button class="icon-btn"><img src="../assets/icones/modifier.png" alt=""></button>
    </header>

    <section class="avatar-section">
      <div class="avatar-circle">
        <img src="@/assets/icones/pdp.png" alt="Avatar Koala" />
      </div>
      <h2 class="username">M. Patate</h2>
    </section>

    <section class="stats-container">
      <div class="card">
        <p>Production quotidienne : <span>--- CO2</span></p>
      </div>
      <div class="card">
        <p>Production totale : <span>--- CO2</span></p>
      </div>
    </section>

    <hr class="separator" />

    <section class="challenges-container">
      <div class="card challenge">
        <span class="trophy">🏆</span>
        <p>Challenges complétés : - /5</p>
      </div>
    </section>

    <button class="logout-btn">Déconnexion</button>
  </div>
</template>

