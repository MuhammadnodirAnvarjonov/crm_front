import { defineStore } from 'pinia';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    selectedPatient: null,
  }),

  actions: {
    setPatient(patient) {
      this.selectedPatient = patient ? { ...patient } : null;
    },

    updatePatient(data) {
      if (this.selectedPatient) {
        Object.assign(this.selectedPatient, data);
      }
    },

    clearPatient() {
      this.selectedPatient = null;
    },
  },
});
