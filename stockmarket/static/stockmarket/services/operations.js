export default {
    async getUserOperations() {
        const response = await fetch('/api/v1/operations');

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    },

    async getUserOperation(id) {
        const response = await fetch(`/api/v1/operations/${id}`);

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },

    async createOperation(operation) {
        if (!operation.offer_id) {
            throw new Error('Offer ID is required.');
        }

        const response = await fetch('/api/v1/operations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(operation)
        });

        if (response.status !== 201) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json();
    },
}