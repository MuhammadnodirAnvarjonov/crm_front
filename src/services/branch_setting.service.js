import axios from "axios";
const EP = "/branch-settings";

class BranchSettingService {
  // Sozlama kalitlari (definitions)
  getDefinitions()             { return axios.get(`${EP}/definitions`) }
  createDefinition(data)       { return axios.post(`${EP}/definitions`, data) }
  updateDefinition(id, data)   { return axios.patch(`${EP}/definitions/${id}`, data) }
  deleteDefinition(id)         { return axios.delete(`${EP}/definitions/${id}`) }

  // categoryId = null → umumiy (0 yuboriladi)
  getOne(branchId, categoryId) {
    return axios.get(`${EP}/branch/${branchId}/category/${categoryId ?? 0}`)
  }
  getByBranch(branchId, categoryId = null) {
    const params = categoryId ? `?category_id=${categoryId}` : ''
    return axios.get(`${EP}/branch/${branchId}${params}`)
  }
  create(payload)                                     { return axios.post(`${EP}`, payload) }
  update(branchId, categoryId, settings) {
    return axios.patch(`${EP}/branch/${branchId}/category/${categoryId ?? 0}`, { settings })
  }
  remove(branchId, categoryId) {
    return axios.delete(`${EP}/branch/${branchId}/category/${categoryId ?? 0}`)
  }
}

export default new BranchSettingService();
