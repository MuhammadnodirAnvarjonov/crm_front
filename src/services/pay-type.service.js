import axios from "axios";
const END_POINT = "/pay-type";

class Service {
  all(filter) {
    let url = filter?.text ? '?text=' + filter.text : '';
    return axios.get(END_POINT + "/all" + url).then((res) => res);
  }

  create(data) {
    return axios.post(END_POINT + "/create", data).then((res) => res);
  }

  update(id, data) {
    return axios.patch(END_POINT + `/update/${id}`, data).then((res) => res);
  }

  getById(id) {
    return axios.get(END_POINT + `/getById/${id}`).then((res) => res);
  }

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then((res) => res);
  }
}
export default new Service();
