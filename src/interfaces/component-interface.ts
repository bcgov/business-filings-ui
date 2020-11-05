import Vue from 'vue'

/** Generic component interface for reference typing. */
export interface ComponentIF extends Vue {
  $refs: any;
}
