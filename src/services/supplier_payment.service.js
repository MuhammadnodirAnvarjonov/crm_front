import axios from "axios";
const END_POINT = "/supplier-payment";

class Service {
  all(filter) {
    return axios.get(END_POINT + "/all", { params: filter }).then((res) => res);
  }
  stats(filter) {
    return axios.get(END_POINT + "/stats", { params: filter }).then((res) => res);
  }
  getById(id) {
    return axios.get(END_POINT + `/getById/${id}`).then((res) => res);
  }
  create(data) {
    return axios.post(END_POINT + "/create", data).then((res) => res);
  }
  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then((res) => res);
  }
}
export default new Service();
