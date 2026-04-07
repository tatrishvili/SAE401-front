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

<style lang="css" scoped>
@import "@/assets/styles/style.css";

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
  margin-bottom: 30px;
  background-color: $card-bg;

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

.stats-container, .challenges-container {
  width: 100%;
  max-width: 320px;
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