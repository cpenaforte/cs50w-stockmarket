import serviceAccount from '../services/account.js';

export const useAccountStore = Pinia.defineStore('account', {
    state() {
      return {
        user: {},
      }
    },
    actions: {
      async getUser() {
        const user = await serviceAccount.getUser();

        this.user = user;
      }
    }
});