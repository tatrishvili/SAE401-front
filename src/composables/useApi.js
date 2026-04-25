import { ref } from 'vue'
import { useAuth } from './useAuth'
import { API_URL } from './apiConfig'

export function useApi() {
    const loading = ref(false)
    const error = ref(null)
    const auth = useAuth()

    const fetchApi = async (endpoint, options = {}) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...auth.getAuthHeaders(),
                    ...(options.headers || {}),
                },
                body: options.body ? options.body : undefined,
            })

            const contentType = response.headers.get('content-type')
            const isJson = contentType && contentType.includes('application/json')
            const data = isJson ? await response.json() : null

            console.log(`[API] ${options.method || 'GET'} ${endpoint}`, {
                status: response.status,
                data
            })

            if (!response.ok) {
                const message =
                    data?.message ||
                    data?.error ||
                    `HTTP error ${response.status}`
                throw new Error(message)
            }

            return data

        } catch (e) {
            error.value = e.message || 'API error'
            console.error(`[API Error] ${endpoint}:`, e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return { loading, error, fetchApi }
}