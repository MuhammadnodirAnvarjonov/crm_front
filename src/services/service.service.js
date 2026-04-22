import axios from "axios";
const END_POINT = "/service";

class Service {
  all(filter = {}) {
    return axios.get(END_POINT + "/all", { params: filter }).then((res) => {
      return res;
    });
  }
  getByServiceCategoryId(params = {}) {
    let url = END_POINT + "/get-by-category";
    const q = [];
    if (params.section_id) q.push('section_id=' + params.section_id);
    if (params.user_id) q.push('user_id=' + params.user_id);
    if (q.length) url += '?' + q.join('&');
    return axios.get(url).then((res) => {
      return res;
    });
  }
  create(data) {
    return axios.post(END_POINT + "/create", data).then((res) => {
      return res;
    });
  }


  update(id, data) {
    return axios.patch(END_POINT + `/update/${id}`, data).then((res) => {
      return res;
    });
  }

  getById(id) {
    return axios.get(END_POINT + `/getById/${id}`).then((res) => {
      return res;
    });
  }

  migrateUsers() {
    return axios.post(END_POINT + "/migrate-users").then((res) => res);
  }

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then((res) => {
      return res;
    });
  }

}
export default new Service();
