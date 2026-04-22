import axios from "axios";
const END_POINT = "/crm-appeals";

class CrmAppealService {
  all(filter = {}) {
    const params = new URLSearchParams();
    if (filter.text) params.append('text', filter.text);
    if (filter.status) params.append('status', filter.status);
    if (filter.priority) params.append('priority', filter.priority);
    if (filter.source) params.append('source', filter.source);
    if (filter.category_id) params.append('category_id', filter.category_id);
    if (filter.sub_category_id) params.append('sub_category_id', filter.sub_category_id);
    if (filter.user_id) params.append('user_id', filter.user_id);
    if (filter.branch_id) params.append('branch_id', filter.branch_id);
    if (filter.date_from) params.append('date_from', filter.date_from);
    if (filter.date_to) params.append('date_to', filter.date_to);
    const query = params.toString() ? '?' + params.toString() : '';
    return axios.get(END_POINT + "/all" + query).then(res => res || []);
  }

  stats(filter = {}) {
    const params = new URLSearchParams();
    if (filter.date_from) params.append('date_from', filter.date_from);
    if (filter.date_to) params.append('date_to', filter.date_to);
    const query = params.toString() ? '?' + params.toString() : '';
    return axios.get(END_POINT + "/stats" + query).then(res => res);
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

  changeStatus(id, status, resolution = null) {
    return axios.patch(END_POINT + `/status/${id}`, { status, resolution }).then(res => res);
  }

  delete(id) {
    return axios.delete(END_POINT + `/delete/${id}`).then(res => res.data);
  }
}

export default new CrmAppealService();
