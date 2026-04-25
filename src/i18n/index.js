import { createI18n } from 'vue-i18n'
import fr from './locales/fr.js'
import en from './locales/en.js'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('locale') || 'fr',
    fallbackLocale: 'en',
    messages: {
        fr,
        en
    }
})

export default i18n