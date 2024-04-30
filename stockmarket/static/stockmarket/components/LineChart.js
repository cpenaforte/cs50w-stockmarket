export default {
    props: {
        chartName: {
            type: String,
            required: true,
        },
        chartData: {
            type: Object,
            required: true,
        },
        chartOptions: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            chart: {},
        }
    },
    computed: {
        chartNameToId() {
            return 'line-chart-' + this.chartName.toLowerCase().replace(/ /g, '-');
        }
    },
    methods: {
        loadChart(reinit = false) {
            const ctx = document.getElementById(this.chartNameToId);

            if (reinit && this.chart?.destroy) {
                this.chart.destroy();
            }

            this.chart = new Chart(ctx, {
              type: 'line',
              data: this.chartData,
              options: this.chartOptions,
            });
        }
    },
    watch: {
        chartData(newValue, oldValue) {
            if(newValue && newValue !== oldValue) {
                this.loadChart(true);
            }
        }
    },
    mounted() {
        this.loadChart();
    },
    template: `
        <div
            class="bg-white border rounded px-4 py-2"
            style="height: 300px; flex: 1 1 400px;"
        >
            <canvas :id="chartNameToId" class="w-100 h-100"/>
        </div>
    `
}