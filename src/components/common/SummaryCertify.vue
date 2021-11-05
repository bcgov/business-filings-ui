<template>
  <v-card flat id="certify-container">
    <p class="certify-content">
        I, <strong>{{trimmedCertifiedBy || '[Legal Name]'}}</strong>, certify that I have relevant knowledge
        of the {{entityDisplay || 'association'}} and that I am authorized to make this filing.
    </p>
    <p class="certify-content">Date: {{getCurrentDate}}</p>
    <p class="certify-content">{{message}}</p>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({})
export default class SummaryCertify extends Vue {
  @Getter getCurrentDate!: string

  // Props passed into this component.
  @Prop({ default: '' })
  readonly certifiedBy: string

  @Prop({ default: '' })
  readonly message: string

  @Prop({ default: '' })
  readonly entityDisplay: string

  /**
   * Computed value.
   * @returns The trimmed "Certified By" string (may be '').
   */
  private get trimmedCertifiedBy (): string {
    return this.certifiedBy && this.certifiedBy.trim()
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

#certify-container {
  margin-top: 1rem;
  padding: 1.25rem 1.25rem 0.25rem 1.25rem;

  .certify-content {
    color: black;
    font-size: $px-16;
    line-height: 1.5rem;
  }
}
</style>
