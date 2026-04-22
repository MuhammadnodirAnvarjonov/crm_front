import { useSocket } from './useSocket';
import { useChatStore } from '@/stores/chat';
import { useUserStore } from '@/stores/user';
import { notify } from '@/utils/notificationService';

export function useChat() {
  const { socket, on, off } = useSocket();
  const chatStore = useChatStore();
  const userStore = useUserStore();

  // --- Socket event listeners ---
  function onNewMessage(data) {
    chatStore.handleNewMessage(data);
  }

  function onMessageEdited(data) {
    chatStore.handleMessageEdited(data);
  }

  function onMessageDeleted(data) {
    chatStore.handleMessageDeleted(data);
  }

  function onNotification(data) {
    // Faqat o'zimiz yubormaganimiz uchun
    if (data.senderId === userStore.user?.id) return;

    // Agar chat ochiq va shu xonada bo'lsa, notification qo'shmaymiz
    if (chatStore.chatModalOpen && chatStore.currentRoomId === data.roomId) return;

    chatStore.handleNotification(data);

    // Ekranning o'ng yuqori burchagida chiroyli chat toast
    notify({
      type: 'info',
      variant: 'chat',
      message: data.senderName,
      meta: data.contentPreview,
      duration: 5000,
      position: 'top-right',
      onClick: () => {
        chatStore.openChatModal(data.roomId);
      },
    });
  }

  function onUnreadUpdate(data) {
    chatStore.handleUnreadUpdate(data);
  }

  function onUserTyping(data) {
    // Typing indicator uchun (komponentda ishlatiladi)
  }

  function onReadStatusUpdate(data) {
    chatStore.handleReadStatusUpdate(data);
  }

  // Online status handlers
  function onOnlineList(data) {
    chatStore.handleOnlineList(data);
  }

  function onUserOnline(data) {
    chatStore.handleUserOnline(data);
  }

  function onUserOffline(data) {
    chatStore.handleUserOffline(data);
  }

  // --- Socket actions (emit) ---
  function sendMessage(roomId, content) {
    socket.emit('chat:sendMessage', { roomId, content });
  }

  function editMessage(messageId, content) {
    socket.emit('chat:editMessage', { messageId, content });
  }

  function deleteMessage(messageId) {
    socket.emit('chat:deleteMessage', { messageId });
  }

  function joinRoom(roomId) {
    socket.emit('chat:join', { roomId });
  }

  function leaveRoom(roomId) {
    socket.emit('chat:leave', { roomId });
  }

  function sendTyping(roomId) {
    socket.emit('chat:typing', { roomId });
  }

  function markRead(roomId) {
    socket.emit('chat:markRead', { roomId });
  }

  // --- Listenerlarni o'rnatish ---
  function initChatListeners() {
    on('chat:newMessage', onNewMessage);
    on('chat:messageEdited', onMessageEdited);
    on('chat:messageDeleted', onMessageDeleted);
    on('chat:notification', onNotification);
    on('chat:unreadUpdate', onUnreadUpdate);
    on('chat:userTyping', onUserTyping);
    on('chat:readStatusUpdate', onReadStatusUpdate);
    on('user:onlineList', onOnlineList);
    on('user:online', onUserOnline);
    on('user:offline', onUserOffline);
  }

  function cleanupChatListeners() {
    off('chat:newMessage', onNewMessage);
    off('chat:messageEdited', onMessageEdited);
    off('chat:messageDeleted', onMessageDeleted);
    off('chat:notification', onNotification);
    off('chat:unreadUpdate', onUnreadUpdate);
    off('chat:userTyping', onUserTyping);
    off('chat:readStatusUpdate', onReadStatusUpdate);
    off('user:onlineList', onOnlineList);
    off('user:online', onUserOnline);
    off('user:offline', onUserOffline);
  }

  return {
    initChatListeners,
    cleanupChatListeners,
    sendMessage,
    editMessage,
    deleteMessage,
    joinRoom,
    leaveRoom,
    sendTyping,
    markRead,
  };
}
