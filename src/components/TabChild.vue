<!-- BTab.vue -->
<template>
  <!-- Render content only if this tab is the active visible tab -->
  <div v-show="isActive" ref="contentWrap">
    <slot />
  </div>
</template>

<script setup>
import { inject, onMounted, onBeforeUnmount, ref, reactive, computed, watch } from 'vue'

/**
 * Props:
 * - title (String)
 * - titleLinkClass (String)  -> title-link-class in kebab-case
 */
const props = defineProps({
  title: { type: String, default: '' },
  titleLinkClass: { type: String, default: '' },
  // optional control to completely hide the tab (maps v-if). Parent will respect `render`
  render: { type: Boolean, default: true },
})

const emit = defineEmits(['activate', 'click']) // emits when tab becomes active

const controller = inject('tabsController', null)
if (!controller) {
  throw new Error('BTab must be used inside BTabs')
}

const vnodeRef = {
  emitActivate: () => {
    // when activated by parent, emit 'activate' so parent/consumer can react
    emit('activate')
  }
}

const local = reactive({
  _uid: Math.random().toString(36).slice(2),
  props: {
    title: props.title,
    'title-link-class': props.titleLinkClass,
  },
  vnodeRef,
  render: props.render,
})

/* register on mount */
let myIndex = null
onMounted(() => {
  // register and receive index (not strictly needed)
  myIndex = controller.registerTab(local)
})

onBeforeUnmount(() => {
  controller.unregisterTab(local._uid)
})

/* compute if this tab is currently active among visible tabs */
const isActive = computed(() => {
  // find visible index of this tab
  const visible = controller.tabs.value.filter(t => t.render !== false)
  const visibleIdx = visible.findIndex(t => t._uid === local._uid)
  return visibleIdx !== -1 && controller.activeIndex.value === visibleIdx
})

/* watch for prop changes to update parent registry entry */
watch(() => props.title, (v) => { local.props.title = v })
watch(() => props.titleLinkClass, (v) => { local.props['title-link-class'] = v })
watch(() => props.render, (v) => { local.render = v })

/* If user clicks directly on tab content and wants to signal click, expose method */
function emitClick() {
  emit('click')
}
</script>

<style scoped>
/* optional small spacing */
</style>
