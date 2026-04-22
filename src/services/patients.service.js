import axios from "axios";
const END_POINT = "/patients";

class Service {
  all(filter) {
    let url = filter?.text ? '?text=' + filter.text : '';
    if (filter?.user_id) url += (url ? '&' : '?') + 'user_id=' + filter.user_id;
    return axios.get(END_POINT + "/all" + url).then((res) => {
      return res;
    });
  }
  search(params) {
    // params = { search: "Ali", page: 1, per_page: 10 }
    return axios.get(END_POINT + "/search", {
      params: params
    }).then((res) => {
      return res.data; // Backenddan kelgan toza ma'lumotni qaytarish
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

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then((res) => {
      return res;
    });
  }



}
export default new Service();
