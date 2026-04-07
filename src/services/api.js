import axios from 'axios'

// On récupère l'URL de l'API depuis les variables d'environnement de Vite
// Si elle n'existe pas, on utilise ton Laragon par défaut
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
})

// Intercepteur pour ajouter le token JWT à chaque requête (pour plus tard)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api