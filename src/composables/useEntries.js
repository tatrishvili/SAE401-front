// src/composables/useEntries.js
import { ref, computed, onMounted } from 'vue'
import { useAuth } from './useAuth'

export function useEntries() {
    const { token, getAuthHeaders } = useAuth()

    const rawData = ref([])
    const loading = ref(false)
    const error = ref(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

    const fetchEntries = async () => {
        if (!token.value) return

        loading.value = true
        error.value = null

        try {
            const res = await fetch(`${API_URL}/entries`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                }
            })

            if (!res.ok) throw new Error('Failed to fetch entries')

            const data = await res.json()
            rawData.value = data.map(e => ({
                date: new Date(e.entryDate).toLocaleDateString('en-CA'),
                category: e.category.toLowerCase() === 'repas' ? 'Alimentation' : 'Transport',
                co2: parseFloat(e.co2Value) || 0
            }))
        } catch (e) {
            error.value = e.message
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    onMounted(fetchEntries)

    const sum = (date, cat) =>
        rawData.value
            .filter(e => e.date === date && e.category === cat)
            .reduce((s, e) => s + e.co2, 0)

    const today = () => new Date().toLocaleDateString('en-CA')
    const lastDays = n =>
        Array.from({ length: n }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - (n - 1 - i))
            return d.toLocaleDateString('en-CA')
        })

    const CATEGORIES = ['Transport', 'Alimentation']

    const donutSeries = computed(() => CATEGORIES.map(cat => sum(today(), cat)))
    const barSeries = computed(() =>
        CATEGORIES.map(cat => ({ name: cat, data: lastDays(7).map(d => sum(d, cat)) }))
    )
    const lineSeries = computed(() =>
        CATEGORIES.map(cat => ({ name: cat, data: lastDays(30).map(d => sum(d, cat)) }))
    )

    const heatmapSeries = computed(() => {
        const map = {}
        rawData.value.forEach(e => {
            map[e.date] = (map[e.date] || 0) + e.co2
        })
        return [{
            name: 'Score',
            data: Object.keys(map).map(date => ({
                x: date,
                y: Math.max(0, 100 - map[date] * 5)
            }))
        }]
    })

    const scoreSeries = computed(() => {
        const total = rawData.value.filter(e => e.date === today()).reduce((s, e) => s + e.co2, 0)
        return [Math.max(0, Math.min(100, Math.round(100 - total * 5)))]
    })

    return {
        rawData,
        loading,
        error,
        CATEGORIES,
        donutSeries,
        barSeries,
        lineSeries,
        heatmapSeries,
        scoreSeries
    }
}