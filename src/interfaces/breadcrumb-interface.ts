import Vue from 'vue'

export interface BreadcrumbInterface extends Vue {
  text: string;
  disabled?: boolean
  exact?: boolean
  to?: {}
  href?: string
}
