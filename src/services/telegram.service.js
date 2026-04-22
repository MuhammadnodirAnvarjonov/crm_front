import axios from "axios";
const END_POINT = "/telegram";

class TelegramService {
  sendServicePdf(data) {
    return axios.post(END_POINT + "/send-service-pdf", data).then((res) => res);
  }

  sendAllServicesPdf(data) {
    return axios.post(END_POINT + "/send-all-services-pdf", data).then((res) => res);
  }

  checkChatId(patientId) {
    return axios.get(END_POINT + `/check-chat-id/${patientId}`).then((res) => res);
  }
}

export default new TelegramService();
