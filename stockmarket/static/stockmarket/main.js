import MainLayout from './layouts/MainLayout.js';
const { createPinia } = Pinia;

if (document.querySelector('#app')) {
    const pinia = createPinia();
    Vue.createApp(MainLayout).use(pinia).mount('#app');
}