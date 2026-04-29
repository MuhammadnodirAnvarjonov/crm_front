<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseSelect label="Vazifa turi" v-model="form.type" :options="typeOptions" labelKey="name" valueKey="value" :clearable="false" />
      <BaseSelect label="Holati" v-model="form.status" :options="statusOptions" labelKey="name" valueKey="value" :clearable="false" />

      <div class="md:col-span-2">
        <BaseInput label="Sarlavha" v-model="form.title" required placeholder="Mijoz bilan bog'lanish..." />
      </div>

      <BaseInput label="Mijoz ismi" v-model="form.person_name" placeholder="Ism Familiya" />
      <BaseInput label="Telefon" v-model="form.phone" placeholder="+998..." />

      <div>
        <label class="text-sm font-semibold text-gray-700">Muddat</label>
        <input type="datetime-local" v-model="form.due_at"
          class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <BaseSelect label="Mas'ul xodim" v-model="form.assigned_user_id" :options="userOptions"
        labelKey="name" valueKey="id" placeholder="Tanlang" />

      <BaseInputNumber label="Urinishlar" v-model="form.attempts" :min="0" :max="99" :format="false" />
      <BaseInputNumber label="Maks urinishlar" v-model="form.max_attempts" :min="1" :max="99" :format="false" />

      <div class="md:col-span-2">
        <BaseTextarea label="Tavsif" v-model="form.description" rows="3" />
      </div>
    </div>

    <div class="px-1 py-4 border-t border-gray-100 mt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
      <BaseButton type="button" status="gray" @click="$emit('close')">Bekor qilish</BaseButton>
      <BaseButton type="submit" status="primary" :loading="saving">Saqlash</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseInputNumber from '@/components/form/BaseInputNumber.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import tasksService from '@/services/tasks.service'
import usersService from '@/services/users.service'

const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const saving = ref(false)
const users = ref([])

const form = ref({
  type: 'call', title: '', description: '',
  person_name: '', phone: '', due_at: '',
  status: 'pending', attempts: 0, max_attempts: 3,
  assigned_user_id: null,
})

const typeOptions = [
  { value: 'call', name: "Qo'ng'iroq" },
  { value: 'callback', name: 'Qayta aloqa' },
  { value: 'check', name: 'Tekshiruv' },
  { value: 'payment', name: "To'lov eslatmasi" },
  { value: 'sale', name: 'Sotuv' },
  { value: 'offer', name: 'Taklif' },
  { value: 'contract', name: 'Shartnoma' },
  { value: 'ad', name: 'Reklama taklifi' },
  { value: 'other', name: 'Boshqa' },
]
const statusOptions = [
  { value: 'pending', name: 'Kutilmoqda' },
  { value: 'progress', name: 'Jarayonda' },
  { value: 'done', name: 'Bajarildi' },
  { value: 'overdue', name: "Muddati o'tdi" },
  { value: 'no_contact', name: 'Aloqa yo\'q' },
]

const userOptions = computed(() => users.value.map((u) => ({
  id: u.id,
  name: u.user_name || `User ${u.id}`,
})))

const populate = (data) => {
  if (!data) {
    form.value = {
      type: 'call', title: '', description: '',
      person_name: '', phone: '', due_at: '',
      status: 'pending', attempts: 0, max_attempts: 3,
      assigned_user_id: null,
    }
    return
  }
  form.value = {
    type: data.type || 'call',
    title: data.title || '',
    description: data.description || '',
    person_name: data.person_name || '',
    phone: data.phone || '',
    due_at: data.due_at ? new Date(data.due_at).toISOString().slice(0, 16) : '',
    status: data.status || 'pending',
    attempts: data.attempts ?? 0,
    max_attempts: data.max_attempts ?? 3,
    assigned_user_id: data.assigned_user_id || null,
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.due_at) payload.due_at = null
    if (props.editData?.id) await tasksService.update(props.editData.id, payload)
    else await tasksService.create(payload)
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Task save error', e)
  } finally {
    saving.value = false
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(async () => {
  try {
    const data = await usersService.all()
    users.value = Array.isArray(data) ? data : (data?.rows || [])
  } catch (e) { console.error(e) }
})
</script>
