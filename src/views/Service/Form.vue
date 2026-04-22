<template>
  <form @submit.prevent="saveService" class="flex flex-col h-full bg-white rounded-lg shadow-sm relative">

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="absolute inset-0 z-50 bg-white/80 flex items-center justify-center rounded-lg">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
        <span class="text-sm text-gray-500 font-medium">{{ $t('loading') }}...</span>
      </div>
    </div>

    <!-- Header -->
    <!-- <div class="px-6 py-4 border-b flex justify-between items-center">
      <h3 class="text-xl font-semibold text-gray-800">
        {{ $t('service') }} {{ props.editData && props.editData.id ? $t('edit') : $t('create') }}
      </h3>
    </div> -->

    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-3 space-y-6">

      <!-- 1. Asosiy Ma'lumotlar | Moliya va Narxlar -->
      <div class="grid grid-cols-2 gap-4">
        <section class="border border-gray-200 rounded-lg p-3">
          <h4 class="text-md font-bold text-blue-600 mb-2 uppercase tracking-wide border-b pb-1">
            {{ $t('main information') }}
          </h4>
          <div class="grid grid-cols-3 gap-2">
            <BaseSelect :label="$t('branch')" v-model="form.branch_id" :options="branches" label-key="name" value-key="id" />
            <BaseInput :label="$t('name')" v-model="form.name" :maxlength="200" show-count />
            <BaseInput :label="$t('nickname')" v-model="form.nickname" :maxlength="200" show-count />
            <BaseSelect :label="$t('service-category')" v-model="form.service_category_id" :options="serviceCategories" label-key="name" value-key="id" added @open-modal="openAddModal('category')" />
            <BaseSelect :label="$t('section')" v-model="form.section_id" :options="sections" label-key="name" value-key="id" added @open-modal="openAddModal('section')" />
            <BaseInput :label="$t('comment')" v-model="form.comment" :maxlength="256"/>
          </div>
        </section>
        <section class="border border-gray-200 rounded-lg p-3">
          <h4 class="text-md font-bold text-green-600 mb-2 uppercase tracking-wide border-b pb-1">
            {{ $t('finance and prices') }}
          </h4>
          <div class="grid grid-cols-3 gap-2">
            <BaseInputNumber :label="$t('price')" :button="false" v-model="form.price" :disabled="form.selectable" :step="1000" :min="0" />
            <BaseInputNumber :label="$t('citizen_price')" :button="false" v-model="form.citizen_price" :disabled="form.selectable" :step="1000" :min="0" />
            <BaseInputNumber :label="$t('stationar_price')" :button="false" v-model="form.stationar_price" :disabled="form.selectable" :step="1000" :min="0" />
            <BaseInputNumber :label="$t('scot')" :button="false" v-model="form.scot" :min="0" :max="100" :step="1" />
          </div>
        </section>
      </div>

      <!-- 2. Sozlamalar va Bonus -->
      <section class="border border-gray-200 rounded-lg p-3">
        <h4 class="text-md font-bold text-purple-600 mb-2 uppercase tracking-wide border-b pb-1">
          {{ $t('settings and bonus') }}
        </h4>
        <div class="grid grid-cols-6 gap-2">
          <BaseSelect :label="$t('queue_type')" v-model="form.queue_type" :options="globalStore.queue_type" label-key="name" value-key="id" />
          <BaseSelect :label="$t('shablon_type')" v-model="form.shablon_type" :options="globalStore.shablon_type" label-key="name" value-key="id" />
          <BaseInputNumber :label="$t('index')" :button="false" v-model="form.index" :format="false" :step="1" :min="0" />
          <div class="flex items-center h-full pt-5">
            <label class="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" v-model="form.selectable" @change="handleSelectableChange"
                class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300">
              <span class="text-gray-700 text-sm font-medium">{{ $t('selectable') }}</span>
            </label>
            <BaseCheckbox v-model="form.rasxod_changed" class="ml-4" :label="$t('rasxod_changed')" />
          </div>
          <div class="col-span-6 flex gap-4 bg-gray-50 p-2 rounded border border-gray-100">
            <BaseCheckbox v-model="views.mobile" :label="$t('mobile')" />
            <BaseCheckbox v-model="views.bot" :label="$t('bot')" />
            <BaseCheckbox v-model="views.sayt" :label="$t('sayt')" />
            <BaseCheckbox v-model="views.panel" :label="$t('panel')" />
          </div>
        </div>
      </section>

      <!-- 3. Service Users (Ko'p foydalanuvchi) -->
      <section class="border border-gray-200 rounded-lg p-3">
        <div class="flex justify-between items-center mb-2 border-b pb-1">
          <h4 class="text-md font-bold text-teal-600 uppercase tracking-wide">
            Xizmat foydalanuvchilari
          </h4>
          <button type="button" @click="addServiceUser"
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-1">
            <span>+</span> Qo'shish
          </button>
        </div>
        <div v-if="form.service_users && form.service_users.length" class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-gray-50 text-gray-600 uppercase text-xs">
                <th class="px-2 py-2 text-left border">#</th>
                <th class="px-2 py-2 text-left border">Foydalanuvchi</th>
                <th class="px-2 py-2 text-right border">Skot (%)</th>
                <th class="px-2 py-2 text-right border">Narxi</th>
                <th class="px-2 py-2 text-right border">Foiz (%)</th>
                <th class="px-2 py-2 text-right border">Chiqish narxi</th>
                <th class="px-2 py-2 text-center border w-10"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(su, idx) in form.service_users" :key="idx" class="hover:bg-gray-50">
                <td class="px-2 py-1 border text-gray-500">{{ idx + 1 }}</td>
                <td class="px-2 py-1 border">
                  <BaseSelect v-model="su.user_id" :options="availableUsersFor(idx)" label-key="user_name" value-key="id" size="small" />
                </td>
                <td class="px-2 py-1 border">
                  <BaseInputNumber v-model="su.scot" :button="false" :min="0" :max="100" :step="1" size="small" />
                </td>
                <td class="px-2 py-1 border">
                  <BaseInputNumber v-model="su.user_price" :button="false" :min="0" :step="1000" size="small" @update:modelValue="onUserPriceChange(su)" />
                </td>
                <td class="px-2 py-1 border">
                  <BaseInputNumber v-model="su.user_percent" :button="false" :min="0" :max="100" :step="1" size="small" @update:modelValue="onUserPercentChange(su)" />
                </td>
                <td class="px-2 py-1 border">
                  <BaseInputNumber v-model="su.output_price" :button="false" :min="0" :step="1000" size="small" />
                </td>
                <td class="px-2 py-1 border text-center">
                  <button type="button" @click="removeServiceUser(idx)"
                    class="text-red-500 hover:text-red-700 font-bold text-lg leading-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center text-gray-400 py-4 text-sm">
          Foydalanuvchilar qo'shilmagan
        </div>
      </section>

      <!-- 4. Dynamic Child Services Table -->
      <section v-if="form.shablon_type !== 'dinamic-shablon'">
        <div class="flex justify-between items-end mb-3 border-b pb-1">
          <h4 class="text-md font-bold text-orange-600 uppercase tracking-wide">
            {{ $t('service content (analysis)') }}
          </h4>
          <button type="button" @click="addChild"
            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition flex items-center gap-1">
            <span>+</span> {{ $t('add_child') }}
          </button>
        </div>

        <div class="border rounded-lg overflow-hidden border-gray-200">
          <ServiceChildTable :service="form.th_text ? form : {...form, th_text: JSON.stringify([{ name: 'Natija' }, { name: 'Norma'}])}" @updateSection="updateSection" />
        </div>
      </section>
      <section v-else>
        <div class="flex justify-between items-end mb-3 border-b pb-1">
          <h4 class="text-md font-bold text-orange-600 uppercase tracking-wide">
            {{ $t('Shablon') }}
          </h4>
        </div>
        <div class="border rounded-lg overflow-hidden border-gray-200">
          <TextEditor :service="form" shablonDocType="service" :selectedServiceIndex="0" @updateText="updateSection" />
        </div>
      </section>
    </div>
    <!-- Footer -->
    <div class="sticky bottom-[-25px] px-6 py-4 bg-gray-50 border-t flex justify-between items-center rounded-b-lg z-10">
      <button type="button" @click="showRasxodModal = true"
        class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        {{ $t('rasxod') }}
        <span v-if="form.rasxod_services && form.rasxod_services.length" class="bg-white text-red-600 rounded-full px-1.5 text-xs font-bold">
          {{ form.rasxod_services.length }}
        </span>
      </button>
      <div class="flex gap-3">
        <button type="button" @click="$emit('close')"
          class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2 rounded-lg font-medium transition shadow-sm">
          {{ $t('cancel') }}
        </button>

        <button v-if="props.editData && props.editData.id" type="button" @click="saveAsCopy"
          class="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          <span>{{ $t('copy') || 'Nusxa olish' }}</span>
        </button>

        <button type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm flex items-center gap-2">
          <span>{{ $t('save') }}</span>
        </button>
      </div>
    </div>

    <!-- Rasxod Modal -->
    <div v-if="showRasxodModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="showRasxodModal = false">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-[80vw] h-[80vh] flex flex-col">
        <div class="px-5 py-3 border-b flex justify-between items-center">
          <h3 class="text-lg font-semibold text-red-600">{{ $t('rasxod') }}</h3>
          <button type="button" @click="showRasxodModal = false" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        </div>
        <div class="flex-1 overflow-hidden p-4">
          <RasxodService :service="form" />
        </div>
        <div class="px-5 py-3 border-t flex justify-end">
          <button type="button" @click="showRasxodModal = false"
            class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            {{ $t('close') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModalAdded" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import ServiceChildTable from "./ServiceChildTable.vue";
import RasxodService from "./RasxodService.vue";
import TextEditor from "@/views/registration/RegComponents/TextEditor.vue";
import ModelService from "@/services/service.service";
import usersService from "@/services/users.service";
import serviceCategoryService from "@/services/service-category.service";
import sectionsService from "@/services/sections.service";
import branchService from "@/services/branchs.service";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseRadio from "@/components/icons/BaseRadio.vue";
import BaseCheckbox from "@/components/form/BaseCheckbox.vue";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import { generateRandomString } from "@/composables/RandomGenerator";

const props = defineProps({
  editData: Object,
  categoryId: Number
});
const emit = defineEmits(["saved", "close"]);
const userStore = useUserStore();
const globalStore = useGlobalStore();

const showModalAdded = ref(false);
const showRasxodModal = ref(false);
const modalTitle = ref("");
const isLoading = ref(false); // Loading state

const branches = ref([]);
const users = ref([]);
const sections = ref([]);
const serviceCategories = ref([]);

const views = ref({
  mobile: false,
  panel: true,
  sayt: true,
  bot: false
})
const form = ref({
  name: "",
  nickname: "",
  comment: "",
  user_id: null,
  branch_id: userStore.user?.branch_id || null,
  service_category_id: props.categoryId,
  section_id: null,
  queue_type: "all",
  shablon_type: "default",
  selectable: true,
  index: 0,
  price: 0,
  citizen_price: 0,
  stationar_price: 0,
  scot: 0,
  rasxod_services: [],
  service_users: [],
  childs: [],
  th_text: JSON.stringify([{ name: "Natija" },{ name: "Norma" }]),
  th_name: "Ko'rsatkich",
  shablon_text: "",
  rasxod_changed: false,
});
watch(() => form.value.shablon_type, (newVal, oldVal) => {
  const newKey = `${new Date().getTime()}_${generateRandomString(4)}`;
  if (newVal === 'dinamic-shablon') {
    form.value.childs = [{
      name: form.value.name || '',
      key: newKey,
      norm: '',
      price: 0,
      citizen_price: 0,
      stationar_price: 0,
    }];
  } else if (oldVal === 'dinamic-shablon') {
    form.value.childs = [{
      name: form.value.name || '',
      key: newKey,
      norm: [
        { value: "", colspan: 1, hidden: false, status: "black", disabled: false },
        { value: "", colspan: 1, hidden: false, status: "black", disabled: false }
      ],
      price: 0,
      citizen_price: 0,
      stationar_price: 0,
    }];
    // rasxod_services larni yangi child keyga moslash
  }
  form.value.rasxod_services.forEach(rs => {
    rs.key = newKey;
  });
});

const updateSection = (updatedService) => {
  form.value = { ...form.value, ...updatedService };
};
const handleSelectableChange = () => {
  if (form.value.selectable) {
    form.value.price = 0;
    form.value.citizen_price = 0;
    form.value.stationar_price = 0;
  } else {
    form.value.childs.forEach(child => {
      child.price = 0;
      child.citizen_price = 0;
      child.stationar_price = 0;
    });
  }
};
// --- LOGIC: COLUMNS & ROWS ---

const addChild = () => {
  let headers = [];
  try {
    headers = JSON.parse(form.value.th_text ? form.value.th_text : '[{"name":"Natija"},{"name":"Norma"}]');
  } catch (e) {
    headers = [{ name: "Natija" }, { name: "Norma" }];
  }
  const newNorm = headers.map(() => ({
    value: "",
    colspan: 1,
    hidden: false,
    status: "black"
  }));

  form.value.childs.push({
    name: "",
    key: `${new Date().getTime()}_${generateRandomString(4)}`,
    norm: newNorm,
    price: 0,
    citizen_price: 0,
    stationar_price: 0,
  });
};

const onUserPriceChange = (su) => {
  if (su.user_price > 0) su.user_percent = 0;
};

const onUserPercentChange = (su) => {
  if (su.user_percent > 100) su.user_percent = 100;
  if (su.user_percent > 0) su.user_price = 0;
};

const availableUsersFor = (idx) => {
  const selectedIds = form.value.service_users
    .filter((su, i) => i !== idx && su.user_id)
    .map(su => su.user_id);
  return users.value.filter(u => !selectedIds.includes(u.id));
};

const addServiceUser = () => {
  form.value.service_users.push({
    user_id: null,
    scot: 0,
    user_price: 0,
    user_percent: 0,
    output_price: 0,
  });
};

const removeServiceUser = (idx) => {
  form.value.service_users.splice(idx, 1);
};

const openAddModal = (type) => {
  modalTitle.value = type === 'section' ? "Bo'lim qo'shish" : "Kategoriya qo'shish";
  showModalAdded.value = true;
};

// --- DATA FETCH ---
const fetchData = async () => {
  try {
    const [branchRes, userRes, sectionRes, categoryRes] = await Promise.all([
      branchService.all(),
      usersService.all(),
      sectionsService.all(),
      serviceCategoryService.all()
    ]);
    branches.value = branchRes || [];
    users.value = userRes || [];
    sections.value = sectionRes || [];
    serviceCategories.value = categoryRes || [];
  } catch (err) {
    console.error("Error loading data:", err);
  }
};

const preparePayload = () => {
  const payload = JSON.parse(JSON.stringify(form.value)); // Deep copy
  
  // Childlarni normasini stringify qilish (API shuni kutayotgan bo'lsa)
  payload.childs = payload.childs.map(child => ({
    ...child,
    norm: JSON.stringify(child.norm)
  }));

  // View sozlamalari
  const activeViews = Object.keys(views.value).filter(key => views.value[key]);
  payload.view = JSON.stringify(activeViews);

  return payload;
};
const saveService = async () => {
  try {
    const payload = preparePayload();
    if (props.editData && props.editData.id) {
      await ModelService.update(props.editData.id, payload);
    } else {
      await ModelService.create(payload);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Save error:", err);
  }
};

const saveAsCopy = async () => {
  try {
    const rawPayload = preparePayload();
    const { id, ...payloadWithoutId } = rawPayload;
    const cleanChilds = payloadWithoutId.childs.map(child => {
      const { id, service_id, created_at, updated_at, ...cleanChild } = child;
      return cleanChild;
    });

    const cleanRasxodServices = (payloadWithoutId.rasxod_services || []).map(r => {
      const { id, service_id, ...cleanR } = r;
      return cleanR;
    });

    const cleanServiceUsers = (payloadWithoutId.service_users || []).map(su => {
      const { id, service_id, ...cleanSU } = su;
      return cleanSU;
    });

    const copyPayload = {
      ...payloadWithoutId,
      name: payloadWithoutId.name + " nusxa",
      childs: cleanChilds,
      rasxod_services: cleanRasxodServices,
      service_users: cleanServiceUsers,
    };

    await ModelService.create(copyPayload);
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Copy error:", err);
  }
};

onMounted(async () => {
  isLoading.value = true;
  await fetchData();

  if (props.editData && props.editData.id) {
    try {
      const response = await ModelService.getById(props.editData.id);
      const serverData = response.data || response;

      // Muhim: Childlarning 'norm' maydonini parse qilib olish va key generatsiya
      if (serverData.childs) {
        serverData.childs = serverData.childs.map((c, i) => ({
          ...c,
          norm: typeof c.norm === 'string' ? JSON.parse(c.norm) : c.norm,
          key: c.key || `${new Date().getTime()}_${i}_${generateRandomString(4)}`
        }));
      }

      // Rasxod servicelarni child key bilan bog'lash
      if (serverData.rasxod_services && serverData.childs) {
        const childKeyMap = {};
        serverData.childs.forEach(c => { childKeyMap[c.id] = c.key; });
        serverData.rasxod_services = serverData.rasxod_services.map(r => ({
          ...r,
          key: r.key || childKeyMap[r.service_child_id] || null
        }));
      }

      form.value = { ...form.value, ...serverData };
      
      // Viewlarni yuklash...
      if (serverData.view) {
        const parsedView = typeof serverData.view === 'string' ? JSON.parse(serverData.view) : serverData.view;
        Object.keys(views.value).forEach(k => views.value[k] = parsedView.includes(k));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  isLoading.value = false;
});
</script>