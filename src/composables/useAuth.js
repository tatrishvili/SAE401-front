import { ref, computed } from 'vue'

// ✅ Same URL as useApi.js
const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

// Shared state — defined outside so it's truly global/singleton
const token = ref(localStorage.getItem('auth_token') || null)
const user  = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const loading = ref(false)
const error   = ref(null)

export function useAuth() {
    const isLoggedIn = computed(() => !!token.value)

    // --- Login ---
    const login = async (email, password) => {
        loading.value = true
        error.value   = null

        try {
            console.log('[Auth] Logging in with:', { email, url: `${API_URL}/login` })

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json().catch(() => ({}))

            console.log('[Auth] Login response:', { status: response.status, data })

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Identifiants invalides')
            }

            if (!data.token) {
                throw new Error('No token received from server')
            }

            token.value = data.token
            localStorage.setItem('auth_token', data.token)

            await fetchUserProfile()
            return data

        } catch (e) {
            error.value = e.message || 'Login failed'
            throw e
        } finally {
            loading.value = false
        }
    }

    // --- Register ---
    const register = async (name, email, password) => {
        loading.value = true
        error.value   = null

        try {
            console.log('[Auth] Registering:', { name, email, url: `${API_URL}/register` })

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            })

            const data = await response.json().catch(() => ({}))

            console.log('[Auth] Register response:', { status: response.status, data })

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erreur lors de l\'inscription')
            }

            return data

        } catch (e) {
            error.value = e.message || 'Registration failed'
            throw e
        } finally {
            loading.value = false
        }
    }

    // --- Fetch current user profile ---
    const fetchUserProfile = async () => {
        if (!token.value) return

        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                }
            })

            if (response.ok) {
                const data = await response.json()
                user.value = {
                    id:    data.id,
                    email: data.email,
                    name:  data.name
                }
                localStorage.setItem('user', JSON.stringify(user.value))
                console.log('[Auth] User profile loaded:', user.value)
            } else {
                console.warn('[Auth] Token invalid or expired, logging out')
                logout()
            }
        } catch (e) {
            console.error('[Auth] Failed to fetch user profile:', e)
            logout()
        }
    }

    // --- Logout ---
    const logout = () => {
        token.value = null
        user.value  = null
        error.value = null
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        console.log('[Auth] Logged out')
    }

    // --- Auth headers helper ---
    const getAuthHeaders = () => {
        return token.value
            ? { Authorization: `Bearer ${token.value}` }
            : {}
    }

    // --- Fetch entries for current user ---
    const fetchEntries = async () => {
        if (!token.value) return []

        try {
            const res = await fetch(`${API_URL}/entries`, {
                headers: {
                    'Authorization': `Bearer ${token.value}`,
                    'Content-Type': 'application/json',
                }
            })

            if (!res.ok) throw new Error('Failed to fetch entries')

            const data = await res.json()
            console.log('[Auth] Entries fetched:', data)
            return data

        } catch (e) {
            console.error('[Auth] fetchEntries error:', e)
            return []
        }
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
        fetchUserProfile,
        fetchEntries,
    }
}