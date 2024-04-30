export default {
    async getStockOffers(stockId, isOtherUsers = false) {
        const path = `/api/v1/stocks/${stockId}/offers${isOtherUsers ? '?other_users=true' : ''}`;
        const response = await fetch(path);

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    },

    async getStockOffer(stockId, offerId) {
        const response = await fetch(`/api/v1/stocks/${stockId}/offers/${offerId}`);

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },

    async createStockOffer(stockId, offer) {
        if (!offer.price || !offer.quantity) {
            throw new Error('Offer price and quantity are required.');
        }

        const response = await fetch(`/api/v1/stocks/${stockId}/offers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(offer)
        });

        if (response.status !== 201) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },

    async updateStockOffer(stockId, offerId, offer) {
        if (!offer.price && !offer.quantity && !offer.canceled) {
            throw new Error('Offer price, quantity or canceled status are required.');
        }

        const response = await fetch(`/api/v1/stocks/${stockId}/offers/${offerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(offer)
        });

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },

    async cancelStockOffer(stockId, offerId) {
        const offer = {
            canceled: true,
        }

        await this.updateStockOffer(stockId, offerId, offer);
    },

    async deleteStockOffer(stockId, offerId) {
        const response = await fetch(`/api/v1/stocks/${stockId}/offers/${offerId}`, {
            method: 'DELETE'
        });

        if (response.status !== 204) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }
    }
}