import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/WelcomeView.vue";
import AccueilView from "@/views/AccueilView.vue";
import ConnexionView from "@/views/ConnexionView.vue";
import ConseilsView from "@/views/ConseilsView.vue";
import InscriptionView from "@/views/InscriptionView.vue";
import CalculateurView from "@/views/CalculateurView.vue";
import ProfilView from "@/views/ProfilView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ChallengesOverviewView from "@/views/ChallengesOverviewView.vue";
import ChallengesView from "@/views/ChallengesView.vue";
import BadgesGalleryView from "@/views/BadgesGalleryView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Welcome",
      component: WelcomeView,
      meta: { title: "Bienvenue", showHeader: false, showFooter: false },
    },
    {
      path: "/connexion",
      name: "Connexion",
      component: ConnexionView,
      meta: { title: "Connexion", showHeader: false, showFooter: false },
    },
    {
      path: "/home",
      name: "Accueil",
      component: AccueilView,
      meta: { title: "Accueil", showHeader: true, showFooter: true },
    },
    {
      path: "/conseils",
      alias: ["/defis"],
      name: "Conseils",
      component: ConseilsView,
      meta: { title: "Conseils", showHeader: false, showFooter: true },
    },
    {
      path: "/inscription",
      name: "Inscription",
      component: InscriptionView,
      meta: { title: "Inscription", showHeader: false, showFooter: false },
    },
    {
      path: "/calculateur",
      name: "Action",
      component: CalculateurView,
      meta: { title: "Calculateur", showHeader: true, showFooter: true },
    },
    {
      path: "/profil",
      name: "Profil",
      component: ProfilView,
      meta: { title: "Profil", showHeader: true, showFooter: true },
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: DashboardView,
      meta: { title: "Dashboard", showHeader: false, showFooter: true },
    },
    {
      path: "/challenges",
      name: "ChallengesOverview",
      component: ChallengesOverviewView,
      meta: { title: "Parcours", showHeader: false, showFooter: true },
    },
    {
      path: "/challenges/:id",
      name: "Challenges",
      component: ChallengesView,
      meta: { title: "Défis", showHeader: false, showFooter: true },
    },
    {
      path: "/badges",
      name: "Badges",
      component: BadgesGalleryView,
      meta: { title: "Badges", showHeader: false, showFooter: true },
    },
  ],
});

export default router;
