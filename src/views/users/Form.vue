<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput :label="$t('user_name')" v-model="form.user_name" required />
      <BaseInput :label="$t('phone')" v-model="form.phone" placeholder="+998 ..." />

      <BaseSelect :label="$t('role')" v-model="form.role_id" :options="roles" label-key="name" value-key="id" required />
      <BaseSelect label="Jinsi" v-model="form.gender" :options="genderOptions" label-key="label" value-key="value" />

      <BaseInput :label="$t('password') + (editData ? ' (o\'zgartirish uchun)' : '')" v-model="form.password"
        type="password" :required="!editData" />

      <div class="flex items-center gap-4 md:col-span-2">
        <BaseCheckbox v-model="form.activity" label="Faol" />
      </div>

      <div class="md:col-span-2">
        <BaseTextarea :label="$t('comment')" v-model="form.comment" rows="2" />
      </div>
    </div>

    <div class="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 flex justify-end gap-3 sticky bottom-0">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import userService from '@/services/users.service'
import roleService from '@/services/roles.service'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseCheckbox from '@/components/form/BaseCheckbox.vue'
import BaseButton from '@/components/form/BaseButton.vue'

const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const roles = ref([])
const genderOptions = [
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
]

const form = ref({
  user_name: '',
  phone: '',
  role_id: null,
  gender: null,
  password: '',
  comment: '',
  activity: true,
})

const loadRoles = async () => {
  try {
    roles.value = (await roleService.all()) || []
  } catch (e) {
    console.error('Roles load error', e)
  }
}

const populate = (data) => {
  if (!data) return
  form.value = {
    user_name: data.user_name || '',
    phone: data.phone || '',
    role_id: data.role_id ?? null,
    gender: data.gender ?? null,
    password: '',
    comment: data.comment || '',
    activity: data.activity ?? true,
  }
}

const save = async () => {
  const payload = { ...form.value }
  if (!payload.password) delete payload.password
  try {
    if (props.editData?.id) {
      await userService.update(props.editData.id, payload)
    } else {
      await userService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Save error', e)
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(loadRoles)
</script>
