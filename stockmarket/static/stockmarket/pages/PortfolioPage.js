import serviceOffers from '../services/offers.js';

import { useAccountStore } from '../stores/account.js';
import { usePortfolioStore } from '../stores/portfolio.js';
const { mapState, mapActions } = Pinia;

import Loading from '../components/Loading.js';
import CommandModal from '../components/CommandModal.js';
import ConfirmModal from '../components/ConfirmModal.js';
import Snackbar from '../components/Snackbar.js';

export default {
    components: {
      Loading,
      CommandModal,
      ConfirmModal,
      Snackbar,
    },
    data() {
      return {
        selectedUserStock: {},
        offerToCancel: {},

        offerForm: {
          quantity: 0,
          price: 0,
        },

        requesting: {
          userStocks: true
        }
      }
    },
    computed: {
      ...mapState(useAccountStore, ['user']),
      ...mapState(usePortfolioStore, ['userStocks']),

      windowWidth() {
        return window.innerWidth;
      },

      isSaveButtonDisabled() {
        return !this.offerForm.price || !this.offerForm.quantity
          || (this.selectedUserStock && this.offerForm.quantity > this.selectedUserStock.quantity);
      },

      portfolioValue() {
        return this.userStocks.reduce((total, userStock) => {
          return total + (userStock.stock.last_price * userStock.quantity);
        }, 0) + (this.user?.available_balance || 0);
      }
    },
    methods: {
      ...mapActions(usePortfolioStore, ['getPortfolio']),
      ...mapActions(useAccountStore, ['getUser']),

      goTo(page) {
        this.$emit('page-change', page);
      },

      clearSelectedUserStock() {
        this.selectedUserStock = {};
      },

      openCreateOfferModal(userStock) {
        this.selectedUserStock = userStock;

        this.$refs?.commandModal.show();
      },

      openOffersModal(userStock) {
        this.selectedUserStock = userStock;

        this.$refs?.offersModal.show();
      },

      openConfirmCancelOfferModal(offer) {
        this.offerToCancel = offer;

        this.$refs?.confirmCancelOfferModal.show("danger");
      },

      clearOfferToCancel() {
        this.offerToCancel = {};
      },

      async getUserInfo(force = false) {
        try {
          if (force || !this.user?.id) {
            await this.getUser();
          }
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting user info.');
        }
      },

      async getUserStocks(force = false) {
        try {
          if (force || !this.userStocks?.length) {
            await this.getPortfolio();
          }
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting portfolio.');
        }
      },

      async createOffer() {
        try {
          if (!this.selectedUserStock?.stock?.id) {
            throw new Error('Invalid stock.');
          }

          if (!this.offerForm.price || !this.offerForm.quantity) {
            throw new Error('Offer price and quantity are required.');
          }

          const offer = {
            quantity: this.offerForm.quantity,
            price: this.offerForm.price,
          }

          await serviceOffers.createStockOffer(this.selectedUserStock.stock.id, offer);

          this.$refs?.commandModal.hide();

          await this.getUserStocks(true);

          this.selectedUserStock = this.userStocks
            .find(userStock => userStock.id === this.selectedUserStock.id)
            || this.selectedUserStock;

          this.$refs?.snackbar.show('success', 'Offer created successfully!');
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error creating offer.');
        }
      },

      async cancelOffer() {
        try {
          if (!this.offerToCancel?.id || !this.selectedUserStock?.stock?.id) {
            throw new Error('Invalid offer.');
          }

          await serviceOffers.cancelStockOffer(this.selectedUserStock.stock.id, this.offerToCancel.id);

          this.$refs?.confirmCancelOfferModal.hide();

          await this.getUserStocks(true);

          this.selectedUserStock = this.userStocks
            .find(userStock => userStock.id === this.selectedUserStock.id)
            || this.selectedUserStock;

          this.$refs?.snackbar.show('success', 'Offer canceled successfully!');
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error canceling offer.');
        }
      },

      filterOffers(offers) {
        return offers.filter(offer => !offer.sold && !offer.canceled);
      },

      countOpenOffers(userStock) {
        if (!userStock?.offers) {
          return 0;
        }

        return this.filterOffers(userStock.offers).length;
      }
    },
    async mounted() {
      await this.getUserInfo();
      await this.getUserStocks();

      this.requesting.userStocks = false;
    },
    template: `
      <div class="w-100 m-0 d-flex flex-column"
        style="gap:16px; overflow-y: auto; max-height: 100%;"
        :class="windowWidth < 600 ? 'p-2' : 'p-4'"
      >
        <h1 class="m-0 p-0">Portfolio</h1>
        <template v-if="requesting.userStocks">
          <Loading />
        </template>
        <template v-else-if="!userStocks.length">
          <p>You don't have any stocks in your portfolio yet.</p>
          <p>Go to the
            <button
              class="btn btn-link px-0"
              @click.stop.prevent="goTo('stocks')"
            >
              Stocks
            </button>
          page to buy some!</p>
        </template>
        <template v-else>
          <div
            v-if="user?.id"
            class="card mb-4"
          >
            <div class="card-body">
              <p
                class="card-text d-flex align-items-center"
                style="font-size: 18px; line-height: 24px; font-weight: 600;"
              >
                Portfolio Total:
                <span class="text-success ml-1">
                  {{ '$' + portfolioValue }}
                </span>
              </p>
              <p
                class="card-text d-flex align-items-center"
              >
                Available Balance:
                <span class="text-success ml-1">
                  {{ '$' + user.available_balance }}
                </span>
              </p>
            </div>
          </div>
          <h3 class="mb-1">Your stocks</h3>
          <ul 
            class="list-group flex-column"
          >
            <li v-for="userStock in userStocks"
              :key="userStock.id"
              class="list-group-item"
            >
              <div class="d-flex w-100 justify-content-between">
                <h5 class="mb-1">{{ userStock.stock.name }}</h5>
                <small>{{ userStock.stock.symbol }}</small>
              </div>
              <p class="mb-1">
                {{ userStock.quantity }} shares
                <span v-if="userStock.stock.last_price">
                  {{ 'at $'+ userStock.stock.last_price + ' each' }}
                </span>
              </p>
              <div class="mb-1 d-flex justify-content-between align-items-center">
                <p class="m-0">
                  <strong>
                    {{ 'Total value: $' + (userStock.stock.last_price * userStock.quantity) }}
                  </strong>
                </p>
                <div
                  class="m-0 p-0 d-flex"
                  style="gap: 16px;"
                >
                  <button
                    v-if="countOpenOffers(userStock) > 0"
                    class="btn btn-sm btn-outline-secondary"
                    @click.stop.prevent="openOffersModal(userStock)"
                  >
                    {{ countOpenOffers(userStock) }} open Offer(s)
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click.stop.prevent="openCreateOfferModal(userStock)"
                  >
                    Create Offer
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </template>

        <CommandModal
          ref="commandModal"
          modal-title="Create Stock Offer"
          save-btn-label="Offer"
          title-icon="shopping_cart"
          :save-command="createOffer"
          :is-save-button-disabled="isSaveButtonDisabled"
          :dismissable="false"

          @closed="clearSelectedUserStock"
        >
          <h5>{{ selectedUserStock.stock.name }} - {{ selectedUserStock.stock.symbol }}</h5>
          <p>
            You have {{ selectedUserStock.quantity }} shares
            <span v-if="selectedUserStock.stock.last_price">
              at {{ selectedUserStock.stock.last_price }} each
            </span>
          </p>
          <div class="form-group">
            <label for="quantity">Quantity</label>
            <input
              type="number"
              class="form-control"
              id="quantity"
              v-model.number="offerForm.quantity"
            />
          </div>
          <div class="form-group">
            <label for="price">Price</label>
            <input
              type="number"
              class="form-control"
              id="price"
              v-model.number="offerForm.price"
            />
          </div>
        </CommandModal>

        <ConfirmModal
          ref="offersModal"
          modal-title="Your open Offers"
          title-icon="inventory_2"

          @closed="clearSelectedUserStock"
        >
          <h5>{{ selectedUserStock.stock.name }} - {{ selectedUserStock.stock.symbol }}</h5>
          <ul 
            v-if="selectedUserStock.offers.length"
            class="list-group flex-column"
          >
            <li v-for="offer in filterOffers(selectedUserStock.offers)"
              :key="offer.id"
              class="list-group-item"
            >
              <div class="d-flex justify-content-between align-items-center m-0 p-0">
                <span>
                  {{ '$'+ offer.price +' per share - ' + offer.quantity + ' shares' }}
                </span>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click.stop.prevent="openConfirmCancelOfferModal(offer)"
                >
                  Cancel
                </button>
              </div>
            </li>
          </ul>
        </ConfirmModal>

        <CommandModal
          ref="confirmCancelOfferModal"

          save-btn-label="Confirm"
          :save-command="cancelOffer"
          :has-close-button="false"
          :dismissable="false"

          @closed="clearOfferToCancel"
        >
          <p class="m-0 p-0"> Are you sure you want to cancel this offer? </p>
        </CommandModal>

        <Snackbar
          ref="snackbar"
        />
      </div>
    `
}