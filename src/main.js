import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'

import Provider from '@/components/Provider.vue'
import router from '@/router'
import i18n from '@/i18n'
import AppIcon from '@/components/icons/AppIcon.vue'
import { openModal, closeModal } from '@/directives/myModal'

import '@/assets/tailwind.css'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const app = createApp(Provider)
app.use(createPinia())
app.use(router)
app.use(i18n)

app.component('AppIcon', AppIcon)
app.directive('open-modal', openModal)
app.directive('close-modal', closeModal)

app.provide('dayJS', dayjs)
app.provide('fileUrl', `${BASE_URL}/uploads/`)

app.mount('#app')
