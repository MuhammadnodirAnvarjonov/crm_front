import axios from "axios";
const END_POINT = "/work-session";

class WorkSessionService {
  getActive(filter = {}) {
    return axios.get(END_POINT + "/active", { params: filter });
  }

  myStatus() {
    return axios.get(END_POINT + "/my-status");
  }

  start(data) {
    return axios.post(END_POINT + "/start", data);
  }

  end(data) {
    return axios.post(END_POINT + "/end", data);
  }
}

export default new WorkSessionService();
