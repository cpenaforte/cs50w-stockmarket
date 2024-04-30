import serviceStocks from '../services/stocks.js';

export const useStocksStore = Pinia.defineStore('stocks', {
    state() {
      return {
        stocks: [],
      }
    },
    actions: {
      async getStocks() {
        const stocks = await serviceStocks.getStocks();

        this.stocks = stocks;
      }
    }
});