import serviceAccount from '../services/account.js';

export const useDashboardStore = Pinia.defineStore('dashboard', {
    state() {
      return {
        dashboard: {
          week: [],
          month: [],
          year: [],
          ten_years: [],
        }
      }
    },
    actions: {
      async getDashboard(year = false, ten_years = false) {
        const dashboard = await serviceAccount.getDashboard(year, ten_years);

        this.dashboard = dashboard;
      }
    }
});