import { ref } from 'vue'
import { defineStore } from 'pinia'
import PayTypeService from '@/services/pay-type.service'

export const useGlobalStore = defineStore('global', () => {

  const langOption = ref([
    {
      label: "O'zbekcha",   // O'zbek tili
      value: "uz"
    },

    {
      label: "Русский",     // Rus tili
      value: "ru"
    },
    {
      label: "Ўзбекча",     // Ingliz tili
      value: "uzk"
    }
  ])


  const errorPage = ref({
    error_code: 0,
    message: ""
  })

  const queue_type = ref([
    {
      id: "all",
      name: "Hammasi",
    },
    {
      id: "no_tablo",
      name: "Manitorda yo'q",
    },
    {
      id: "no_mobile",
      name: "Ilovada yo'q (Jonlida)",
    },
    {
      id: "no",
      name: "Butunlay yo'q",
    }
  ])

  const user_bonus_type = ref([
    {
      id: 1,
      name: "Foizlik",
    },
    {
      id: 0,
      name: "Summa",
    },
  ])

  const shablon_type = ref([
    {
      id: "default",
      name: "Standart shablon",
    },
    {
      id: "dinamic-shablon",
      name: "Moslashgan shablon",
    },
  ])

  const userPalataTypes = ref([
    { id: 'percent',   name: "Foizda olish" },
    { id: 'per_day',   name: "Har kuni uchun summa" },
    { id: 'fixed',     name: "Umumiy bitta summa" },
  ])

  const payTypes = ref([])

  const fetchPayTypes = async () => {
    try {
      payTypes.value = await PayTypeService.all()
    } catch (err) {
      console.error('Failed to fetch pay types:', err)
    }
  }

  const product_type = ref([
    { id: 'pill', name: 'Dori' },
    { id: 'reagent', name: 'Labaratoriya Reagent' },
    { id: 'product', name: 'Mahsulot' },
    { id: 'kitchent_product', name: 'Oshxona Mahsuloti' }
  ])

  const statsionar_list = ref([
    { id: 'kas_tarix1', name: 'Statsionar' },
    { id: 'kas_tarix2', name: 'Tekshiruv hulosasi' },
    { id: 'dastabki_korik', name: 'Tekshiriv' },
    { id: 'muolajalar', name: 'Muolajalar' },
    { id: 'harorat', name: 'Harorat varaqa' },
    { id: 'klinik_tashxis', name: 'Klinik tashxis' },
    { id: 'kundalik', name: 'Kundalik' },
    { id: 'vipiska', name: 'Kasallik tarixi ko\'chirma' }
  ])

  return {
    shablon_type,
    user_bonus_type,
    userPalataTypes,
    queue_type,
    errorPage,
    langOption,
    payTypes,
    fetchPayTypes,
    product_type,
    statsionar_list
  }
})
