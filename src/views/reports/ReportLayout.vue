<template>
  <div class="h-screen flex flex-col overflow-hidden" style="background: #f0f2f5;">

    <!-- Fixed top bar -->
    <div class="flex-shrink-0 border-b border-slate-700" style="background: #1e293b;">
      <div class="flex items-center gap-3 px-4 md:px-6 h-14">

        <!-- Back button -->
        <button
          @click="$router.push({ name: 'reports' })"
          class="back-btn flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          <span>Hisobotlar</span>
        </button>

        <span style="color: #475569; font-size: 18px; user-select: none;">/</span>

        <h1 class="text-sm font-bold truncate" style="color: #f1f5f9;">{{ $route.meta.title }}</h1>
      </div>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-auto p-2 md:p-3">
      <router-view />
    </div>

  </div>
</template>

<style scoped>
.back-btn {
  background: rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}
</style>
