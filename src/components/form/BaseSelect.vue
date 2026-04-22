<template>
  <div class="flex items-end" v-bind="$attrs">
    <div class="flex-1 min-w-0">
      <!-- Label -->
      <label v-if="label" class="text-sm text-gray-600 mb-1 block font-bold">
        {{ label }}
      </label>

      <!-- Wrapper: relative container (button'lar shu'ga nisbatan joylashadi) -->
      <div ref="triggerRef" class="relative" :class="disabled ? 'cursor-not-allowed' : ''">

        <!-- INPUT — yopiqda selectedLabel, ochiqda searchQuery ko'rsatadi -->
        <input
          ref="inputRef"
          :value="isOpen ? searchQuery : selectedLabel"
          @input="handleInput"
          @click="openDropdown"
          @keydown="handleKeydown"
          :placeholder="isOpen ? 'Qidirish...' : (placeholder || 'Tanlang')"
          :disabled="disabled"
          autocomplete="off"
          class="w-full border transition-all duration-200 outline-none"
          :class="[
            sizeClasses,
            disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 pointer-events-none'
              : 'bg-white border-gray-300 hover:border-gray-400',
            isOpen && !disabled ? 'ring-2 ring-blue-300 border-blue-400' : '',
            isOpen ? 'cursor-text placeholder:text-gray-400' : 'cursor-pointer',
            selectedLabel && !isOpen ? 'text-gray-900' : 'text-gray-500',
            rightPaddingClass
          ]"
        />

        <!-- Chevron icon (hech narsa tanlanmagan va ochiq emas) -->
        <span
          v-if="!model && !isOpen && !added"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" :class="disabled ? 'opacity-40' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>

        <!-- Search icon (ochiq bo'lganda) -->
        <span
          v-if="isOpen"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </span>

        <!-- Added button -->
        <button
          v-if="added"
          type="button"
          @mousedown.prevent.stop="emit('open-modal')"
          :class="model && clearable ? 'right-8' : 'right-2'"
          class="absolute top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors z-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>

        <!-- Clear button -->
        <button
          v-if="model && clearable && !isOpen"
          type="button"
          @mousedown.prevent="clearSelection"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <slot name="append" />
  </div>

  <!-- DROPDOWN — body ga teleport (overflow/z-index muammosi yo'q) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95">
      <div
        v-if="isOpen"
        ref="dropdownMenuRef"
        :style="dropdownStyle"
        class="fixed bg-white shadow-xl rounded-md ring-1 ring-black ring-opacity-5 overflow-hidden"
        style="z-index: 9999"
        @mousedown.stop>
        <ul class="overflow-auto py-1 text-sm" style="max-height: 260px">
          <li v-if="filteredOptions.length === 0"
            class="text-gray-500 cursor-default select-none py-4 text-center px-4 text-sm">
            Ma'lumot topilmadi
          </li>

          <li
            v-else
            v-for="opt in filteredOptions"
            :key="opt[valueKey]"
            @mousedown.prevent="selectOption(opt)"
            class="cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-blue-50 transition-colors"
            :class="model === opt[valueKey] ? 'text-blue-900 bg-blue-50 font-medium' : 'text-gray-900'">
            <span class="block truncate">{{ opt[labelKey] }}</span>
            <span v-if="model === opt[valueKey]"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd" />
              </svg>
            </span>
          </li>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

defineOptions({ inheritAttrs: false })
const model = defineModel()

const props = defineProps({
  label: String,
  options: { type: Array, default: () => [] },
  labelKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'id' },
  modelValue: [String, Number, Object],
  placeholder: String,
  added: Boolean,
  required: Boolean,
  disabled: Boolean,
  clearable: { type: Boolean, default: true },
  size: {
    type: String,
    default: 'md',
    validator: (val) => ['sm', 'md', 'lg', 'xl'].includes(val)
  }
})

const emit = defineEmits(['open-modal', 'change'])

const isOpen = ref(false)
const triggerRef = ref(null)   // wrapper div (pozitsiya uchun)
const inputRef = ref(null)     // actual input
const dropdownMenuRef = ref(null)
const searchQuery = ref('')
const dropdownStyle = ref({})

// ─── O'NG PADDING (button'lar ustiga chiqmasin) ────────────────────────────
const rightPaddingClass = computed(() => {
  if (props.added && model.value && props.clearable) return 'pr-14'
  if (props.added || (model.value && props.clearable)) return 'pr-8'
  return 'pr-8'
})

// ─── SIZE ──────────────────────────────────────────────────────────────────
const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-1.5 text-xs rounded-md',
    md: 'px-3 py-2 text-sm rounded-lg',
    lg: 'px-4 py-2.5 text-base rounded-lg',
    xl: 'px-5 py-3 text-lg rounded-xl'
  }
  return sizes[props.size] || sizes.md
})

// ─── TANLANGAN LABEL ───────────────────────────────────────────────────────
const selectedLabel = computed(() => {
  if (model.value === null || model.value === undefined || model.value === '') return ''
  const found = props.options.find(opt => opt[props.valueKey] == model.value)
  return found ? found[props.labelKey] : ''
})

// ─── FILTER ────────────────────────────────────────────────────────────────
const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const q = searchQuery.value.toLowerCase()
  return props.options.filter(opt =>
    String(opt[props.labelKey]).toLowerCase().includes(q) ||
    String(opt[props.valueKey]).toLowerCase().includes(q)
  )
})

// ─── DROPDOWN OCHISH ───────────────────────────────────────────────────────
const openDropdown = () => {
  if (props.disabled || isOpen.value) return
  isOpen.value = true
}

watch(isOpen, async (val) => {
  if (val) {
    searchQuery.value = ''
    await nextTick()
    updateDropdownPosition()
    inputRef.value?.focus()
  }
})

// ─── INPUT HANDLER ─────────────────────────────────────────────────────────
const handleInput = (e) => {
  searchQuery.value = e.target.value
  if (!isOpen.value) openDropdown()
}

// ─── KEYBOARD ──────────────────────────────────────────────────────────────
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    isOpen.value = false
    inputRef.value?.blur()
  }
  if (e.key === 'Tab') {
    isOpen.value = false
  }
  if (!isOpen.value && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    openDropdown()
  }
}

// ─── OPTION TANLASH ────────────────────────────────────────────────────────
const selectOption = (opt) => {
  model.value = opt[props.valueKey]
  isOpen.value = false
  emit('change', opt[props.valueKey])
}

const clearSelection = () => {
  model.value = null
  searchQuery.value = ''
  emit('change', null)
  nextTick(() => inputRef.value?.focus())
}

// ─── POZITSIYANI HISOBLASH ─────────────────────────────────────────────────
const DROPDOWN_MAX_HEIGHT = 280
const GAP = 4

const updateDropdownPosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  const vh = window.innerHeight
  const vw = window.innerWidth

  const spaceBelow = vh - rect.bottom - GAP
  const spaceAbove = rect.top - GAP
  const showAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow

  let left = rect.left
  if (left + rect.width > vw - 8) left = vw - rect.width - 8
  if (left < 8) left = 8

  dropdownStyle.value = {
    left: `${left}px`,
    width: `${rect.width}px`,
    maxHeight: `${DROPDOWN_MAX_HEIGHT}px`,
    ...(showAbove
      ? { bottom: `${vh - rect.top + GAP}px`, top: 'auto' }
      : { top: `${rect.bottom + GAP}px`, bottom: 'auto' }
    )
  }
}

// ─── TASHQARIGA CLICK ─────────────────────────────────────────────────────
const handleClickOutside = (e) => {
  if (triggerRef.value?.contains(e.target)) return
  if (dropdownMenuRef.value?.contains(e.target)) return
  isOpen.value = false
}

// ─── SCROLL — yopish (dropdown ichida emas) ───────────────────────────────
const handleScroll = (e) => {
  if (!isOpen.value) return
  if (dropdownMenuRef.value?.contains(e.target)) return
  isOpen.value = false
}

const handleResize = () => {
  if (isOpen.value) updateDropdownPosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', handleResize)
})
</script>
