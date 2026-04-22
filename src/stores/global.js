import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', () => {
  const langOption = ref([
    { label: "O'zbekcha", value: 'uz' },
    { label: 'Русский', value: 'ru' },
    { label: 'Ўзбекча', value: 'uzk' },
  ])

  const errorPage = ref({ error_code: 0, message: '' })

  return { langOption, errorPage }
})
