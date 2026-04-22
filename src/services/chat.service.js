import axios from "axios";
const END_POINT = "/chat";

class ChatService {
  getRooms() {
    return axios.get(END_POINT + "/rooms");
  }

  getMessages(roomId, page = 1, limit = 30) {
    return axios.get(END_POINT + `/rooms/${roomId}/messages`, { params: { page, limit } });
  }

  getOrCreatePrivateRoom(userId) {
    return axios.post(END_POINT + "/rooms/private", { userId });
  }

  getUnreadTotal() {
    return axios.get(END_POINT + "/unread-total");
  }

  getAvailableUsers() {
    return axios.get(END_POINT + "/users");
  }

  getReadStatus(roomId) {
    return axios.get(END_POINT + `/rooms/${roomId}/read-status`);
  }

  ensureGeneralRoom() {
    return axios.post(END_POINT + "/rooms/general/ensure");
  }
}

export default new ChatService();
