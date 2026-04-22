<script setup>
import { ref, watch, onMounted, onBeforeUnmount, inject, nextTick } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { useChat } from '@/composables/useChat';
import BaseSearch from '@/components/form/BaseSearch.vue';

const chatStore = useChatStore();
const userStore = useUserStore();
const { sendMessage, editMessage, deleteMessage, joinRoom, leaveRoom, sendTyping, markRead } = useChat();
const fileUrl = inject('fileUrl', '');

// UI state
const messageInput = ref('');
const searchQuery = ref('');
const showNewChat = ref(false);
const userSearchQuery = ref('');
const editingMessage = ref(null);
const editContent = ref('');
const contextMenu = ref({ show: false, x: 0, y: 0, message: null });
const readersPopup = ref({ show: false, x: 0, y: 0, readers: [] });
const messagesContainer = ref(null);
const loadingOlder = ref(false);
const typingUsers = ref({});
let typingTimeout = null;
let typingTimers = {};

// Filtrlangan xonalar
const filteredRooms = () => {
  if (!searchQuery.value) return chatStore.sortedRooms;
  const q = searchQuery.value.toLowerCase();
  return chatStore.sortedRooms.filter(r => {
    const name = r.type === 'general' ? (r.name || 'Umumiy chat') : (r.otherUser?.user_name || '');
    return name.toLowerCase().includes(q);
  });
};

// Filtrlangan foydalanuvchilar
const filteredUsers = () => {
  if (!userSearchQuery.value) return chatStore.availableUsers;
  const q = userSearchQuery.value.toLowerCase();
  return chatStore.availableUsers.filter(u =>
    u.user_name?.toLowerCase().includes(q) || u.role?.name?.toLowerCase().includes(q)
  );
};

// Xona tanlash
async function selectRoom(roomId) {
  const prevRoom = chatStore.currentRoomId;
  if (prevRoom && prevRoom !== roomId) {
    leaveRoom(prevRoom);
  }

  chatStore.selectRoom(roomId);
  await chatStore.fetchMessages(roomId);
  await chatStore.fetchReadStatus(roomId);
  joinRoom(roomId);
  markRead(roomId);
  showNewChat.value = false;

  await nextTick();
  scrollToBottom();
}

// Yangi shaxsiy chat
async function startPrivateChat(userId) {
  const room = await chatStore.openPrivateChat(userId);
  if (room) {
    await selectRoom(room.id);
  }
}

// Xabar yuborish
function handleSendMessage() {
  const content = messageInput.value.trim();
  if (!content || !chatStore.currentRoomId) return;

  sendMessage(chatStore.currentRoomId, content);
  messageInput.value = '';
}

// Textarea keydown
function handleKeyDown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
  // Typing indicator
  if (chatStore.currentRoomId && e.key !== 'Enter') {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      sendTyping(chatStore.currentRoomId);
    }, 300);
  }
}

// Tahrirlashni boshlash
function startEdit(msg) {
  editingMessage.value = msg.id;
  editContent.value = msg.content;
  contextMenu.value.show = false;
}

// Tahrirlashni saqlash
function saveEdit() {
  if (!editContent.value.trim() || !editingMessage.value) return;
  editMessage(editingMessage.value, editContent.value.trim());
  editingMessage.value = null;
  editContent.value = '';
}

// Tahrirlashni bekor qilish
function cancelEdit() {
  editingMessage.value = null;
  editContent.value = '';
}

// Xabarni o'chirish
function handleDeleteMessage(msg) {
  deleteMessage(msg.id);
  contextMenu.value.show = false;
}

// Kontekst menu
function showContextMenu(e, msg) {
  if (msg.sender_id !== userStore.user?.id || msg.is_deleted) return;
  e.preventDefault();
  contextMenu.value = { show: true, x: e.clientX, y: e.clientY, message: msg };
}

function hideContextMenu() {
  contextMenu.value.show = false;
}

// Scroll
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

// Infinite scroll (eski xabarlar)
async function handleScroll() {
  if (!messagesContainer.value || loadingOlder.value) return;
  if (messagesContainer.value.scrollTop < 50) {
    loadingOlder.value = true;
    const prevHeight = messagesContainer.value.scrollHeight;
    const loaded = await chatStore.loadOlderMessages(chatStore.currentRoomId);
    if (loaded) {
      await nextTick();
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight - prevHeight;
    }
    loadingOlder.value = false;
  }
}

// Avatar harfi
function getInitial(name) {
  return name ? name.charAt(0).toUpperCase() : 'A';
}

// Xona nomi
function getRoomName(room) {
  if (room.type === 'general') return room.name || 'Umumiy chat';
  return room.otherUser?.user_name || 'Shaxsiy chat';
}

// Xona avatari
function getRoomImage(room) {
  if (room.type === 'general') return null;
  return room.otherUser?.image;
}

// Xonadagi boshqa foydalanuvchi online mi?
function isRoomUserOnline(room) {
  if (room.type === 'general') return false;
  return room.otherUser?.id ? chatStore.isUserOnline(room.otherUser.id) : false;
}

// Vaqtni formatlash
function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  if (isToday) return `${hours}:${mins}`;
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')} ${hours}:${mins}`;
}

// Kun ajratgichi
function shouldShowDateSeparator(msgs, index) {
  if (index === 0) return true;
  const curr = new Date(msgs[index].createdAt).toDateString();
  const prev = new Date(msgs[index - 1].createdAt).toDateString();
  return curr !== prev;
}

function formatDateSeparator(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Bugun';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Kecha';
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

// Read receipts — xabarni kim o'qiganini aniqlash
function getMessageReadInfo(msg) {
  const defaultResult = { isRead: false, isReadByAll: false, readBy: [], totalMembers: 0 };
  if (!msg || !msg.sender_id) return defaultResult;

  const roomId = chatStore.currentRoomId;
  const room = chatStore.currentRoom;
  if (!roomId || !room) return defaultResult;

  const statusList = chatStore.readStatus?.[roomId];
  if (!Array.isArray(statusList)) return defaultResult;

  const readers = statusList.filter(r => {
    if (!r || r.userId === msg.sender_id) return false;
    if (!r.lastReadAt || !msg.createdAt) return false;
    try {
      return new Date(r.lastReadAt) >= new Date(msg.createdAt);
    } catch { return false; }
  });

  const members = Array.isArray(room.members) ? room.members : [];
  const totalOtherMembers = members.filter(m => {
    const memberId = m?.user_id ?? m?.user?.id;
    return memberId !== msg.sender_id;
  }).length;

  return {
    isRead: readers.length > 0,
    isReadByAll: totalOtherMembers > 0 && readers.length >= totalOtherMembers,
    readBy: readers,
    totalMembers: totalOtherMembers,
  };
}

// O'qiganlar popup
function showReadersPopup(e, msg) {
  const info = getMessageReadInfo(msg);
  if (info.readBy.length === 0) return;
  e.stopPropagation();

  const rect = e.currentTarget.getBoundingClientRect();
  readersPopup.value = {
    show: true,
    x: rect.left,
    y: rect.top - 8,
    readers: info.readBy,
  };
}

function hideReadersPopup() {
  readersPopup.value.show = false;
}

// Yangi xabar kelganda scroll
watch(() => chatStore.currentMessages.length, async () => {
  await nextTick();
  // Faqat pastda bo'lsa scroll qilish
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
    if (scrollHeight - scrollTop - clientHeight < 150) {
      scrollToBottom();
    }
  }
});

// Modal ochilganda xonalarni yuklash
watch(() => chatStore.chatModalOpen, async (open) => {
  if (open) {
    await chatStore.fetchRooms();
    if (chatStore.currentRoomId) {
      await selectRoom(chatStore.currentRoomId);
    }
  }
});

// Document click — kontekst menu va readers popup yopish
onMounted(() => {
  document.addEventListener('click', hideContextMenu);
  document.addEventListener('click', hideReadersPopup);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', hideContextMenu);
  document.removeEventListener('click', hideReadersPopup);
});
</script>

<template>
  <Teleport to="body">
    <transition name="chat-modal">
      <div v-if="chatStore.chatModalOpen"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-2 sm:p-4"
        style="background: rgba(19,40,110,0.4); backdrop-filter: blur(4px)"
        @click.self="chatStore.closeChatModal()">

        <div class="bg-white rounded-2xl shadow-2xl flex w-full max-w-4xl overflow-hidden"
          style="height: 80vh; max-height: 700px">

          <!-- ======== CHAP PANEL: Xonalar ======== -->
          <div class="w-80 flex-shrink-0 flex flex-col border-r border-gray-100 bg-gray-50/50">
            <!-- Sarlavha -->
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
              style="background: linear-gradient(90deg, #fdf0f8, #eff6ff)">
              <h3 class="font-bold text-base" style="color: #13286e">Chat</h3>
              <div class="flex items-center gap-1">
                <button @click="showNewChat = !showNewChat; chatStore.fetchAvailableUsers()"
                  class="p-1.5 rounded-lg transition-colors"
                  :style="showNewChat ? 'background:#E91E8C; color:white' : 'color:#6b7280'"
                  @mouseenter="e => { if(!showNewChat) e.currentTarget.style.background='#fdf0f8' }"
                  @mouseleave="e => { if(!showNewChat) e.currentTarget.style.background='transparent' }"
                  title="Yangi chat">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <button @click="chatStore.closeChatModal()"
                  class="p-1.5 rounded-lg transition-colors" style="color:#6b7280"
                  @mouseenter="e => e.currentTarget.style.background='#fee2e2'"
                  @mouseleave="e => e.currentTarget.style.background='transparent'">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Yangi chat - foydalanuvchi tanlash -->
            <div v-if="showNewChat" class="flex-1 flex flex-col overflow-hidden">
              <div class="p-2">
                <BaseSearch v-model="userSearchQuery" size="sm" full-width placeholder="Xodim qidirish..." />
              </div>
              <div class="flex-1 overflow-y-auto p-1">
                <button v-for="user in filteredUsers()" :key="user.id"
                  @click="startPrivateChat(user.id)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors hover:bg-pink-50">
                  <div class="relative flex-shrink-0">
                    <div v-if="user.image"
                      class="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                      <img :src="fileUrl + user.image" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style="background: linear-gradient(135deg, #E91E8C, #13286e)">
                      {{ getInitial(user.user_name) }}
                    </div>
                    <!-- Online indicator -->
                    <span v-if="chatStore.isUserOnline(user.id)"
                      class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                      style="background: #22c55e"></span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate" style="color:#13286e">{{ user.user_name }}</p>
                    <p class="text-[10px]" :style="chatStore.isUserOnline(user.id) ? 'color:#22c55e' : 'color:#9ca3af'">
                      {{ chatStore.isUserOnline(user.id) ? 'Online' : (user.role?.name || '') }}
                    </p>
                  </div>
                </button>
                <p v-if="!filteredUsers().length" class="text-center text-xs text-gray-400 py-6">Xodimlar topilmadi</p>
              </div>
            </div>

            <!-- Xonalar ro'yxati -->
            <template v-else>
              <div class="p-2">
                <BaseSearch v-model="searchQuery" size="sm" full-width placeholder="Chat qidirish..." />
              </div>
              <div class="flex-1 overflow-y-auto p-1">
                <!-- Loading -->
                <div v-if="chatStore.loadingRooms" class="flex justify-center py-8">
                  <div class="w-6 h-6 rounded-full border-2 border-pink-100 border-t-[#E91E8C] animate-spin"></div>
                </div>

                <button v-else v-for="room in filteredRooms()" :key="room.id"
                  @click="selectRoom(room.id)"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-0.5"
                  :style="chatStore.currentRoomId === room.id
                    ? 'background: linear-gradient(90deg, #fdf0f8, #f5e6ff); border: 1px solid #f0d0e8'
                    : 'border: 1px solid transparent'"
                  @mouseenter="e => { if(chatStore.currentRoomId !== room.id) e.currentTarget.style.background='#f9fafb' }"
                  @mouseleave="e => { if(chatStore.currentRoomId !== room.id) e.currentTarget.style.background='transparent' }">
                  <!-- Avatar -->
                  <div class="relative flex-shrink-0">
                    <div v-if="getRoomImage(room)"
                      class="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                      <img :src="fileUrl + getRoomImage(room)" class="w-full h-full object-cover" />
                    </div>
                    <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                      :style="room.type === 'general'
                        ? 'background: linear-gradient(135deg, #13286e, #1e3f96)'
                        : 'background: linear-gradient(135deg, #E91E8C, #13286e)'">
                      {{ room.type === 'general' ? '#' : getInitial(getRoomName(room)) }}
                    </div>
                    <!-- Online indicator -->
                    <span v-if="isRoomUserOnline(room)"
                      class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white"
                      style="background: #22c55e"></span>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-semibold truncate" style="color:#13286e">{{ getRoomName(room) }}</p>
                      <span class="text-[10px] flex-shrink-0 ml-1" style="color:#9ca3af">
                        {{ formatTime(room.lastMessage?.createdAt) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between mt-0.5">
                      <p class="text-xs truncate" style="color:#6b7280">
                        <template v-if="room.lastMessage">
                          <span v-if="room.type === 'general'" class="font-medium" style="color:#E91E8C">
                            {{ room.lastMessage.sender?.user_name }}:
                          </span>
                          {{ room.lastMessage.is_deleted ? 'Bu xabar o\'chirildi' : room.lastMessage.content }}
                        </template>
                        <span v-else style="color:#9ca3af">Hali xabar yo'q</span>
                      </p>
                      <!-- Unread badge -->
                      <span v-if="room.unreadCount > 0"
                        class="flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 ml-1"
                        style="background:#E91E8C">
                        {{ room.unreadCount > 99 ? '99+' : room.unreadCount }}
                      </span>
                    </div>
                  </div>
                </button>

                <p v-if="!chatStore.loadingRooms && !filteredRooms().length"
                  class="text-center text-xs text-gray-400 py-6">Chatlar topilmadi</p>
              </div>
            </template>
          </div>

          <!-- ======== O'NG PANEL: Xabarlar ======== -->
          <div class="flex-1 flex flex-col min-w-0 bg-white">
            <!-- Xona tanlangan -->
            <template v-if="chatStore.currentRoom">
              <!-- Xona sarlavhasi -->
              <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-3"
                style="background: linear-gradient(90deg, #fdf0f8, #eff6ff)">
                <div v-if="getRoomImage(chatStore.currentRoom)"
                  class="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                  <img :src="fileUrl + getRoomImage(chatStore.currentRoom)" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0"
                  :style="chatStore.currentRoom.type === 'general'
                    ? 'background: linear-gradient(135deg, #13286e, #1e3f96)'
                    : 'background: linear-gradient(135deg, #E91E8C, #13286e)'">
                  {{ chatStore.currentRoom.type === 'general' ? '#' : getInitial(getRoomName(chatStore.currentRoom)) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-bold text-sm truncate" style="color:#13286e">{{ getRoomName(chatStore.currentRoom) }}</p>
                  <p class="text-[10px]" :style="isRoomUserOnline(chatStore.currentRoom) ? 'color:#22c55e' : 'color:#E91E8C'">
                    <template v-if="chatStore.currentRoom.type === 'general'">
                      {{ `${chatStore.currentRoom.members?.length || 0} a'zo` }}
                    </template>
                    <template v-else>
                      {{ isRoomUserOnline(chatStore.currentRoom) ? 'Online' : 'Offline' }}
                    </template>
                  </p>
                </div>
              </div>

              <!-- Xabarlar -->
              <div ref="messagesContainer" @scroll="handleScroll"
                class="flex-1 overflow-y-auto px-4 py-3 space-y-1" style="background: #f8f9ff">

                <!-- Loading older -->
                <div v-if="loadingOlder" class="flex justify-center py-2">
                  <div class="w-5 h-5 rounded-full border-2 border-pink-100 border-t-[#E91E8C] animate-spin"></div>
                </div>

                <!-- Loading -->
                <div v-if="chatStore.loadingMessages && !chatStore.currentMessages.length"
                  class="flex justify-center items-center py-12">
                  <div class="w-8 h-8 rounded-full border-2 border-pink-100 border-t-[#E91E8C] animate-spin"></div>
                </div>

                <template v-else v-for="(msg, idx) in chatStore.currentMessages" :key="msg.id">
                  <!-- Kun ajratgichi -->
                  <div v-if="shouldShowDateSeparator(chatStore.currentMessages, idx)"
                    class="flex items-center justify-center py-2">
                    <span class="text-[10px] font-medium px-3 py-1 rounded-full" style="background:#e8ecf5; color:#6b7280">
                      {{ formatDateSeparator(msg.createdAt) }}
                    </span>
                  </div>

                  <!-- Xabar -->
                  <div class="flex mb-1"
                    :class="msg.sender_id === userStore.user?.id ? 'justify-end' : 'justify-start'"
                    @contextmenu="showContextMenu($event, msg)">
                    <div class="max-w-[75%] group">
                      <!-- Sender nomi (umumiy chatda) -->
                      <p v-if="chatStore.currentRoom.type === 'general' && msg.sender_id !== userStore.user?.id && !msg.is_deleted"
                        class="text-[10px] font-semibold mb-0.5 px-1" style="color:#E91E8C">
                        {{ msg.sender?.user_name }}
                      </p>

                      <div class="rounded-2xl px-3 py-2 relative shadow-sm"
                        :style="msg.sender_id === userStore.user?.id
                          ? 'background: linear-gradient(135deg, #E91E8C, #d4167a); color: white; border-bottom-right-radius: 6px'
                          : 'background: white; color: #1f2937; border: 1px solid #e5e7eb; border-bottom-left-radius: 6px'">

                        <!-- O'chirilgan xabar -->
                        <template v-if="msg.is_deleted">
                          <p class="text-sm italic" :style="msg.sender_id === userStore.user?.id ? 'opacity:0.7' : 'color:#9ca3af'">
                            Bu xabar o'chirildi
                          </p>
                        </template>

                        <!-- Tahrirlash rejimi -->
                        <template v-else-if="editingMessage === msg.id">
                          <textarea v-model="editContent" @keydown.enter.exact.prevent="saveEdit" @keydown.escape="cancelEdit"
                            class="w-full bg-white/20 rounded-lg px-2 py-1 text-sm resize-none focus:outline-none"
                            :style="msg.sender_id === userStore.user?.id ? 'color:white; border:1px solid rgba(255,255,255,0.3)' : 'color:#1f2937; border:1px solid #d1d5db'"
                            rows="2" />
                          <div class="flex gap-1 mt-1 justify-end">
                            <button @click="cancelEdit" class="text-[10px] px-2 py-0.5 rounded-md"
                              :style="msg.sender_id === userStore.user?.id ? 'background:rgba(255,255,255,0.2); color:white' : 'background:#f3f4f6; color:#6b7280'">
                              Bekor
                            </button>
                            <button @click="saveEdit" class="text-[10px] px-2 py-0.5 rounded-md font-medium"
                              :style="msg.sender_id === userStore.user?.id ? 'background:rgba(255,255,255,0.3); color:white' : 'background:#E91E8C; color:white'">
                              Saqlash
                            </button>
                          </div>
                        </template>

                        <!-- Oddiy xabar -->
                        <template v-else>
                          <p class="text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
                          <div class="flex items-center gap-1 mt-0.5 justify-end">
                            <span v-if="msg.is_edited" class="text-[9px] italic"
                              :style="msg.sender_id === userStore.user?.id ? 'opacity:0.6' : 'color:#9ca3af'">
                              tahrirlangan
                            </span>
                            <span class="text-[9px]"
                              :style="msg.sender_id === userStore.user?.id ? 'opacity:0.6' : 'color:#9ca3af'">
                              {{ formatTime(msg.createdAt) }}
                            </span>

                            <!-- Read receipts (faqat o'z xabarlari uchun) -->
                            <template v-if="msg.sender_id === userStore.user?.id && chatStore.readStatus[chatStore.currentRoomId]">
                              <!-- Private chat: ✓ yoki ✓✓ -->
                              <template v-if="chatStore.currentRoom?.type === 'private'">
                                <svg v-if="getMessageReadInfo(msg).isRead" class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M2 12l5 5L12 10" /><path d="M8 12l5 5L22 6" />
                                </svg>
                                <svg v-else class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5">
                                  <path d="M5 12l5 5L20 7" />
                                </svg>
                              </template>

                              <!-- General chat: ✓✓ + o'qiganlar soni -->
                              <template v-else-if="chatStore.currentRoom?.type === 'general'">
                                <span v-if="getMessageReadInfo(msg).readBy.length > 0"
                                  class="inline-flex items-center gap-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                                  @click="showReadersPopup($event, msg)">
                                  <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                                    :stroke="getMessageReadInfo(msg).isReadByAll ? '#34D399' : 'currentColor'"
                                    :style="getMessageReadInfo(msg).isReadByAll ? '' : 'opacity:0.5'"
                                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M2 12l5 5L12 10" /><path d="M8 12l5 5L22 6" />
                                  </svg>
                                  <span class="text-[9px] font-medium"
                                    :style="getMessageReadInfo(msg).isReadByAll ? 'color:#34D399' : 'opacity:0.5'">
                                    {{ getMessageReadInfo(msg).readBy.length }}
                                  </span>
                                </span>
                                <svg v-else class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5">
                                  <path d="M5 12l5 5L20 7" />
                                </svg>
                              </template>
                            </template>

                            <!-- readStatus yuklanmagan bo'lsa oddiy check -->
                            <template v-else-if="msg.sender_id === userStore.user?.id">
                              <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5">
                                <path d="M5 12l5 5L20 7" />
                              </svg>
                            </template>
                          </div>
                        </template>
                      </div>

                      <!-- Hover actions (o'z xabarlari uchun) -->
                      <div v-if="msg.sender_id === userStore.user?.id && !msg.is_deleted && editingMessage !== msg.id"
                        class="flex gap-0.5 justify-end mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="startEdit(msg)" class="p-1 rounded hover:bg-gray-100 transition-colors" title="Tahrirlash">
                          <svg class="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                        <button @click="handleDeleteMessage(msg)" class="p-1 rounded hover:bg-red-50 transition-colors" title="O'chirish">
                          <svg class="w-3 h-3 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Xabar yozish -->
              <div class="px-4 py-3 border-t border-gray-100">
                <div class="flex items-end gap-2">
                  <textarea
                    v-model="messageInput"
                    @keydown="handleKeyDown"
                    class="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                    style="max-height: 100px; min-height: 40px"
                    rows="1"
                    placeholder="Xabar yozing..."
                  ></textarea>
                  <button @click="handleSendMessage"
                    class="p-2.5 rounded-xl transition-all active:scale-95 flex-shrink-0"
                    :style="messageInput.trim() ? 'background: linear-gradient(135deg, #E91E8C, #d4167a); color: white; box-shadow: 0 2px 8px rgba(233,30,140,0.3)' : 'background: #f3f4f6; color: #9ca3af'"
                    :disabled="!messageInput.trim()">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </template>

            <!-- Xona tanlanmagan -->
            <div v-else class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style="background: linear-gradient(135deg, #fdf0f8, #eff6ff)">
                  <svg class="w-8 h-8" style="color:#E91E8C" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <p class="font-bold" style="color:#13286e">Suhbatni tanlang</p>
                <p class="text-xs mt-1" style="color:#9ca3af">Chap paneldan chat tanlang yoki yangi chat boshlang</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>

  <!-- Kontekst menu -->
  <Teleport to="body">
    <div v-if="contextMenu.show"
      class="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-36"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">
      <button @click="startEdit(contextMenu.message)"
        class="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors" style="color:#374151">
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
        </svg>
        Tahrirlash
      </button>
      <button @click="handleDeleteMessage(contextMenu.message)"
        class="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 transition-colors text-red-600">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
        O'chirish
      </button>
    </div>
  </Teleport>

  <!-- O'qiganlar popup (Telegram style) -->
  <Teleport to="body">
    <transition name="readers-popup">
      <div v-if="readersPopup.show"
        class="fixed z-[10000] bg-white rounded-xl shadow-2xl border border-gray-100 py-2 w-56"
        :style="{ top: (readersPopup.y - (readersPopup.readers.length * 40 + 44)) + 'px', left: readersPopup.x + 'px' }"
        @click.stop>
        <div class="px-3 pb-1.5 border-b border-gray-100 flex items-center gap-1.5">
          <svg class="w-4 h-4" style="color:#34D399" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12l5 5L12 10" /><path d="M8 12l5 5L22 6" />
          </svg>
          <span class="text-xs font-bold" style="color:#13286e">O'qiganlar ({{ readersPopup.readers.length }})</span>
        </div>
        <div class="max-h-48 overflow-y-auto py-1">
          <div v-for="reader in readersPopup.readers" :key="reader.userId"
            class="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-50 transition-colors">
            <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
              style="background: linear-gradient(135deg, #E91E8C, #13286e)">
              {{ reader.userName ? reader.userName.charAt(0).toUpperCase() : 'A' }}
            </div>
            <span class="text-xs font-medium truncate" style="color:#374151">{{ reader.userName }}</span>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.readers-popup-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.readers-popup-leave-active {
  transition: all 0.15s ease-in;
}
.readers-popup-enter-from,
.readers-popup-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.chat-modal-enter-active,
.chat-modal-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-modal-enter-from,
.chat-modal-leave-to {
  opacity: 0;
}
.chat-modal-enter-from > div,
.chat-modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
}
</style>
