import { ref } from 'vue'


const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

export function useApi() {
    const loading = ref(false)
    const error = ref(null)

    const fetchApi = async (endpoint, options = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (e) {
            error.value = e.message
            console.error('API Error:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return { loading, error, fetchApi }
}