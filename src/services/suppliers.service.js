import axios from "axios";
const END_POINT = "/supplier";

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

    delete(id) {
        return axios.delete(END_POINT + `/delete/${id}`).then((res) => {
            return res;
        });
    }
}

export default new Service();
