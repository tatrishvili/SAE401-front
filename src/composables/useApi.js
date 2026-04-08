// src/composables/UseApi.js
import { ref } from 'vue'
import { useAuth } from './useAuth'

const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

export function useApi() {
    const loading = ref(false)
    const error = ref(null)
    const { getAuthHeaders } = useAuth()

    const fetchApi = async (endpoint, options = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders(),
                    ...options.headers,
                },
                ...options,
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            return await response.json()
        } catch (e) {
            error.value = e.message
            throw e
        } finally {
            loading.value = false
        }
    }

    return { loading, error, fetchApi }
}