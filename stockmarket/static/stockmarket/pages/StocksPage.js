import serviceOffers from '../services/offers.js';
import serviceOperations from '../services/operations.js';

const { mapState, mapActions } = Pinia;
import { useAccountStore } from '../stores/account.js';
import { useStocksStore } from '../stores/stocks.js';
import { usePortfolioStore } from '../stores/portfolio.js';
import { useDashboardStore } from '../stores/dashboard.js';

import Loading from '../components/Loading.js';
import ConfirmModal from '../components/ConfirmModal.js';
import CommandModal from '../components/CommandModal.js';
import Snackbar from '../components/Snackbar.js';

export default {
    components: {
      Loading,
      ConfirmModal,
      CommandModal,
      Snackbar,
    },
    data() {
      return {
        selectedStock: {},
        selectedStockOffers: [],

        offerToRedeem: {},

        requesting: {
          stocks: true,
          stockOffers: true,
        }
      }
    },
    computed: {
      ...mapState(useAccountStore, ['user']),
      ...mapState(useStocksStore, ['stocks']),

      windowWidth() {
        return window.innerWidth;
      },
    },
    methods: {
      ...mapActions(useAccountStore, ['getUser']),
      ...mapActions(useStocksStore, ['getStocks']),
      ...mapActions(usePortfolioStore, ['getPortfolio']),
      ...mapActions(useDashboardStore, ['getDashboard']),

      goTo(page) {
        this.$emit('page-change', page);
      },

      async loadUser(force= false) {
        try {
          if (!force && this.user?.id) return;
  
          await this.getUser();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting user info.');
        }
      },

      async loadStocks(force = false) {
        try{
          if (!force && this.stocks.length) return;

          await this.getStocks();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting Stocks.');
        }
      },

      async loadPortfolio(force = false) {
        try{
          if (!force && this.stocks.length) return;

          await this.getPortfolio();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting portfolio.');
        }
      },

      async loadDashboard(force = false) {
        try{
          if (!force) return;

          await this.getDashboard();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting dashboard values.');
        }
      },
      
      async openStockBuy(stock) {
        if (!stock?.id) return;

        this.selectedStock = stock;

        await this.getSelectedStockOffers();

        if (!this.selectedStock?.id) return;

        this.$refs?.offersModal.show();
      },

      async getSelectedStockOffers() {
        try {
          if (!this.selectedStock?.id) {
            throw new Error('Invalid Stock.');
          }

          const offers = await serviceOffers.getStockOffers(this.selectedStock?.id, true);
  
          this.selectedStockOffers = offers.filter(offer => offer.quantity > 0 && offer.price > 0 && offer.sold === false);
        } catch (error) {
          console.error(error);

          this.clearSelectedStock();
          this.$refs?.offersModal.hide();
          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting Stock Offers.');
        }
      },

      openConfirmBuyModal(offer) {
        if (!offer?.id) return;

        this.offerToRedeem = offer;

        this.$refs?.confirmBuyModal.show();
      },

      async buyStock() {
        try {
          if (!this.offerToRedeem?.id) {
            throw new Error('Invalid Offer.');
          }

          const body = {
            offer_id: this.offerToRedeem.id,
          }

          await serviceOperations.createOperation(body);

          this.clearSelectedStock();
          this.$refs?.offersModal.hide();
          await this.loadUser(true);
          await this.loadStocks(true);
          await this.loadPortfolio(true);
          await this.loadDashboard(true);

          this.$refs?.snackbar.show('success', 'Stock bought successfully!');
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error buying Stock.');
        }
      },

      clearSelectedStock() {
        this.selectedStock = {};
        this.selectedStockOffers = [];
      },

      clearOfferToRedeem() {
        this.offerToRedeem = {};
      }
    },
    async mounted() {
      await this.loadStocks();

      this.requesting.stocks = false;
    },
    template: `
      <div class="w-100 m-0 d-flex flex-column"
        style="gap: 16px; overflow-y: auto; max-height: 100%;"
        :class="windowWidth < 600 ? 'p-2' : 'p-4'"
      >
        <h1 class="m-0 p-0">Stocks</h1>
        <template v-if="requesting.stocks">
          <Loading />
        </template>
        <template v-else-if="!stocks.length">
          <p>There are no stocks available yet.</p>
          <p>Check back later!</p>
        </template>
        <template v-else>
          <ul 
            class="list-group flex-column"
          >
            <li v-for="stock in stocks"
              :key="stock.id"
              class="list-group-item flex-column"
            >
              <div
                class="d-flex w-100 align-items-center"
                style="gap: 8px;"
              >
                <h5 class="mb-1">{{ stock.name }}</h5>
                <small>{{ stock.symbol }}</small>
              </div>
              <div class="d-flex w-100 align-items-center justify-content-between">
                <small>{{ stock.last_price ? 'Last price: $' + stock.last_price : 'This stock was not sold yet' }}</small>
                <button
                  class="btn btn-success"
                  @click.stop.prevent="() => openStockBuy(stock)"
                >
                  Buy
                </button>
              </div>
            </li>
          </ul>
        </template>
        
        <ConfirmModal
          ref="offersModal"

          :dismissable="false"
          is-confirm-btn-gray
          modal-title="Buy Stock"
          title-icon="shopping_cart"
          @closed="clearSelectedStock"
        >
          <h5>{{ selectedStock.name }} - {{ selectedStock.symbol }}</h5>
          <h6 class="font-weight-bold">
            Offers
          </h6>
          <ul 
            v-if="selectedStockOffers.length"
            class="list-group flex-column"
          >
            <li v-for="offer in selectedStockOffers"
              :key="offer.id"
              class="list-group-item"
            >
              <div class="d-flex justify-content-between align-items-center">
                <span>
                  {{ '$'+ offer.price +' per share - ' + offer.quantity + ' shares' }}
                </span>
                <button
                  class="btn btn-sm btn-outline-success"
                  :disabled="offer.quantity <= 0 || offer.price <= 0 || (user && offer.price * offer.quantity > user.available_balance)"
                  @click.stop.prevent="openConfirmBuyModal(offer)"
                >
                  Buy
                </button>
              </div>
            </li>
          </ul>
          <template v-else>
            <p>There are no offers available yet.</p>
            <p class="mb-0">Check back later!</p>
          </template>
        </ConfirmModal>

        <CommandModal
          ref="confirmBuyModal"

          save-btn-label="Confirm"
          :dismissable="false"
          :has-close-button="false"
          :save-command="buyStock"
          @closed="this.clearOfferToRedeem"
        >
          <p class="m-0 p-0">
            Do you confirm the purchase of {{ offerToRedeem.quantity }} shares for {{ offerToRedeem.price }} each?
          </p>
        </CommandModal>

        <Snackbar ref="snackbar" />
      </div>
    `
}