export default {
    async getStocks() {
        const response = await fetch('/api/v1/stocks');

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    },

    async getStock(id) {
        const response = await fetch(`/api/v1/stocks/${id}`);

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },

    async getPortfolio() {
        const response = await fetch('/api/v1/portfolio');

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    }
}