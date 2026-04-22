import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import ChatService from '@/services/chat.service';

export const useChatStore = defineStore('chat', () => {
  // State
  const rooms = ref([]);
  const currentRoomId = ref(null);
  const messages = ref({});  // { roomId: [messages] }
  const totalUnread = ref(0);
  const chatModalOpen = ref(false);
  const availableUsers = ref([]);
  const loadingRooms = ref(false);
  const loadingMessages = ref(false);
  const messagePagination = ref({}); // { roomId: { page, totalPages, total } }
  const readStatus = ref({}); // { roomId: [{ userId, userName, image, lastReadAt }] }
  const onlineUsers = ref(new Set()); // Online foydalanuvchilar ID lari

  // Computed
  const currentRoom = computed(() =>
    rooms.value.find(r => r.id === currentRoomId.value)
  );

  const currentMessages = computed(() =>
    messages.value[currentRoomId.value] || []
  );

  const sortedRooms = computed(() =>
    [...rooms.value].sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return new Date(bTime) - new Date(aTime);
    })
  );

  // Actions
  async function fetchRooms() {
    loadingRooms.value = true;
    try {
      const data = await ChatService.getRooms();
      rooms.value = data || [];
    } catch (e) {
      // silent
    } finally {
      loadingRooms.value = false;
    }
  }

  async function fetchMessages(roomId, page = 1) {
    loadingMessages.value = true;
    try {
      const data = await ChatService.getMessages(roomId, page);
      if (page === 1) {
        messages.value[roomId] = data.messages || [];
      } else {
        // Eski xabarlarni boshiga qo'shish
        messages.value[roomId] = [...(data.messages || []), ...(messages.value[roomId] || [])];
      }
      messagePagination.value[roomId] = {
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      };

      // Bu xona uchun unread ni 0 ga o'rnatish
      const room = rooms.value.find(r => r.id === roomId);
      if (room) {
        totalUnread.value = Math.max(0, totalUnread.value - (room.unreadCount || 0));
        room.unreadCount = 0;
      }
    } catch (e) {
      // silent
    } finally {
      loadingMessages.value = false;
    }
  }

  async function loadOlderMessages(roomId) {
    const pagination = messagePagination.value[roomId];
    if (!pagination || pagination.page >= pagination.totalPages) return false;
    await fetchMessages(roomId, pagination.page + 1);
    return true;
  }

  async function fetchUnreadTotal() {
    try {
      const data = await ChatService.getUnreadTotal();
      totalUnread.value = data?.total || 0;
    } catch (e) {
      // silent
    }
  }

  async function fetchAvailableUsers() {
    try {
      const data = await ChatService.getAvailableUsers();
      availableUsers.value = data || [];
    } catch (e) {
      // silent
    }
  }

  async function openPrivateChat(userId) {
    try {
      const room = await ChatService.getOrCreatePrivateRoom(userId);
      // Xonalar ro'yxatiga qo'shish (agar yo'q bo'lsa)
      if (!rooms.value.find(r => r.id === room.id)) {
        rooms.value.unshift(room);
      }
      selectRoom(room.id);
      return room;
    } catch (e) {
      // silent
    }
  }

  async function ensureGeneralRoom() {
    try {
      await ChatService.ensureGeneralRoom();
    } catch (e) {
      // silent
    }
  }

  async function fetchReadStatus(roomId) {
    try {
      const data = await ChatService.getReadStatus(roomId);
      readStatus.value[roomId] = data || [];
    } catch (e) {
      // silent
    }
  }

  function selectRoom(roomId) {
    currentRoomId.value = roomId;
  }

  function openChatModal(targetRoomId = null) {
    chatModalOpen.value = true;
    if (targetRoomId) {
      currentRoomId.value = targetRoomId;
    }
  }

  function closeChatModal() {
    chatModalOpen.value = false;
  }

  // Socket event handlers
  function handleNewMessage(data) {
    const roomId = data.room_id;

    // Xabarlar ro'yxatiga qo'shish (duplikatsiyani tekshirish)
    if (!messages.value[roomId]) {
      messages.value[roomId] = [];
    }
    const exists = messages.value[roomId].find(m => m.id === data.id);
    if (!exists) {
      messages.value[roomId].push(data);
    }

    // Xona ro'yxatida lastMessage ni yangilash
    const room = rooms.value.find(r => r.id === roomId);
    if (room) {
      room.lastMessage = data;
    }
  }

  function handleMessageEdited(data) {
    const roomId = data.room_id;
    const msgs = messages.value[roomId];
    if (!msgs) return;
    const idx = msgs.findIndex(m => m.id === data.id);
    if (idx !== -1) {
      msgs[idx] = data;
    }
  }

  function handleMessageDeleted(data) {
    const { messageId, roomId } = data;
    const msgs = messages.value[roomId];
    if (!msgs) return;
    const idx = msgs.findIndex(m => m.id === messageId);
    if (idx !== -1) {
      msgs[idx].is_deleted = true;
    }
  }

  function handleNotification(data) {
    // O'qilmagan sonini oshirish
    totalUnread.value += 1;

    const room = rooms.value.find(r => r.id === data.roomId);
    if (room) {
      room.unreadCount = (room.unreadCount || 0) + 1;
      room.lastMessage = {
        content: data.contentPreview,
        sender: { id: data.senderId, user_name: data.senderName },
        createdAt: new Date().toISOString(),
      };
    }
  }

  function handleUnreadUpdate(data) {
    const room = rooms.value.find(r => r.id === data.roomId);
    if (room) {
      const diff = (room.unreadCount || 0) - data.unreadCount;
      room.unreadCount = data.unreadCount;
      totalUnread.value = Math.max(0, totalUnread.value - diff);
    }
  }

  // Online status handlers
  function handleOnlineList(data) {
    onlineUsers.value = new Set(data.userIds);
  }

  function handleUserOnline(data) {
    onlineUsers.value = new Set([...onlineUsers.value, data.userId]);
  }

  function handleUserOffline(data) {
    const updated = new Set(onlineUsers.value);
    updated.delete(data.userId);
    onlineUsers.value = updated;
  }

  function isUserOnline(userId) {
    return onlineUsers.value.has(userId);
  }

  // Read status yangilanganda (boshqa foydalanuvchi o'qiganda)
  function handleReadStatusUpdate(data) {
    const { roomId, userId, userName, lastReadAt } = data;
    if (!readStatus.value[roomId]) {
      readStatus.value[roomId] = [];
    }
    const existing = readStatus.value[roomId].find(r => r.userId === userId);
    if (existing) {
      existing.lastReadAt = lastReadAt;
      existing.userName = userName;
    } else {
      readStatus.value[roomId].push({ userId, userName, image: null, lastReadAt });
    }
  }

  return {
    rooms, currentRoomId, messages, totalUnread, chatModalOpen,
    availableUsers, loadingRooms, loadingMessages, messagePagination, readStatus,
    onlineUsers,
    currentRoom, currentMessages, sortedRooms,
    fetchRooms, fetchMessages, loadOlderMessages, fetchUnreadTotal,
    fetchAvailableUsers, fetchReadStatus, openPrivateChat, ensureGeneralRoom,
    selectRoom, openChatModal, closeChatModal,
    handleNewMessage, handleMessageEdited, handleMessageDeleted,
    handleNotification, handleUnreadUpdate, handleReadStatusUpdate,
    handleOnlineList, handleUserOnline, handleUserOffline, isUserOnline,
  };
});
