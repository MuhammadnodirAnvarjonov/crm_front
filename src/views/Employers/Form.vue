<template>
  <form @submit.prevent="save" class="h-full flex flex-col min-h-0">

    <!-- ══ Scrollable content ══════════════════════════════════ -->
    <div class="flex-1 overflow-y-auto min-h-0">
      <div class="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">

        <!-- ── Asosiy ma'lumotlar ─────────────────────────────── -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

          <!-- Chap: kompaniya + aloqa + telefon -->
          <div class="space-y-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-1.5">Kompaniya ma'lumotlari</p>

            <!-- Kompaniya nomi -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Kompaniya nomi <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-3 gap-2">
                <LangInput badge="UZ" badge-color="blue" v-model="form.name" @blur="autoFill('name')" required placeholder="Grand Hotel" />
                <LangInput badge="УЗК" badge-color="purple" v-model="form.name_uzk" @input="dirty.name_uzk = true" placeholder="Гранд Хотел" />
                <LangInput badge="РУ" badge-color="rose" v-model="form.name_ru" @input="dirty.name_ru = true" placeholder="Гранд Хотел" />
              </div>
            </div>

            <!-- Aloqa shaxsi -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Aloqa shaxsi</label>
              <div class="grid grid-cols-3 gap-2">
                <LangInput badge="UZ" badge-color="blue" v-model="form.contact_person" @blur="autoFill('contact_person')" placeholder="Jamshid Rahimov" />
                <LangInput badge="УЗК" badge-color="purple" v-model="form.contact_person_uzk" @input="dirty.contact_person_uzk = true" placeholder="Жамшид Раҳимов" />
                <LangInput badge="РУ" badge-color="rose" v-model="form.contact_person_ru" @input="dirty.contact_person_ru = true" placeholder="Джамшид Рахимов" />
              </div>
            </div>

            <!-- Telefon -->
            <div class="grid grid-cols-2 gap-3">
              <BaseInput label="Telefon" v-model="form.phone" required placeholder="+998901234567" />
              <BaseInput label="Qo'shimcha tel" v-model="form.phone2" placeholder="+998..." />
            </div>
          </div>

          <!-- O'ng: manzil + joylashuv + tarif + muddat -->
          <div class="space-y-4">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-1.5">Joylashuv va holat</p>

            <!-- Manzil -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Manzil</label>
              <div class="grid grid-cols-3 gap-2">
                <LangInput badge="UZ" badge-color="blue" v-model="form.address" @blur="autoFill('address')" placeholder="Ko'cha, uy" />
                <LangInput badge="УЗК" badge-color="purple" v-model="form.address_uzk" @input="dirty.address_uzk = true" placeholder="Кўча, уй" />
                <LangInput badge="РУ" badge-color="rose" v-model="form.address_ru" @input="dirty.address_ru = true" placeholder="Улица, дом" />
              </div>
            </div>

            <!-- Viloyat / Tuman -->
            <div class="grid grid-cols-2 gap-3">
              <BaseSelect label="Viloyat" v-model="form.region_id" :options="regionOptions"
                labelKey="name" valueKey="id" placeholder="Tanlang" @change="form.district_id = null" />
              <BaseSelect label="Tuman" v-model="form.district_id" :options="districtOptions"
                labelKey="name" valueKey="id" placeholder="Tanlang" :disabled="!form.region_id" />
            </div>

            <!-- Tarif / Holati -->
            <div class="grid grid-cols-2 gap-3">
              <BaseSelect label="Tarif" v-model="form.tier" :options="tierOptions"
                labelKey="name" valueKey="value" :clearable="false" />
              <BaseSelect label="Holati" v-model="form.status" :options="statusOptions"
                labelKey="name" valueKey="value" :clearable="false" />
            </div>

            <!-- Umumiy muddat -->
            <div>
              <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Umumiy muddat</label>
              <input type="date" v-model="form.overall_deadline"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
            </div>
          </div>
        </div>

        <!-- ── Kerakli mutaxasislar ───────────────────────────── -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kerakli mutaxasislar</p>
            <button type="button" @click="addRequirement"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-semibold transition shadow-sm">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Qo'shish
            </button>
          </div>

          <div v-if="form.requirements.length === 0"
            class="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 py-10 text-center text-[13px] text-slate-400 dark:text-slate-500">
            Hali mutaxassis qo'shilmagan. "Qo'shish" tugmasini bosing.
          </div>

          <!-- Requirements rows -->
          <div v-else class="space-y-2">
            <!-- Header -->
            <div class="req-grid px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">#</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Kasb turi</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Son</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Maosh</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Muddat</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Holat</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Izoh (UZ)</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Изоҳ (УЗК)</span>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Комм. (РУ)</span>
              <span></span>
            </div>

            <div v-for="(row, i) in form.requirements" :key="row._key"
              class="req-grid px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:border-blue-200 dark:hover:border-blue-700/50 transition">

              <!-- # -->
              <span class="text-[12px] text-slate-400 font-mono self-center">{{ i + 1 }}</span>

              <!-- Kasb turi -->
              <div class="self-center">
                <BaseSelect v-model="row.job_type_id" :options="jobTypeOptions"
                  labelKey="name" valueKey="id" placeholder="Tanlang" size="sm" />
              </div>

              <!-- Son -->
              <div class="self-center">
                <input v-model.number="row.anketa_count" type="number" min="1" placeholder="1"
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Maosh -->
              <div class="self-center">
                <input v-model.number="row.salary" type="number" min="0" step="100000" placeholder="0"
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Muddat -->
              <div class="self-center">
                <input v-model="row.deadline" type="date"
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Holat -->
              <div class="self-center">
                <BaseSelect v-model="row.status" :options="reqStatusOptions"
                  labelKey="label" valueKey="value" :clearable="false" size="sm" />
              </div>

              <!-- Izoh UZ -->
              <div class="self-center">
                <input v-model="row.comment" @blur="autoFillReq(row)" placeholder="Izoh..."
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Изоҳ УЗК -->
              <div class="self-center">
                <input v-model="row.comment_uzk" @input="row._dirtyUzk = true" placeholder="Изоҳ..."
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Комментарий РУ -->
              <div class="self-center">
                <input v-model="row.comment_ru" @input="row._dirtyRu = true" placeholder="Комментарий..."
                  class="w-full px-2.5 py-2 text-[12px] rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition" />
              </div>

              <!-- Delete -->
              <div class="self-center flex justify-center">
                <button type="button" @click="removeRequirement(i)"
                  class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-300 hover:text-red-500 transition">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Umumiy izoh ────────────────────────────────────── -->
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-1.5 mb-3">Umumiy izoh</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="relative">
              <span class="absolute left-2.5 top-3 text-[10px] font-bold select-none pointer-events-none text-blue-500">UZ</span>
              <textarea v-model="form.comment" @blur="autoFill('comment')" rows="4" placeholder="Izoh (lotin)"
                class="w-full pl-9 pr-3 pt-5 pb-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/20 transition resize-none"></textarea>
            </div>
            <div class="relative">
              <span class="absolute left-2.5 top-3 text-[10px] font-bold select-none pointer-events-none text-purple-500">УЗК</span>
              <textarea v-model="form.comment_uzk" @input="dirty.comment_uzk = true" rows="4" placeholder="Изоҳ (кирилл)"
                class="w-full pl-9 pr-3 pt-5 pb-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:border-purple-400 focus:ring-purple-400/20 transition resize-none"></textarea>
            </div>
            <div class="relative">
              <span class="absolute left-2.5 top-3 text-[10px] font-bold select-none pointer-events-none text-rose-500">РУ</span>
              <textarea v-model="form.comment_ru" @input="dirty.comment_ru = true" rows="4" placeholder="Комментарий (рус.)"
                class="w-full pl-9 pr-3 pt-5 pb-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:border-rose-400 focus:ring-rose-400/20 transition resize-none"></textarea>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Footer ─────────────────────────────────────────────── -->
    <div class="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800/90 backdrop-blur">
      <BaseButton type="button" status="gray" @click="$emit('close')">Bekor qilish</BaseButton>
      <BaseButton type="submit" status="primary" :loading="saving">Saqlash</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import employersService from '@/services/employers.service'
import regionsService from '@/services/regions.service'
import jobTypesService from '@/services/jobTypes.service'

const { locale } = useI18n()
const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const saving = ref(false)
const regions = ref([])
const jobTypes = ref([])
let _keyCounter = 0
const newKey = () => ++_keyCounter

// ── LangInput inline component ────────────────────────────────
const LangInput = {
  props: { badge: String, badgeColor: String, modelValue: String, placeholder: String, required: Boolean },
  emits: ['update:modelValue', 'blur', 'input'],
  template: `
    <div class="relative">
      <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold select-none pointer-events-none"
        :class="'text-' + badgeColor + '-500'">{{ badge }}</span>
      <input :value="modelValue" :required="required" :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value); $emit('input', $event)"
        @blur="$emit('blur', $event)"
        class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:border-current transition" />
    </div>
  `,
}

// ── Transliteration ───────────────────────────────────────────
const UZK_MAP = [
  ["O'","Ў"],["o'","ў"],["G'","Ғ"],["g'","ғ"],
  ["Sh","Ш"],["sh","ш"],["Ch","Ч"],["ch","ч"],
  ["Ng","Нг"],["ng","нг"],["Yo","Ё"],["yo","ё"],
  ["Yu","Ю"],["yu","ю"],["Ya","Я"],["ya","я"],["Ye","Е"],["ye","е"],
  ["A","А"],["a","а"],["B","Б"],["b","б"],["D","Д"],["d","д"],
  ["E","Э"],["e","э"],["F","Ф"],["f","ф"],["G","Г"],["g","г"],
  ["H","Ҳ"],["h","ҳ"],["I","И"],["i","и"],["J","Ж"],["j","ж"],
  ["K","К"],["k","к"],["L","Л"],["l","л"],["M","М"],["m","м"],
  ["N","Н"],["n","н"],["O","О"],["o","о"],["P","П"],["p","п"],
  ["Q","Қ"],["q","қ"],["R","Р"],["r","р"],["S","С"],["s","с"],
  ["T","Т"],["t","т"],["U","У"],["u","у"],["V","В"],["v","в"],
  ["X","Х"],["x","х"],["Y","Й"],["y","й"],["Z","З"],["z","з"],
]
const RU_OVER = { "Қ":"К","қ":"к","Ҳ":"Х","ҳ":"х","Ў":"У","ў":"у","Ғ":"Г","ғ":"г" }
const toUzk = (t) => { if (!t) return ''; let r = t; for (const [a,b] of UZK_MAP) r = r.replaceAll(a, b); return r }
const toRu  = (t) => { if (!t) return ''; let r = toUzk(t); for (const [a,b] of Object.entries(RU_OVER)) r = r.replaceAll(a, b); return r }

// ── Dirty flags ───────────────────────────────────────────────
const dirty = reactive({
  name_uzk: false, name_ru: false,
  contact_person_uzk: false, contact_person_ru: false,
  address_uzk: false, address_ru: false,
  comment_uzk: false, comment_ru: false,
})

const autoFill = (field) => {
  const val = form.value[field] || ''
  if (!dirty[`${field}_uzk`]) form.value[`${field}_uzk`] = toUzk(val)
  if (!dirty[`${field}_ru`])  form.value[`${field}_ru`]  = toRu(val)
}
const autoFillReq = (row) => {
  if (!row._dirtyUzk) row.comment_uzk = toUzk(row.comment || '')
  if (!row._dirtyRu)  row.comment_ru  = toRu(row.comment || '')
}

// ── Form state ────────────────────────────────────────────────
const EMPTY = () => ({
  name: '', name_uzk: '', name_ru: '',
  contact_person: '', contact_person_uzk: '', contact_person_ru: '',
  phone: '', phone2: '',
  address: '', address_uzk: '', address_ru: '',
  region_id: null, district_id: null,
  tier: 'free', status: 'active',
  overall_deadline: '',
  comment: '', comment_uzk: '', comment_ru: '',
  requirements: [],
})
const form = ref(EMPTY())

// ── Requirements helpers ──────────────────────────────────────
const emptyRow = () => ({
  _key: newKey(), id: null,
  job_type_id: null, anketa_count: 1, salary: null,
  deadline: '', status: 'pending',
  comment: '', comment_uzk: '', comment_ru: '',
  _dirtyUzk: false, _dirtyRu: false,
})
const addRequirement    = () => form.value.requirements.push(emptyRow())
const removeRequirement = (i) => form.value.requirements.splice(i, 1)

// ── Options ───────────────────────────────────────────────────
const tierOptions = [
  { value: 'free',      name: 'Bepul' },
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const statusOptions = [
  { value: 'active',   name: 'Faol' },
  { value: 'inactive', name: 'Faol emas' },
  { value: 'archived', name: 'Arxiv' },
]
const REQ_STATUS_I18N = {
  pending:   { uz: 'Kutilmoqda',    uzk: 'Кутилмоқда',    ru: 'Ожидает' },
  active:    { uz: 'Jarayonda',     uzk: 'Жараёнда',      ru: 'В процессе' },
  filled:    { uz: "To'ldirildi",   uzk: 'Тўлдирилди',    ru: 'Заполнено' },
  cancelled: { uz: 'Bekor qilindi', uzk: 'Бекор қилинди', ru: 'Отменено' },
}
const reqStatusOptions = computed(() =>
  Object.entries(REQ_STATUS_I18N).map(([value, l]) => ({ value, label: l[locale.value] || l.uz }))
)

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}
const jobTypeOptions  = computed(() => jobTypes.value.map((jt) => ({ id: jt.id, name: nameByLocale(jt) })))
const regionOptions   = computed(() => regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) })))
const districtOptions = computed(() => {
  if (!form.value.region_id) return []
  const r = regions.value.find((x) => x.id === form.value.region_id)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

// ── Populate ──────────────────────────────────────────────────
const populate = (data) => {
  Object.keys(dirty).forEach((k) => (dirty[k] = false))
  if (!data) { form.value = EMPTY(); return }

  for (const f of ['name', 'contact_person', 'address', 'comment']) {
    if (data[`${f}_uzk`]) dirty[`${f}_uzk`] = true
    if (data[`${f}_ru`])  dirty[`${f}_ru`]  = true
  }

  form.value = {
    name:               data.name || '',
    name_uzk:           data.name_uzk || '',
    name_ru:            data.name_ru || '',
    contact_person:     data.contact_person || '',
    contact_person_uzk: data.contact_person_uzk || '',
    contact_person_ru:  data.contact_person_ru || '',
    phone:              data.phone || '',
    phone2:             data.phone2 || '',
    address:            data.address || '',
    address_uzk:        data.address_uzk || '',
    address_ru:         data.address_ru || '',
    region_id:          data.region_id || null,
    district_id:        data.district_id || null,
    tier:               data.tier || 'free',
    status:             data.status || 'active',
    overall_deadline:   data.overall_deadline ? String(data.overall_deadline).slice(0, 10) : '',
    comment:            data.comment || '',
    comment_uzk:        data.comment_uzk || '',
    comment_ru:         data.comment_ru || '',
    requirements: (data.requirements || []).map((r) => ({
      _key:         newKey(),
      id:           r.id,
      job_type_id:  r.job_type_id || null,
      anketa_count: r.anketa_count ?? 1,
      salary:       r.salary != null ? Number(r.salary) : null,
      deadline:     r.deadline ? String(r.deadline).slice(0, 10) : '',
      status:       r.status || 'pending',
      comment:      r.comment || '',
      comment_uzk:  r.comment_uzk || '',
      comment_ru:   r.comment_ru || '',
      _dirtyUzk: !!r.comment_uzk,
      _dirtyRu:  !!r.comment_ru,
    })),
  }
}

// ── Save ──────────────────────────────────────────────────────
const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const { requirements, ...rest } = form.value
    const payload = { ...rest }
    if (!payload.overall_deadline) payload.overall_deadline = null

    payload.requirements = requirements.map(({ _key, _dirtyUzk, _dirtyRu, ...row }) => {
      if (!row.deadline)     row.deadline     = null
      if (!row.salary)       row.salary       = null
      if (!row.job_type_id)  row.job_type_id  = null
      return row
    })

    if (props.editData?.id) {
      await employersService.update(props.editData.id, payload)
    } else {
      await employersService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Employer save error', e)
  } finally {
    saving.value = false
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(async () => {
  try { regions.value  = (await regionsService.all({})) || [] } catch (e) { console.error(e) }
  try { jobTypes.value = (await jobTypesService.all()) || []  } catch (e) { console.error(e) }
})
</script>

<style scoped>
.req-grid {
  display: grid;
  grid-template-columns: 28px 200px 64px 160px 130px 160px 1fr 1fr 1fr 36px;
  gap: 6px;
  align-items: start;
}
</style>
