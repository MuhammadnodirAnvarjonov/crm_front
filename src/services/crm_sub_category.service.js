import axios from "axios";
const END_POINT = "/crm-sub-category";

class CrmSubCategoryService {
  all(filter = {}) {
    const params = new URLSearchParams();
    if (filter.text) params.append('text', filter.text);
    if (filter.category_id) params.append('category_id', filter.category_id);
    if (filter.is_active !== undefined) params.append('is_active', filter.is_active);
    const query = params.toString() ? '?' + params.toString() : '';
    return axios.get(END_POINT + "/all" + query).then(res => res || []);
  }

  getById(id) {
    return axios.get(END_POINT + `/getById/${id}`).then(res => res);
  }

  create(data) {
    return axios.post(END_POINT + "/create", data).then(res => res);
  }

  update(id, data) {
    return axios.patch(END_POINT + `/update/${id}`, data).then(res => res);
  }

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then(res => res);
  }
}

export default new CrmSubCategoryService();
