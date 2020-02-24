<template>
  <v-card flat id="staff-payment-container">
    <div class="payment-container">
      <label>Routing Slip Number</label>
      <div class="value routingslipnumber">
        <p>{{ value }}</p>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class SummaryStaffPayment extends Vue {
  // Prop passed into this component.
  @Prop({ default: '' })
  private value: string
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';

#staff-payment-container {
  margin-top: 1rem;
  padding: 1.25rem;
  font-size: 0.875rem;
}

.payment-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  > label:first-child {
    font-weight: 700;
    margin-bottom: 2rem;
  }
}

@media (min-width: 768px) {
  .payment-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      padding-right: 2rem;
      width: 14rem;
    }
  }
}

.value.routingslipnumber {
  min-width: 35rem;
}
</style>
