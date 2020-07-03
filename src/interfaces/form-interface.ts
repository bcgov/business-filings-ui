import Vue from 'vue'

export interface FormIF extends Vue {
  reset(): void;
  validate(): boolean;
}
