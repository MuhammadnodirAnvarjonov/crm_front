import axios from "axios";
const END_POINT = "/rasxod-section";

class Service {
    all(filter) {
        return axios.post(END_POINT + "/all", filter).then((res) => {
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

    getProductsBySection(section_id, branch_id) {
        return axios.get(END_POINT + "/productsBySection", { params: { section_id, branch_id } }).then(res => res);
    }

    delete(id) {
        return axios.delete(END_POINT + `/delete/${id}`).then((res) => {
            return res;
        });
    }
}

export default new Service();
