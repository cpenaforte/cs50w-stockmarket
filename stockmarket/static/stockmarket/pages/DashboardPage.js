import { usePortfolioStore } from "../stores/portfolio.js";
import { useDashboardStore } from "../stores/dashboard.js";
const { mapState, mapActions } = Pinia;

import LineChart from "../components/LineChart.js";
import Snackbar from "../components/Snackbar.js";

export default {
    components: {
      LineChart,
      Snackbar,
    },
    data() {
      return {
        chartTitles: {
          month: {
            stocks: 'Your Stocks (Last 30 Days)',
            portfolioValue: 'Portfolio Value (Last 30 Days)',
          },
          week: {
            stocks: 'Your Stocks (Last 7 Days)',
            portfolioValue: 'Portfolio Value (Last 7 Days)',
          },
          year: {
            stocks: 'Your Stocks (Last 365 Days)',
            portfolioValue: 'Portfolio Value (Last 365 Days)',
          },
          tenYears: {
            stocks: 'Your Stocks (Last 10 Years)',
            portfolioValue: 'Portfolio Value (Last 10 Years)',
          },
        }
      }
    },
    computed: {
      ...mapState(usePortfolioStore, ['userStocks']),
      ...mapState(useDashboardStore, ['dashboard']),

      windowWidth() {
        return window.innerWidth;
      },

      formattedStockPrices() {
        const defaultSingleResult = {
          labels: [],
          datasets: [],
        };
        
        const result = {
          week: defaultSingleResult,
          month: defaultSingleResult,
          year: defaultSingleResult,
          ten_years: defaultSingleResult,
        }

        if (!this.dashboard?.week?.length) return result;

        for ( const [key, value] of Object.entries(this.dashboard) ) {
          if (value.length > 0) {
            const datasetsToAdd = value.map(stockDashboard => {
              const { stock, last_operations } = stockDashboard;
              
              const data = [];
              const userTotalQuantities = [];
              const labels = [];
              
              for (const dayOperation of last_operations) {
                const splitDate = dayOperation.date.split('-');
                
                if(splitDate.length != 3) continue;

                const date = new Date(splitDate[0], splitDate[1] - 1, splitDate[2]);

                labels.push(date.toLocaleDateString({timeZone: 'UTC'}));
                
                const maybeLastDayPrice = data[data.length - 1];
                
                data.push(dayOperation?.operation?.offer.price || maybeLastDayPrice || stock.default_price || 0);
                userTotalQuantities.push(dayOperation?.user_total_quantity || 0);
              }
              
              return {
                labels,
                stockChartData: {
                  label: stock.symbol,
                  data,
                  borderWidth: 2
                },
                userTotalQuantities,
              };
            });
            
            result[key] = {
              labels: datasetsToAdd[0]?.labels || [],
              datasets: datasetsToAdd,
            };
          }
        }

        return result;
      },

      stocksPriceChart() {
        const defaultSingleResult = {
          data: {
            labels: [],
            datasets: [],
          },
          options: {},
        };

        const result = {
          week: defaultSingleResult,
          month: defaultSingleResult,
          year: defaultSingleResult,
          ten_years: defaultSingleResult,
        }

        for ( const [key, value] of Object.entries(this.formattedStockPrices) ) {
          if (value.labels.length > 0) {
            const clonedFormattedStockPrices = value.datasets.map(formattedStockPrice => formattedStockPrice.stockChartData);

            result[key] = {
              data: {
                labels: value.labels,
                datasets: clonedFormattedStockPrices
              },
              options: {
                devicePixelRatio: 3,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  },
                  x: {
                    display: false
                  },
                },
                plugins: {
                  title: {
                    display: true,
                    text: this.chartTitles[key].stocks,
                    align: 'start',
                    font: {
                      size: 18,
                    }
                  }
                }
              }
            }
          }
        }

        return result;
      },

      portfolioValueChart() {
        const defaultSingleResult = {
          data: {
            labels: [],
            datasets: [],
          },
          options: {},
        };

        const result = {
          week: defaultSingleResult,
          month: defaultSingleResult,
          year: defaultSingleResult,
          ten_years: defaultSingleResult,
        };

        for ( const [key, value] of Object.entries(this.stocksPriceChart) ) {
          if (value.data.labels.length > 0) {
            const { data, options } = value;

            const { labels, datasets } = data;

            const clonedFormattedStockPrices = {...this.formattedStockPrices[key]}.datasets.map(formattedStockPrice => formattedStockPrice.userTotalQuantities);

            const newData = datasets.map((dataset, index) => {
              const userTotalQuantities = clonedFormattedStockPrices[index];

              return dataset.data.map((price, index) => {
                return price * userTotalQuantities[index];
              });
            }).reduce((acc, curr) => {
              if (!acc.length) return curr;

              return acc.map((value, index) => {
                return value + curr[index];
              });
            }, []);

            const newDataset = {
              label: 'Portfolio Value',
              data: newData,
              borderWidth: 2
            };

            result[key] = {
              data: {
                labels,
                datasets: [newDataset]
              },
              options: {
                ...options,
                plugins: {
                  ...options.plugins,
                  title: {
                    ...options.plugins.title,
                    text: this.chartTitles[key].portfolioValue,
                  }
                }
              }
            }
          }
        }

        return result;
      }
    },
    methods: {
      ...mapActions(usePortfolioStore, ['getPortfolio']),
      ...mapActions(useDashboardStore, ['getDashboard']),

      async loadPortfolio(force = false) {
        try {
          if (!force && this.userStocks.length) return;

          await this.getPortfolio();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting portfolio.');
        }
      },

      async loadDashboard(force = false) {
        try {
          if (!force && this.dashboard?.week?.length) return;

          await this.getDashboard();
        } catch (error) {
          console.error(error);

          this.$refs?.snackbar.show('error', error?.message || error?.response?.data?.error || 'Error getting dashboard values.');
        }
      },

      goTo(page) {
        this.$emit('page-change', page);
      },

      getDateStr(pastDayOffset = 0) {
        const today = new Date();

        today.setDate(today.getDate() - pastDayOffset);

        // locale date string
        return today.toLocaleDateString({timeZone: 'UTC'});
      }
    },
    async created() {
      await this.loadPortfolio();
      await this.loadDashboard();
    },
    template: `
        <div class="w-100 m-0 d-flex flex-column"
          style="gap: 16px; overflow-y: auto; max-height: 100%;"
          :class="windowWidth < 600 ? 'p-2' : 'p-4'"
        >
            <h1 class="m-0 p-0">Dashboard</h1>
            <div class="d-flex flex-column w-100"
              style="gap: 16px;"
            >
              <div class="d-flex"
                style="gap: 16px; flex-wrap: wrap;"
              >
                <LineChart
                  :chart-name="chartTitles.week.portfolioValue"
                  :chart-data="portfolioValueChart.week.data"
                  :chart-options="portfolioValueChart.week.options"
                />
                <LineChart
                  :chart-name="chartTitles.week.stocks"
                  :chart-data="stocksPriceChart.week.data"
                  :chart-options="stocksPriceChart.week.options"
                />
              </div>
              <div class="d-flex"
                style="gap: 16px; flex-wrap: wrap;"
              >
                <LineChart
                  :chart-name="chartTitles.month.portfolioValue"
                  :chart-data="portfolioValueChart.month.data"
                  :chart-options="portfolioValueChart.month.options"
                />
                <LineChart
                  :chart-name="chartTitles.month.stocks"
                  :chart-data="stocksPriceChart.month.data"
                  :chart-options="stocksPriceChart.month.options"
                />
              </div>
            </div>
            
            <Snackbar ref="snackbar" />
        </div>
    `
}