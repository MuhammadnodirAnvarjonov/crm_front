<!-- Tabs.vue -->
<template>
  <div>
    <!-- Nav -->
    <div class="mb-1 border-b border-gray-100">
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <!-- Render tab buttons in registration order -->
        <button
          v-for="(tab, idx) in visibleTabs"
          :key="tab._uid"
          @click="activate(idx)"
          class="px-2 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2"
          :class="activeIndex === idx
            ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-md'"
        >
          <span :class="tab.props['title-link-class'] || ''">{{ tab.props.title }}</span>
        </button>
      </div>
    </div>

    <!-- Content: only the active tab's slot is shown -->
    <div class="p-1 border rounded-md bg-white shadow-sm">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed, onBeforeUnmount } from 'vue'

/**
 * BTabs: parent controller
 * Provides register/unregister/select functionality for child tabs.
 */

const activeIndex = ref(0)
const tabs = ref([])

/**
 * registerTab(tabInstance)
 * tabInstance = { _uid, props, vnodeRef }
 * returns index of the registered tab
 */
function registerTab(tabInstance) {
  tabs.value.push(tabInstance)
  return tabs.value.length - 1
}
function unregisterTab(uid) {
  const i = tabs.value.findIndex(t => t._uid === uid)
  if (i !== -1) {
    tabs.value.splice(i, 1)
    // if removed tab is before the active one, shift index
    if (i <= activeIndex.value && activeIndex.value > 0) activeIndex.value--
    // clamp
    if (activeIndex.value >= tabs.value.length) activeIndex.value = Math.max(0, tabs.value.length - 1)
  }
}
function selectIndex(i) {
  if (i < 0 || i >= visibleTabs.value.length) return
  // map visible index to global tabs index
  const globalTab = visibleTabs.value[i]
  const globalIndex = tabs.value.findIndex(t => t._uid === globalTab._uid)
  if (globalIndex !== -1) {
    activeIndex.value = i
    // emit activate on that tab's vnodeRef if provided
    if (globalTab.vnodeRef && globalTab.vnodeRef.emitActivate) globalTab.vnodeRef.emitActivate()
  }
}

/* Expose register/unregister/select to children via provide */
provide('tabsController', {
  registerTab,
  unregisterTab,
  getActiveIndex: () => activeIndex.value,
  setActiveVisibleIndex: (i) => selectIndex(i),
  activeIndex,
  tabs,
})

/* visibleTabs: only those tabs that are currently rendered (v-if true) */
const visibleTabs = computed(() => tabs.value.filter(t => t.render !== false))

/* function used by template buttons */
function activate(visibleIdx) {
  selectIndex(visibleIdx)
}
</script>

<style scoped>
/* scrollbar-hide helper */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
