import BasicModal from "./BasicModal.js";

export default {
    components: {
        BasicModal,
    },
    emits: [
        'opened',
        'closed',
    ],
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
        isConfirmBtnGray: {
            type: Boolean,
            default: false,
        },
        confirmBtnLabel: {
            type: String,
            default: 'Close',
        },
    },
    data() {
      return {
      }
    },
    methods: {
        show() {
            this.$refs?.modalBasic.show();
            this.$emit('opened');
        },
        hide() {
            this.$refs?.modalBasic.hide();
            this.$emit('closed');
        },
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
                <button class="btn btn-lg"
                    :class="{
                        'btn-light text-dark': isConfirmBtnGray,
                        'btn-primary': !isConfirmBtnGray,
                    }"
                    style="flex: 1; border-radius: 0 0 4px 4px;"
                    @click="hide"
                >
                    {{confirmBtnLabel}}
                </button>
            </div>
        </BasicModal>
    `
}