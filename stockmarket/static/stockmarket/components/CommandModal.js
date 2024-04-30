import BasicModal from "./BasicModal.js";

export default {
    emits: [
        'saved',
        'closed',
        'opened'
    ],
    components: {
        BasicModal,
    },
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
        saveCommand: {
            type: Function,
            required: true,
        },
        saveBtnLabel: {
            type: String,
            default: 'Save',
        },
        isSaveButtonDisabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
      return {
        coloring: {
            confirm: 'btn-primary',
        }
      }
    },
    methods: {
        show(type = "primary") {
            switch (type) {
                case "primary":
                    this.coloring.confirm = "btn-primary";
                    break;
                case "danger":
                    this.coloring.confirm = "btn-danger";
                    break;
                case "warning":
                    this.coloring.confirm = "btn-warning";
                    break;
                case "success":
                    this.coloring.confirm = "btn-success";
                    break;
                case "info":
                    this.coloring.confirm = "btn-info";
                    break;
            }

            this.$refs?.modalBasic.show();
            this.$emit('opened');
        },
        hide() {
            this.$refs?.modalBasic.hide();
            this.$emit('closed');
        },
        callSaveCommand() {
            try {
                this.saveCommand();
                this.$emit('saved');

                this.hide();
            } catch (e) {
                console.error(e);
            }
        }
    },
    template: `
        <BasicModal
            ref="modalBasic"
            :dismissable="dismissable"
            :has-close-button="hasCloseButton"
            :modal-title="modalTitle"
            :title-icon="titleIcon"
        >
            <div
                class="d-flex flex-column px-4"
            >
                <slot />
            </div>
            <div class="d-flex w-full">
                <button class="btn btn-lg btn-light text-dark"
                    style="flex: 1; border-radius: 0 0 0 4px;"
                    @click="hide"
                >
                    Close
                </button>
                <button
                    class="btn btn-lg"
                    :class="coloring.confirm"
                    style="flex: 1; border-radius: 0 0 4px 0;"
                    :disabled="isSaveButtonDisabled"
                    @click="callSaveCommand"
                >
                    {{ saveBtnLabel }}
                </button>
            </div>
        </BasicModal>
    `
}