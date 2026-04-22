import axios from "axios";
const END_POINT = "/report";

class ReportService {
  dashboard(filter) {
    return axios.get(END_POINT + "/dashboard", { params: filter }).then((res) => res);
  }
  direct(filter) {
    return axios.get(END_POINT + "/direct", { params: filter }).then((res) => res);
  }
  kassa(filter) {
    return axios.get(END_POINT + "/kassa", { params: filter }).then((res) => res);
  }
  service(filter) {
    return axios.get(END_POINT + "/service", { params: filter }).then((res) => res);
  }
  user(filter) {
    return axios.get(END_POINT + "/user", { params: filter }).then((res) => res);
  }
  crm(filter) {
    return axios.get(END_POINT + "/crm", { params: filter }).then((res) => res);
  }
  registerStats(filter) {
    return axios.get(END_POINT + "/register-stats", { params: filter }).then((res) => res);
  }
  registrationFlow(filter) {
    return axios.get(END_POINT + "/registration-flow", { params: filter }).then((res) => res);
  }
}

export default new ReportService();
