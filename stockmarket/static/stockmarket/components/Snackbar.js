export default {
    props: {
        hasCloseButton: {
            type: Boolean,
            default: true,
        },
    },
    data() {
      return {
        open: false,
        text: '',
        classes: {
            bg: 'bg-white',
            text: 'text-black',
            closeBtn: 'btn-outline-secondary',
        }
      }
    },
    methods: {
        show(type, text) {
            switch (type) {
                case 'error':
                    this.classes.bg = 'bg-danger';
                    this.classes.text = 'text-white';
                    this.classes.closeBtn = 'btn-outline-light';
                    break;
                case 'success':
                    this.classes.bg = 'bg-success';
                    this.classes.text = 'text-white';
                    this.classes.closeBtn = 'btn-outline-light';
                    break;
                case 'warning':
                    this.classes.bg = 'bg-warning';
                    this.classes.text = 'text-white';
                    this.classes.closeBtn = 'btn-outline-light';
                    break;
                case 'info':
                    this.classes.bg = 'bg-info';
                    this.classes.text = 'text-white';
                    this.classes.closeBtn = 'btn-outline-light';
                    break;
            }

            this.text = text;
            this.open = true;

            setTimeout(() => {
                this.hide();
            }, 3000);
        },
        hide() {
            this.open = false;
        }
    },
    template: `
        <Teleport to="body">
            <div
                v-if="open"
                class="d-flex justify-content-between align-items-center p-2 rounded"
                :class="classes.bg"
                style="position: fixed; bottom:16px; right:16px; max-width: min(640px, calc(100dvw - 32px)); max-height: 100px; gap: 16px;"
            >
                <span
                    :class="classes.text"
                    style="font-size: 14px; line-height: 16px; overflow-x: auto;"
                >
                    {{ text }}
                </span>
                <button v-if="hasCloseButton"
                    class="btn m-0 p-0 rounded-circle border-0 flex align-items-center justify-content-center"
                    :class="classes.closeBtn"
                    style="line-height: 0;"
                    @click="hide"
                >
                    <span
                        class="material-icons m-0 p-0"
                        style="width: 20px; height: 20px; font-size: 20px; line-height: 20px;"
                    >
                        close
                    </span>
                </button>
            </div>
        </Teleport>
    `
}