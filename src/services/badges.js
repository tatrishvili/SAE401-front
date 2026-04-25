import badgeFlowers from "@/assets/icones/badge_flowers.png";
import badgeGlasses from "@/assets/icones/badge_glasses.png";
import badgeCacheOreille from "@/assets/icones/badge_cacheoreille.png";
import badgeMustache from "@/assets/icones/badge_mustache.png";
import badgeMonocle from "@/assets/icones/badge_monocle.png";
import badgePirate from "@/assets/icones/badge_pirate.png";
import badgeSunglasses from "@/assets/icones/badge_sunglasses.png";
import badgeDeer from "@/assets/icones/badge_deer.png";
import badgeChristmas from "@/assets/icones/badge_christmas.png";

export const BADGE_IMAGE_FALLBACKS = [
  badgeFlowers,
  badgeGlasses,
  badgeCacheOreille,
  badgeMustache,
  badgeMonocle,
  badgePirate,
  badgeSunglasses,
  badgeDeer,
  badgeChristmas,
];

export const DEFAULT_BADGE_CATALOG = [
  {
    id: "sprout",
    name: "Sprout",
    description: "Premier pas vers une routine plus verte.",
    xpRequired: 25,
    image: badgeFlowers,
  },
  {
    id: "recycler",
    name: "Recycler",
    description: "Tri et recyclage valides plusieurs fois.",
    xpRequired: 60,
    image: badgeGlasses,
  },
  {
    id: "water-saver",
    name: "Eco Eau",
    description: "Habitudes d economie d eau maintenues.",
    xpRequired: 100,
    image: badgeCacheOreille,
  },
  {
    id: "bike-rider",
    name: "Mobilite Douce",
    description: "Deplacements responsables et reguliers.",
    xpRequired: 180,
    image: badgeMustache,
  },
  {
    id: "solar-mind",
    name: "Energie Claire",
    description: "Actions liees a la reduction energetique.",
    xpRequired: 260,
    image: badgeMonocle,
  },
  {
    id: "planet-guardian",
    name: "Gardien Planete",
    description: "Palier elite de progression eco.",
    xpRequired: 400,
    image: badgePirate,
  },
  {
    id: "fresh-air",
    name: "Air Pur",
    description: "Tu maintiens des habitudes plus saines au quotidien.",
    xpRequired: 325,
    image: badgeSunglasses,
  },
  {
    id: "forest-mentor",
    name: "Mentor Forestier",
    description: "Tu franchis un nouveau cap dans ton engagement.",
    xpRequired: 600,
    image: badgeDeer,
  },
  {
    id: "winter-guardian",
    name: "Gardien d Hiver",
    description: "Tu atteins un niveau avance de progression eco.",
    xpRequired: 800,
    image: badgeChristmas,
  },
];

const BADGE_IMAGE_BY_ID = Object.fromEntries(
  DEFAULT_BADGE_CATALOG.map((badge) => [badge.id, badge.image]),
);

export const normalizeBadge = (badge, fallbackIndex = 0) => ({
  id: String(
    badge.id ?? badge.slug ?? badge.code ?? badge.name ?? "",
  ).toLowerCase(),
  name: badge.name ?? badge.label ?? "Badge",
  description: badge.description ?? badge.details ?? "Badge a debloquer",
  icon: badge.icon ?? "🏅",
  xpRequired: Number(
    badge.xpRequired ?? badge.requiredXp ?? badge.threshold ?? 0,
  ),
  image:
    badge.image ??
    badge.photo ??
    badge.picture ??
    badge.badgeImage ??
    badge.asset ??
    BADGE_IMAGE_BY_ID[
      String(
        badge.id ?? badge.slug ?? badge.code ?? badge.name ?? "",
      ).toLowerCase()
    ] ??
    BADGE_IMAGE_FALLBACKS[fallbackIndex % BADGE_IMAGE_FALLBACKS.length],
});

export const normalizeBadgesArray = (value) =>
  Array.isArray(value)
    ? value
        .map((badge, index) => normalizeBadge(badge, index))
        .filter((badge) => badge.id)
    : [];

export const resolveBadgeImage = (badge, index = 0) =>
  badge?.image ??
  badge?.photo ??
  badge?.picture ??
  badge?.badgeImage ??
  badge?.asset ??
  BADGE_IMAGE_BY_ID[
    String(badge?.id ?? badge?.slug ?? badge?.code ?? "").toLowerCase()
  ] ??
  BADGE_IMAGE_FALLBACKS[index % BADGE_IMAGE_FALLBACKS.length];

export const getUnlockedBadgesFromXp = (xpValue) =>
  DEFAULT_BADGE_CATALOG.filter((badge) => xpValue >= badge.xpRequired).sort(
    (a, b) => a.xpRequired - b.xpRequired,
  );
