<template>
  <v-card flat>
    <ul class="list address-list">
      <!-- Registered Delivery Address -->
      <li class="address-list-container">
        <div class="meta-container">
          <label class="section-header">Registered Office</label>
          <div class="meta-container__inner">
            <label><strong>Delivery Address</strong></label>
            <div class="address-wrapper">
              <delivery-address :address="registeredDeliveryAddress" />
            </div>
          </div>
        </div>
      </li>

      <!-- Registered Mailing Address -->
      <li class="address-list-container">
        <div class="meta-container">
          <label></label>
          <div class="meta-container__inner"
            v-if="!isSame(registeredDeliveryAddress, registeredMailingAddress)"
          >
            <label><strong>Mailing Address</strong></label>
            <div class="address-wrapper">
              <mailing-address :address="registeredMailingAddress" />
            </div>
          </div>
          <span id="regMailSameAsDeliv" v-else>Mailing Address same as above</span>
        </div>
      </li>

      <!-- Records Office Section -->
      <template v-if="!isSame(registeredAddress, recordsAddress)">
        <!-- Records Delivery Address -->
        <li class="address-list-container">
          <div class="meta-container">
            <label>Records Office</label>
            <div class="meta-container__inner">
              <label><strong>Delivery Address</strong></label>
              <div class="address-wrapper">
                <delivery-address :address="recordsDeliveryAddress" />
              </div>
            </div>
          </div>
        </li>

        <!-- Records Mailing Address -->
        <li class="address-list-container">
          <div class="meta-container">
            <label></label>
            <div class="meta-container__inner"
              v-if="!isSame(recordsDeliveryAddress, recordsMailingAddress)"
            >
              <label>Mailing Address</label>
              <div class="address-wrapper">
                <mailing-address :address="recordsMailingAddress" />
              </div>
            </div>
            <span v-else>Mailing Address same as above</span>
          </div>
        </li>
      </template>
      <template v-else>
        <li class="address-list-container">
          <div class="meta-container">
            <label>Records Office</label>
            <div class="meta-container__inner">
              <span id="recSameAsReg">
                Same as Registered Office
              </span>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </v-card>
</template>

<script lang="ts">
// Libraries
import { Component, Prop, Mixins } from 'vue-property-decorator'

// Components
import BaseAddress from 'sbc-common-components/src/components/BaseAddress.vue'

// Mixins
import { CommonMixin } from '@/mixins'

// Interfaces
import { AddressIF, OfficeAddressIF } from '@/interfaces'

@Component({
  components: {
    'delivery-address': BaseAddress,
    'mailing-address': BaseAddress
  }
})
export default class SummaryOfficeAddresses extends Mixins(CommonMixin) {
  /**
   * Registered Office address object passed in from the parent which is pulled from store.
   */
  @Prop({ default: null })
  readonly registeredAddress: OfficeAddressIF

  /**
   * Records Office address object passed in from the parent which is pulled from store.
   */
  @Prop({ default: null })
  readonly recordsAddress: OfficeAddressIF

  /** The Registered Delivery Address. */
  private get registeredDeliveryAddress (): AddressIF {
    return this.registeredAddress?.deliveryAddress
  }

  /** The Registered Mailing Address. */
  private get registeredMailingAddress (): AddressIF {
    return this.registeredAddress?.mailingAddress
  }

  /** The Records Delivery Address. */
  private get recordsDeliveryAddress (): AddressIF {
    return this.recordsAddress?.deliveryAddress
  }

  /** The Records Mailing Address. */
  private get recordsMailingAddress (): AddressIF {
    return this.recordsAddress?.mailingAddress
  }
}
</script>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.address-list-container {
  padding: 1.25rem;
}

.meta-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;
}

.meta-container__inner {
  margin-top: 1rem;
}

label:first-child {
  font-weight: 700;

  &__inner {
    flex: 1 1 auto;
  }
}

@media (min-width: 768px) {
  .meta-container {
    flex-flow: row nowrap;

    label:first-child {
      flex: 0 0 auto;
      padding-right: 4rem;
      width: 14.5rem;
    }
  }

  .meta-container__inner {
    margin-top: 0;
  }
}

.address-list .form {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .address-list .form {
    margin-top: 0rem;
  }
}

// Address Block Layout
.address-wrapper {
  margin-top: .5rem;
}
</style>
