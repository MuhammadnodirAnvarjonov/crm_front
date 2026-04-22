import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('lang') || 'uz',
  fallbackLocale: 'uz',
  availableLocales: ['uz', 'ru', 'uzk'],
  messages,
})
