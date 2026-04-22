import { computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';

/**
 * Hisobot sahifalari uchun user_id filter composable.
 *
 * Agar user `all_users` ruxsatiga ega bo'lmasa:
 *   - user_id avtomatik o'z user_id ga o'rnatiladi
 *   - canFilterUsers = false (UI da user select yashiriladi)
 *
 * @param {string} [reportKey] — permission key (default: route.name)
 * @returns {{ canFilterUsers, applyUserFilter }}
 */
export function useReportFilter(reportKey) {
  const userStore = useUserStore();
  const route = useRoute();

  const key = reportKey || route.name;

  /** Barcha xodimlarni ko'rish ruxsati bormi */
  const canFilterUsers = computed(() => {
    const s = userStore.user?.role?.settings;
    let settings = {};
    try {
      settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {};
    } catch { settings = {}; }
    const reports = settings.reports;
    if (!reports) return true; // reports yo'q bo'lsa hamma ruxsat bor (eski rollar)
    const allUsersKey = `${key}.all_users`;
    if (!(allUsersKey in reports)) return true; // key yo'q bo'lsa ruxsat bor
    return !!reports[allUsersKey];
  });

  /**
   * Params ga user_id qo'shadi (agar ruxsat yo'q bo'lsa).
   * @param {Object} params — API ga yuboriladigan filter params
   * @returns {Object} — yangilangan params
   */
  const applyUserFilter = (params = {}) => {
    if (!canFilterUsers.value) {
      return { ...params, user_id: userStore.user?.id };
    }
    return params;
  };

  return { canFilterUsers, applyUserFilter };
}
