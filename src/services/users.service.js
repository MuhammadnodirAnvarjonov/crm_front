import axios from "axios";
const END_POINT = "/users";
class Serviceaxios {
  all(filter = {}) {
    return axios.get(END_POINT + "/all", { params: filter });
  }
  getByQueue() {
    return axios.get(END_POINT + `/by_queue`);
  }

  getByBranch(branchId) {
    return axios.get(END_POINT + `/byBranch/${branchId}`);
  }

  getActiveByBranch(branchId) {
    return axios.get(END_POINT + `/activeByBranch/${branchId}`);
  }

  create(data) {
    return axios.post(END_POINT + "/create", data);
  }

  update(id, data) {
    return axios.patch(END_POINT + `/update/${id}`, data);
  }

  updateStatus(id) {
    return axios.patch(END_POINT + `/update-status/${id}`);
  }

  getOne(id) {
    return axios.get(END_POINT + `/getByUserId/${id}`);
  }

  getCurrentUser() {
    return axios.get(END_POINT + `/getUser`);
  }

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`);
  }
}

export default new Serviceaxios();