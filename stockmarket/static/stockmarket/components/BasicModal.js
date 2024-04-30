export default {
    props: {
        dismissable: {
            type: Boolean,
            default: true,
        },
        hasCloseButton: {
            type: Boolean,
            default: true,
        },
        modalTitle: {
            type: String,
            default: '',
        },
        titleIcon: String,
        isSmall: {
            type: Boolean,
            default: false,
        }
    },
    data() {
      return {
        open: false,
      }
    },
    methods: {
        show() {
            this.open = true;
        },
        hide() {
            this.open = false;
        },
        checkIfOutside(event) {
            if (!this.dismissable) {
                return;
            }

            if (event.target.classList.contains('modal-container')) {
                this.hide();
            }
        }
    },
    template: `
        <Teleport to="body">
            <div v-if="open"
                class="modal-container position-fixed w-100 h-100 d-flex justify-content-center align-items-center"
                style="top:0; left:0; background-color: rgba(0,0,0,0.2);"
                @click.stop.prevent="checkIfOutside($event)"
            >
                <div
                    class="modal-box d-flex flex-column pt-4 bg-white rounded"
                    style="gap: 16px;"
                    :style="isSmall
                        ? 'width: min(640px, 95dvw); max-height: min(480px, 95dvh);'
                        : 'width: min(800px, 95dvw); max-height: min(600px, 95dvh);'
                    "
                >
                    <div
                        v-if="modalTitle.length > 0 || titleIcon || hasCloseButton"
                        class="d-flex px-4 justify-content-between align-items-center"
                    >
                        <div 
                            class="m-0 p-0 d-flex align-items-center"
                        >
                            <div v-if="titleIcon"
                                class="d-flex align-items-center justify-content-center mr-3 bg-secondary rounded-circle"
                                style="width: 28px; height: 28px;"
                            >
                                <span
                                    class="material-icons text-light"
                                    style="width: 20px; height: 20px; font-size: 20px; line-height: 20px;"
                                >
                                    {{ titleIcon }}
                                </span>
                            </div>
                            <h3
                                class="m-0 mr-2 d-flex align-items-center"
                                style="font-size: 28px; line-height: 28px;"
                            >
                                {{ modalTitle }}
                            </h3>
                        </div>
                        <button v-if="hasCloseButton"
                            class="btn btn-outline-secondary m-0 p-0 rounded-circle border-0 flex align-items-center justify-content-center"
                            style="line-height: 0;"
                            @click="hide"
                        >
                            <span
                                class="material-icons m-0 p-0"
                                style="width: 24px; height: 24px; font-size: 24px; line-height: 24px;"
                            >
                                close
                            </span>
                        </button>
                    </div>
                    <slot />
                </div>
            </div>
        </Teleport>
    `
}