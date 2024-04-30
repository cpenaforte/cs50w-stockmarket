export default {
    async getUser() {
        const response = await fetch('/api/v1/account');

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    },

    async getDashboard(year = false, ten_years = false) {
        const path = `/api/v1/dashboard${ten_years ? '?ten_years=true' : ''}${year ? '?year=true' : ''}`;
        const response = await fetch(path);

        if (response.status !== 200) {
            const body = await response.json();
            throw new Error(body.error || `An error has occured: ${response.status}`);
        }

        return response.json() || [];
    }
}