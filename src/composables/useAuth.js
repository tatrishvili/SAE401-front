import { ref, computed } from "vue";

const API_URL = import.meta.env.VITE_API_URL || 'http://symfony.mmi-troyes.fr:8319/api'

// Shared state
const token = ref(localStorage.getItem("auth_token") || null);
const user = ref(JSON.parse(localStorage.getItem("user") || "null"));
const loading = ref(false);
const error = ref(null);

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value);

  // --- Login ---
  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || "Invalid credentials");
      }

      token.value = data.token;
      localStorage.setItem("auth_token", data.token);

      // Fetch the full user profile immediately
      await fetchUserProfile();
      return data;
    } catch (e) {
      error.value = e.message || "Login failed";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // --- Register ---
  const register = async (name, email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      return data;
    } catch (e) {
      error.value = e.message || "Registration failed";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // --- Fetch current user profile ---
  const fetchUserProfile = async () => {
    if (!token.value) return;

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });

      if (response.ok) {
        const data = await response.json();
        user.value = { id: data.id, email: data.email, name: data.name };
        localStorage.setItem("user", JSON.stringify(user.value));
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
      logout();
    }
  };

  // --- Logout ---
  const logout = () => {
    token.value = null;
    user.value = null;
    error.value = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  // --- Auth headers helper ---
  const getAuthHeaders = () => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  };

  // --- Fetch entries for current user ---
  const fetchEntries = async () => {
    if (!token.value) return [];
    try {
      const res = await fetch(`${API_URL}/entries`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      if (!res.ok) throw new Error("Failed to fetch entries");
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  };

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
  };
}
