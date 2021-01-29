import Vue from 'vue'

export interface FormIF extends Vue {
  reset(): void;
  resetValidation(): void;
  validate(): boolean;
}
