import axios from "axios";
const END_POINT = "/face-id";

class FaceidService {
  report(filter = {}) {
    return axios.get(END_POINT + "/report", { params: filter }).then((res) => {
      return res;
    });
  }

  all(filter = {}) {
    return axios.get(END_POINT + "/all", { params: filter }).then((res) => {
      return res;
    });
  }

  getById(id) {
    return axios.get(END_POINT + `/getById/${id}`).then((res) => {
      return res;
    });
  }

  syncEmployees() {
    return axios.post(END_POINT + "/sync-employees");
  }

  syncOneEmployee(userId) {
    return axios.post(END_POINT + `/sync-employee/${userId}`);
  }

  deleteEmployee(userId) {
    return axios.delete(END_POINT + `/delete-employee/${userId}`);
  }
}
export default new FaceidService();
