import http from './http'

const BASE = '/upload-files'

export default {
  uploadFile: (data) =>
    http.post(`${BASE}/file`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delFile: (file) => http.delete(`${BASE}/del-file/${file}`),
  editorImage: (data) =>
    http.post(`${BASE}/editor-image`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delEditorImage: (filename) => http.delete(`${BASE}/editor-image/${filename}`),
}
