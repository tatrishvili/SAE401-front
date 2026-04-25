import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import VueApexCharts from "vue3-apexcharts";
import i18n from "./i18n/index.js";
import "./assets/styles/style.css";
import "./assets/styles/main.scss";

const app = createApp(App);
app.use(router);
app.use(i18n);
app.use(VueApexCharts);
app.mount("#app");
