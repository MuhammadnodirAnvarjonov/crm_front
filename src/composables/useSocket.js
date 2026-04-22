import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:4004/api/v1';
// URL dan /api/v1 yoki /api qismini olib tashlash (socket root ga ulanadi)
const SOCKET_URL = BASE_URL.replace(/\/api(\/v\d+)?\/?$/, '');

let socket = null;
const isConnected = ref(false);

function getSocket() {
  if (!socket) {
    const token = localStorage.getItem('token');
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      auth: { token },
    });

    socket.on('connect', () => {
      isConnected.value = true;
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
    });
  }
  return socket;
}

// Visibility change va beforeunload handlerlar
let visibilityHandlerAttached = false;

function attachVisibilityHandlers() {
  if (visibilityHandlerAttached) return;
  visibilityHandlerAttached = true;

  // Tab o'zgarganda (boshqa sahifaga o'tganda)
  document.addEventListener('visibilitychange', () => {
    if (!socket) return;
    if (document.hidden) {
      socket.emit('user:away');
    } else {
      socket.emit('user:active');
    }
  });

  // Brauzer/tab yopilganda
  window.addEventListener('beforeunload', () => {
    if (socket) {
      socket.disconnect();
    }
  });
}

export function useSocket() {
  const s = getSocket();

  if (!s.connected) {
    s.connect();
  }

  attachVisibilityHandlers();

  function on(event, callback) {
    s.on(event, callback);
  }

  function off(event, callback) {
    s.off(event, callback);
  }

  function onCleanup(event, callback) {
    s.on(event, callback);
    onUnmounted(() => {
      s.off(event, callback);
    });
  }

  return {
    socket: s,
    isConnected,
    on,
    off,
    onCleanup
  };
}

// Logout / xodim almashtirish uchun
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected.value = false;
  }
}

// Yangi token bilan qayta ulanish
export function reconnectSocket() {
  disconnectSocket();
  // Keyingi getSocket() chaqiruvida yangi token bilan yaratiladi
}
