import axios from "axios";
const END_POINT = "/upload-files";

class Service {

  delFile(file) {
    return axios.delete(END_POINT + `/del-file/${file}`).then((res) => {
      return res;
    });
  }


  uploadFile(data) {
    return axios
      .post(END_POINT + '/file', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        return res
      })
  }

}
export default new Service();
