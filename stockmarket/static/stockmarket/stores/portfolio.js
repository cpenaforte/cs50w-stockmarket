import serviceStocks from '../services/stocks.js';

export const usePortfolioStore = Pinia.defineStore('portfolio', {
    state() {
      return {
        userStocks: [],
      }
    },
    actions: {
      async getPortfolio() {
        const userStocks = await serviceStocks.getPortfolio();

        this.userStocks = userStocks.map(userStock => {
            return {
                ...userStock,
                value: userStock.stock.last_price * userStock.quantity
            };
        });
      }
    }
});