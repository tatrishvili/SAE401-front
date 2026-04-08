<template>
  <div class="step2-food">
    <h2>Qu'avez-vous mangé ?</h2>
    <p class="subtitle">Sélectionnez tous les aliments consommés</p>

    <div class="main-tabs">
      <button
          :class="{ active: activeTab === 'viandes' }"
          @click="activeTab = 'viandes'"
      > Viandes</button>
      <button
          :class="{ active: activeTab === 'fruitsetlegumes' }"
          @click="activeTab = 'fruitsetlegumes'"
      > Fruits & Légumes</button>
      <button
          :class="{ active: activeTab === 'autres' }"
          @click="activeTab = 'autres'"
      > Autres</button>
    </div>

    <!-- Search bar -->
    <div class="search-bar">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Rechercher un alimentation..."
      />
    </div>


    <div v-if="loading" class="loading">⏳ Chargement...</div>
    <div v-else-if="apiError" class="error">{{ apiError }}</div>

    <!-- Items list -->
    <div v-else class="food-list">
      <div v-if="filteredItems.length === 0" class="empty">
        Aucun aliment trouvé<span v-if="searchQuery"> pour "{{ searchQuery }}"</span>
      </div>
      <button
          v-for="item in filteredItems"
          :key="item.slug"
          :class="{ selected: isSelected(item) }"
          @click="toggleItem(item)"
          class="food-item"
      >
        <span class="food-name">{{ item.name }}</span>
        <span class="food-co2">{{ (item.ecv / 1000).toFixed(2) }} kg CO₂/kg</span>
        <span v-if="isSelected(item)" class="check">✓</span>
      </button>
    </div>

    <div v-if="selectedItems.length > 0" class="selected-summary">
      <h3>🛒 Sélectionnés ({{ selectedItems.length }})</h3>
      <div class="selected-tags">
        <span
            v-for="item in selectedItems"
            :key="item.slug"
            class="tag"
            @click="toggleItem(item)"
        >
          {{ item.name }} ✕
        </span>
      </div>
    </div>

    <span class="error-msg" v-if="validationError">{{ validationError }}</span>

    <div class="actions">
      <button @click="$emit('prev')" class="btn-back">← Retour</button>
      <button @click="handleNext" class="btn-next">Calculer →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'

const props = defineProps(['data'])
const emit = defineEmits(['next', 'prev'])

const { loading, error: apiError, fetchApi } = useApi()

const activeTab = ref('viandes')
const alimentationItems = ref([])
const fvItems = ref([])
const searchQuery = ref('')
const selectedItems = ref(props.data.selectedFoods ?? [])
const validationError = ref('')

const VIANDES_SLUGS = ['viandes', 'poissons']

const FRUITS_SLUGS = ['fruits', 'cereales']

const slugToName = (slug) => {
  const overrides = {
    boeuf: 'Bœuf', veau: 'Veau', porc: 'Porc', lapin: 'Lapin',
    canard: 'Canard', poulet: 'Poulet', crevettes: 'Crevettes',
    cabillaud: 'Cabillaud', lieu: 'Lieu', dorade: 'Dorade',
    saumon: 'Saumon', moules: 'Moules', huitres: 'Huîtres',
    thon: 'Thon', sardines: 'Sardines', cheeseburger: 'Cheeseburger',
    kebab: 'Kebab', burgerpoulet: 'Burger poulet', pizza: 'Pizza',
    sushis: 'Sushis', burgervegetarien: 'Burger végétarien',
    frites: 'Frites', tofu: 'Tofu', boucheechocolat: 'Bouchée chocolat',
    pateatartiner: 'Pâte à tartiner', brownie: 'Brownie',
    painauchocolat: 'Pain au chocolat', cookie: 'Cookie',
    madeleine: 'Madeleine', painauxraisins: 'Pain aux raisins',
    chaussonauxpommes: 'Chausson aux pommes', croissant: 'Croissant',
    paindemie: 'Pain de mie', bonbons: 'Bonbons', baguette: 'Baguette',
    beurre: 'Beurre', fromagedure: 'Fromage dur', feta: 'Feta',
    fromagemolle: 'Fromage molle', mozarella: 'Mozzarella',
    fromagebleu: 'Fromage bleu', oeuf: 'Œuf', matieregrasse: 'Matière grasse',
    yaourt: 'Yaourt', fromageblanc: 'Fromage blanc', laitdevache: 'Lait de vache',
    pomme: 'Pomme', carotte: 'Carotte', courgette: 'Courgette',
    tomate: 'Tomate', potiron: 'Potiron', laitue: 'Laitue',
    banane: 'Banane', mangue: 'Mangue', poireau: 'Poireau',
    avocat: 'Avocat', pommedeterre: 'Pomme de terre', riz: 'Riz',
    pates: 'Pâtes', ble: 'Blé', boulgour: 'Boulgour',
    poischiches: 'Pois chiches', haricotsrouges: 'Haricots rouges',
    lentilles: 'Lentilles', mais: 'Maïs',
  }
  return overrides[slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1))
}

const fetchAlimentation = async () => {
  try {
    const json = await fetchApi('/food?category=group')
    const groups = json.data ?? []
    alimentationItems.value = groups.flatMap(group =>
        (group.items ?? []).map(item => ({
          name: slugToName(item.slug),
          ecv: item.ecv,
          slug: item.slug,
          groupSlug: group.slug,   // e.g. "viandes", "poissons", "plats", "encas"...
          isViande: VIANDES_SLUGS.includes(group.slug),
          isFruit: FRUITS_SLUGS.includes(group.slug),
        }))
    )
  } catch (e) {}
}

const fetchFruitsLegumes = async () => {
  try {
    const currentMonth = new Date().getMonth() + 1
    const json = await fetchApi(`/fruitsetlegumes?month=${currentMonth}`)
    fvItems.value = (json.data ?? []).map(item => ({
      name: item.name,
      ecv: item.ecv,
      slug: item.slug,
      groupSlug: 'fruitsetlegumes',
      isViande: false,
    }))
  } catch (e) {}
}

onMounted(() => {
  fetchAlimentation()
  fetchFruitsLegumes()
})

const filteredItems = computed(() => {
  let items = []

  if (activeTab.value === 'viandes') {
    items = alimentationItems.value.filter(i => i.isViande)

  } else if (activeTab.value === 'fruitsetlegumes') {
    const combined = [
      ...fvItems.value,
      ...alimentationItems.value.filter(i => i.isFruit),
    ]
    const seen = new Set()
    items = combined.filter(i => {
      if (seen.has(i.slug)) return false
      seen.add(i.slug)
      return true
    })

  } else if (activeTab.value === 'autres') {
    items = alimentationItems.value.filter(i => !i.isViande && !i.isFruit)
  }


  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    items = items.filter(i => {
      const name = i.name.toLowerCase()
      return q.length === 1 ? name.startsWith(q) : name.includes(q)
    })
  }

  return items
})

const isSelected = (item) => selectedItems.value.some(s => s.slug === item.slug)

const toggleItem = (item) => {
  if (isSelected(item)) {
    selectedItems.value = selectedItems.value.filter(s => s.slug !== item.slug)
  } else {
    selectedItems.value.push(item)
  }
}

const handleNext = () => {
  if (selectedItems.value.length === 0) {
    validationError.value = 'Veuillez sélectionner au moins un aliment'
    return
  }
  validationError.value = ''
  emit('next', { selectedFoods: selectedItems.value })
}
</script>

<style scoped lang="scss">
.step2-food {
  padding: 1rem;

  h2 { margin-bottom: 0.25rem; }

  .subtitle {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .main-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;

    button {
      flex: 1;
      padding: 0.6rem 0.25rem;
      border-radius: 0.5rem;
      border: 1px solid #e5e7eb;
      background: white;
      font-size: 0.82rem;
      cursor: pointer;
      font-weight: 500;
      white-space: nowrap;

      &.active {
        background: #22c55e;
        color: white;
        border-color: #22c55e;
      }
    }
  }

  .search-bar {
    margin-bottom: 0.75rem;

    input {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: #22c55e;
      }
    }
  }

  .food-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 38vh;
    overflow-y: auto;
    margin-bottom: 0.75rem;

    .empty {
      text-align: center;
      padding: 2rem;
      color: #999;
      font-size: 0.9rem;
    }

    .food-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.65rem 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      background: white;
      cursor: pointer;
      text-align: left;
      gap: 0.5rem;

      &.selected {
        border-color: #22c55e;
        background: #f0fdf4;
      }

      .food-name {
        font-weight: 500;
        font-size: 0.9rem;
        flex: 1;
      }

      .food-co2 {
        font-size: 0.72rem;
        color: #9ca3af;
        white-space: nowrap;
      }

      .check {
        color: #22c55e;
        font-weight: bold;
      }
    }
  }

  .selected-summary {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 0.75rem;
    margin-bottom: 0.75rem;

    h3 {
      font-size: 0.85rem;
      color: #555;
      margin-bottom: 0.5rem;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;

      .tag {
        background: #22c55e;
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 999px;
        font-size: 0.78rem;
        cursor: pointer;
        user-select: none;
      }
    }
  }

  .error-msg {
    color: #ef4444;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
    display: block;
  }

  .error { color: #ef4444; font-size: 0.85rem; }
  .loading { text-align: center; padding: 2rem; color: #666; }

  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;

    button {
      flex: 1;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 500;
    }

    .btn-back { background: #f3f4f6; color: #374151; }
    .btn-next { background: #22c55e; color: white; }
  }
}
</style>