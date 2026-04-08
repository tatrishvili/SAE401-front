import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

// shared state
const token = ref(localStorage.getItem('auth_token') || null)
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const loading = ref(false)
const error = ref(null)

export function useAuth() {
    const isLoggedIn = computed(() => !!token.value)

    const login = async (email, password) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    'Identifiants incorrects'
                )
            }

            token.value = data.token

            // Store user info
            user.value = {
                email: email
            }

            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user', JSON.stringify(user.value))

            // Fetch user profile to get the name
            await fetchUserProfile()

            return data
        } catch (e) {
            error.value = e.message || 'Erreur de connexion'
            throw e
        } finally {
            loading.value = false
        }
    }

    const register = async (name, email, password) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            })

            const data = await response.json().catch(() => ({}))

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    data.detail ||
                    "Erreur lors de l'inscription"
                )
            }

            return data
        } catch (e) {
            error.value = e.message || "Erreur lors de l'inscription"
            throw e
        } finally {
            loading.value = false
        }
    }

    const fetchUserProfile = async () => {
        if (!token.value) return

        try {
            const response = await fetch(`${API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                user.value = {
                    email: data.email,
                    name: data.name,
                    id: data.id
                }
                localStorage.setItem('user', JSON.stringify(user.value))
            }
        } catch (e) {
            console.error('Failed to fetch user profile:', e)
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        error.value = null

        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
    }

    const getAuthHeaders = () => {
        return token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {}
    }

    return {
        token,
        user,
        loading,
        error,
        isLoggedIn,
        login,
        register,
        logout,
        getAuthHeaders,
        fetchUserProfile
    }
}