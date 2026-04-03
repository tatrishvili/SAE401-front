import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Importe la config au-dessus

const app = createApp(App)
app.use(router) // On active le router
app.mount('#app')