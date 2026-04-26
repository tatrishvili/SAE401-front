<template>
  <div class="accueil">
    <div class="card production">
      <h2>
        Production quotidienne : <span>{{ productionToday }} kg CO₂</span>
      </h2>
    </div>
    <div class="card">
      <apexchart
          v-if="chartReady"
          type="radialBar"
          :options="scoreOptions"
          :series="scoreSeries"
          height="220"
      />
    </div>
    <div class="card defi">
      <h2>Défi du jour</h2>
      <p>Ne manger qu'une seule fois de la viande.</p>
      <RouterLink to="/challenges" class="btn"> Voir les défis du jour </RouterLink>
    </div>
    <div class="card conseil">
      <h2>Conseil du jour</h2>
      <p>{{ conseilDuJour }}</p>
    </div>

    <!-- ✅ Two buttons side by side -->
    <div class="bottom-actions">
      <RouterLink to="/calculateur" class="btn-action btn-orange">
        ➕ Entrer une action
      </RouterLink>
      <RouterLink to="/badges" class="btn-action btn-teal">
        🏅 Voir les badges
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const { fetchEntries, isLoggedIn } = useAuth();

const rawData = ref([]);
const chartReady = ref(false);

onMounted(async () => {
  if (isLoggedIn.value) {
    try {
      const entries = await fetchEntries();
      rawData.value = Array.isArray(entries) ? entries : [];
    } catch (e) {
      console.error("Erreur chargement entrées :", e);
    }
  }
  chartReady.value = true;
});

const productionToday = computed(() => {
  const today = new Date().toISOString().split("T")[0];
  const total = rawData.value
      .filter((entry) => {
        const entryDay = (entry.entryDate ?? entry.date ?? "").substring(0, 10);
        return entryDay === today;
      })
      .reduce((sum, entry) => sum + (entry.co2Value ?? entry.co2 ?? 0), 0);
  return total > 0 ? total.toFixed(3) : "--";
});

const scoreValue = computed(() => {
  if (productionToday.value === "--") return 68;
  const total = parseFloat(productionToday.value);
  return Math.max(0, Math.min(100, Math.round(100 - total * 5)));
});

const scoreSeries = computed(() => [scoreValue.value]);

const chartColor = computed(() => {
  const val = scoreValue.value;
  if (val >= 70) return ["#4CAF50", "#81C784"];
  if (val >= 40) return ["#FFD166", "#FFB347"];
  return ["#F96750", "#e05030"];
});

const scoreOptions = computed(() => ({
  chart: {
    background: "transparent",
    toolbar: { show: false },
    animations: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      startAngle: -135,
      endAngle: 135,
      hollow: {
        size: "55%",
        background: "transparent",
      },
      track: {
        background: "#373E4E",
        strokeWidth: "100%",
        margin: 0,
      },
      dataLabels: {
        show: true,
        name: {
          show: true,
          fontSize: "13px",
          fontWeight: 400,
          color: "#8792A4",
          offsetY: 30,
          formatter: () => "aujourd'hui",
        },
        value: {
          show: true,
          fontSize: "20px",
          fontWeight: 800,
          color: "#ffffff",
          offsetY: 0,
          formatter: (val) => {
            const n = parseInt(val);
            if (n >= 70) return " Excellent";
            if (n >= 40) return " Correct";
            return " À améliorer";
          },
        },
      },
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shade: "dark",
      type: "horizontal",
      gradientToColors: [chartColor.value[1]],
      stops: [0, 100],
      colorStops: [
        { offset: 0, color: chartColor.value[0], opacity: 1 },
        { offset: 100, color: chartColor.value[1], opacity: 1 },
      ],
    },
  },
  colors: [chartColor.value[0]],
  stroke: { lineCap: "round" },
  theme: { mode: "dark" },
}));

const conseils = [
  "Manger moins de viande aide à baisser sa production de CO2, et est également bon pour la santé.",
  "Préférer les transports en commun réduit significativement ton empreinte carbone.",
  "Éteindre les appareils en veille peut réduire ta consommation électrique de 10%.",
  "Acheter local et de saison diminue l'impact lié au transport des aliments.",
];

const conseilDuJour = ref(
    conseils[Math.floor(Math.random() * conseils.length)],
);
</script>

<style scoped>
.accueil {
  display: flex;
  flex-direction: column;
  gap: 2vh;
  padding: 2vh 2vh 40vh 2vh;
  box-sizing: border-box;
}

h1{
  color:white;
}
/* Small button inside defi card */
.card.defi .btn {
  display: inline-block;
  width: auto;
  margin-top: 1.5vh;
  padding: 0.8vh 2.5vh;
  font-size: 13px;
  border-radius: 50px;
  text-decoration: none;
  color: #ffffff;
  background-color: #F96750;
  border-right: 0.3vh solid #df4830;
  border-bottom: 0.6vh solid #df4830;
  border-left: 0.3vh solid #df4830;
  font-family: "M PLUS Rounded 1c", sans-serif;
  font-weight: 600;
  cursor: pointer;
}

/* ✅ Row container for the two bottom buttons */
.bottom-actions {
  display: flex;
  gap: 2vw;
  width: 100%;
}

/* ✅ Shared base style for both buttons */
.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vh 1vh;
  font-size: 15px;
  border-radius: 2vh;
  text-decoration: none;
  text-align: center;
  font-family: "M PLUS Rounded 1c", sans-serif;
  font-weight: 600;
  cursor: pointer;
  color: #ffffff;
  transition: background-color 0.15s ease, transform 0.1s ease;
  box-sizing: border-box;
}

.btn-action:active {
  transform: scale(0.97);
}

/* ✅ Orange — Entrer une action */
.btn-orange {
  background-color: #F96750;
  border-right: 0.5vh solid #df4830;
  border-bottom: 1vh solid #df4830;
  border-left: 0.5vh solid #df4830;
}
.btn-orange:hover {
  background-color: #e0502a;
}

/* ✅ Teal — Voir les badges */
.btn-teal {
  background-color: #55974d;
  border-right: 0.5vh solid #438c37;
  border-bottom: 1vh solid #375721;
  border-left: 0.5vh solid #193317;
  color: #ffffff;
}
.btn-teal:hover {
  background-color: #325a19;
  color: #ffffff;
}
</style>