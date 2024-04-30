export default {
    props: {
      currentPage: {
        type: String,
        required: true,
      }
    },
    data() {
      return {
        currentPageOptions: [ 'dashboard', 'stocks', 'portfolio' ],
      }
    },
    methods: {
      goTo(page) {
        this.$emit('page-change', page);
      }
    },
    template: `
      <ul class="nav flex-column h-100 bg-dark"
        style="width: min(175px, 25%);"
      >
        <li v-for="(value, index) in currentPageOptions"
          :key="index"
          class="nav-item"
        >
          <button
            class="btn btn-block rounded-0 border-0 py-2 px-1"
            :class="currentPage === value ? 'btn-primary' : 'btn-outline-primary text-light'"
            style="outline: none; box-shadow: none; text-transform: capitalize;"
            @click="() => goTo(value)"
          >
            {{ value }}
          </button>
        </li>
      </ul>
    `
}