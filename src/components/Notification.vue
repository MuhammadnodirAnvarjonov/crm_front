<template>
  <transition name="notification-slide">
    <div
      v-if="visible"
      class="fixed z-[99999] animate-slide-in"
      :class="[positionClass]"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- Chat xabar notification -->
      <div v-if="variant === 'chat'"
        class="flex items-start gap-3 w-[340px] rounded-2xl px-4 py-3 shadow-2xl border backdrop-blur-md transition-all"
        :style="onClick ? 'cursor:pointer' : ''"
        style="background: rgba(255,255,255,0.97); border-color: #f0d0e8; box-shadow: 0 8px 32px rgba(233,30,140,0.15), 0 2px 8px rgba(0,0,0,0.08)"
        @click="handleClick">
        <!-- Avatar -->
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-md"
          style="background: linear-gradient(135deg, #E91E8C, #13286e)">
          {{ avatarLetter }}
        </div>
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="font-bold text-sm truncate" style="color:#13286e">{{ message }}</span>
            <span class="text-[10px] flex-shrink-0 ml-2" style="color:#9ca3af">hozir</span>
          </div>
          <p class="text-xs mt-0.5 truncate" style="color:#6b7280">{{ meta }}</p>
        </div>
        <!-- Close -->
        <button class="p-0.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 mt-0.5"
          @click.stop="close">
          <svg class="w-3.5 h-3.5" style="color:#9ca3af" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Oddiy notification (success, error, warning, info) -->
      <div v-else
        class="flex items-start gap-3 w-80 rounded-xl shadow-lg px-4 py-3 text-white"
        :class="[bgColor]"
        :style="onClick ? 'cursor:pointer' : ''"
        @click="handleClick">
        <div class="flex-shrink-0 text-xl">
          <span v-if="type === 'error'">&#10060;</span>
          <span v-else-if="type === 'success'">&#9989;</span>
          <span v-else-if="type === 'info'">&#8505;&#65039;</span>
          <span v-else-if="type === 'warning'">&#9888;&#65039;</span>
        </div>
        <div class="flex-1">
          <div class="font-semibold">{{ message }}</div>
          <div class="text-sm opacity-80" v-if="meta">{{ meta }}</div>
        </div>
        <button class="text-white/70 hover:text-white" @click.stop="close">&#10006;</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'info' },
  variant: { type: String, default: 'default' }, // 'default' | 'chat'
  message: { type: String, required: true },
  meta: { type: String, default: '' },
  duration: { type: Number, default: 2000 },
  keepAliveOnHover: { type: Boolean, default: true },
  position: { type: String, default: 'top-right' },
  onClick: { type: Function, default: null },
})

const visible = ref(true)
let timer = null
let remaining = props.duration
let startTime

const avatarLetter = computed(() => {
  return props.message ? props.message.charAt(0).toUpperCase() : 'A'
})

const bgColor = computed(() => {
  switch (props.type) {
    case 'success': return 'bg-green-600'
    case 'error': return 'bg-red-600'
    case 'warning': return 'bg-yellow-500 text-black'
    default: return 'bg-blue-600'
  }
})

const positionClass = computed(() => {
  return props.position === 'top-right'
    ? 'top-5 right-5'
    : props.position === 'top-left'
    ? 'top-5 left-5'
    : props.position === 'bottom-right'
    ? 'bottom-5 right-5'
    : 'bottom-5 left-5'
})

function startTimer() {
  startTime = Date.now()
  timer = setTimeout(() => {
    visible.value = false
  }, remaining)
}

function pauseTimer() {
  if (props.keepAliveOnHover) {
    clearTimeout(timer)
    remaining -= Date.now() - startTime
  }
}

function resumeTimer() {
  if (props.keepAliveOnHover) startTimer()
}

function close() {
  visible.value = false
}

function handleClick() {
  if (props.onClick) {
    props.onClick()
    visible.value = false
  }
}

onMounted(startTimer)
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.notification-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.notification-slide-leave-active {
  transition: all 0.25s ease-in;
}
.notification-slide-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(60px) scale(0.95);
}

@keyframes slide-in {
  from { opacity: 0; transform: translateX(100px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in {
  animation: slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
