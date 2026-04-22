import axios from "axios";
const END_POINT = "/series";

class Service {
    lastPrice(product_id, branch_id) {
        return axios.get(END_POINT + "/lastPrice", { params: { product_id, branch_id } }).then((res) => {
            return res;
        });
    }

    groupedByProduct(branch_id) {
        return axios.get(END_POINT + "/groupedByProduct", { params: { branch_id } }).then((res) => {
            return res;
        });
    }
}

export default new Service();
