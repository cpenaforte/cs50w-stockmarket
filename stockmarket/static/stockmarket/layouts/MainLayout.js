import LeftNav from '../components/LeftNav.js';
import DashboardPage from '../pages/DashboardPage.js';
import StocksPage from '../pages/StocksPage.js';
import PortfolioPage from '../pages/PortfolioPage.js';

export default {
    components: {
      LeftNav,
      DashboardPage,
      StocksPage,
      PortfolioPage,
    },
    data() {
      return {
        currentPage: 'dashboard',
      }
    },
    async created() {
      window.onpopstate = async () => {
        this.currentPage = window.location.pathname.slice(1);
      }

      this.currentPage = document.querySelector('#app').dataset.startpage;
      window.history.pushState({}, this.currentPage, this.currentPage.toLowerCase());
    },
    methods: {
      setPage(page) {
        window.history.pushState({}, page, page.toLowerCase());

        window.dispatchEvent(new Event('popstate'));
      }
    },
    template: `
      <div id="main-layout" class="d-flex w-100 h-100 bg-light">
        <LeftNav
          :currentPage="currentPage"
          @page-change="setPage"
        />
        <template v-if="currentPage === 'dashboard'">
          <DashboardPage
            @page-change="setPage"
          />
        </template>
        <template v-if="currentPage === 'stocks'">
          <StocksPage
            @page-change="setPage"
          />
        </template>
        <template v-if="currentPage === 'portfolio'">
          <PortfolioPage
            @page-change="setPage"
          />
        </template>
      </div>
    `
}