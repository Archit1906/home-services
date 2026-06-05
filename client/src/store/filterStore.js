import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  jobFilters: {
    serviceType: '',
    minBudget: '',
    isEmergency: '',
    city: '',
    search: ''
  },
  workerFilters: {
    skills: '',
    minExperience: '',
    verificationStatus: '',
    city: ''
  },

  setJobFilter: (key, value) => {
    set((state) => ({
      jobFilters: {
        ...state.jobFilters,
        [key]: value
      }
    }));
  },

  setWorkerFilter: (key, value) => {
    set((state) => ({
      workerFilters: {
        ...state.workerFilters,
        [key]: value
      }
    }));
  },

  resetJobFilters: () => {
    set({
      jobFilters: {
        serviceType: '',
        minBudget: '',
        isEmergency: '',
        city: '',
        search: ''
      }
    });
  },

  resetWorkerFilters: () => {
    set({
      workerFilters: {
        skills: '',
        minExperience: '',
        verificationStatus: '',
        city: ''
      }
    });
  }
}));
