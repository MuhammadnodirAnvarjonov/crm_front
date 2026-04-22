import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import Provider from './components/Provider.vue';
import Print from 'vue3-print-nb'
import { createI18n } from "vue-i18n";

import messages from "@intlify/unplugin-vue-i18n/messages";
import router from './router';
import naive from 'naive-ui';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { QuillEditor } from '@vueup/vue-quill'
import dayjs from 'dayjs'
import './assets/tailwind.css'
import './assets/main.css'
import AppIcon from "@/components/icons/AppIcon.vue";

import { openModal, closeModal } from "./directives/myModal";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "uz",
  fallbackLocale: "uz",
  availableLocales: ["uz", "ru", "uzk"],
  messages: messages,
});

const app = createApp(Provider);
app.use(createPinia());



import { useErrorStore } from './stores/errors'
import { useGlobalStore } from './stores/global'
const error_store = useErrorStore()
/// style templates


////////////////////////////////
let BASE_URL = import.meta.env.VITE_BASE_URL;
axios.defaults.baseURL = BASE_URL
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  config.headers['Authorization'] = `Bearer ` + localStorage.getItem('token');
  if (!localStorage.getItem('lang')) {
    config.headers['Accept-Language'] = 'uz'
  } else {
    config.headers['Accept-Language'] = localStorage.getItem('lang')
  }
  return config;
},
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

axios.interceptors.response.use(
  function (response) {
    if (response.data && response.data.error_code) {
      if (response.data.message === 'Network Error') {
        error_store.error_text = "Internet yoki baza bilan aloqa uzildi";
      } else if (response.data.error_code === 401) {
        error_store.error_text = response.data.message;
        // Queue-board sahifasida login sahifasiga redirect qilmaslik
        if (router.currentRoute.value.name !== 'queue-board') {
          localStorage.clear()
          router.push({ name: 'Login' });
        }
        return Promise.reject(response); // Reject the promise
      } else if (response.data.error_code === 404) {
        error_store.error_text = response.data.message;
        return Promise.reject(response); // Reject the promi
      } else if (response.data.error_code === 500) {
        error_store.error_text = response.data.message;
        if (response.data.message == "jwt expired" && router.currentRoute.value.name !== 'queue-board') {
          router.push({ name: 'Login' });
          localStorage.clear()
        }
      }
      //  else {
      //   console.log(response.data)
      //   error_store.error_text = response.data.message || "An unknown error occurred.";
      // }
      if (!response.data.success) {
        return Promise.reject(response);
      }
    }
    return response.data.data;
  },
  function (error) {
    if (error.message === 'Network Error') {
      error_store.error_text = "Internet yoki baza bilan aloqa uzildi";
    } else {
      error_store.error_text = "An error occurred. Please try again later.";
    }
    return Promise.reject(error); // Reject the promise
  }

);

app.use(router)
app.use(naive)
app.use(Print)
app.use(i18n);

app.directive("open-modal", openModal);
app.directive("close-modal", closeModal);
app.component('QuillEditor', QuillEditor)
app.component("AppIcon", AppIcon);
app.provide('dayJS', dayjs);
app.provide('fileUrl', `${BASE_URL}/uploads/`);
app.provide('static-file', `${BASE_URL}/staticFiles/`);
app.provide('base', `${BASE_URL}/product/`);

// Load dynamic data
const globalStore = useGlobalStore()
globalStore.fetchPayTypes()

app.mount('#app')
