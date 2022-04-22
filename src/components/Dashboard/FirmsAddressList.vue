<template>
  <div id="address-list-sm">
    <div :disabled="disabled">
      <!-- Business Address -->
      <div id="business-address-panel" class="align-items-top" :class="{ 'disabled': disabled }">
        <div v-if="showCompleteYourFilingMessage" class="pt-4 pb-4">
          <v-list class="pt-0 pb-0">
            <v-list-item class="delivery-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">mdi-truck</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Delivery Address</v-list-item-title>
                <v-list-item-subtitle>
                  <span class="complete-filing">Complete your filing to display</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">mdi-email-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <span class="complete-filing">Complete your filing to display</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>

        <div v-else class="pt-4 pb-4">
          <v-list class="pt-0 pb-0" v-if="businessAddress">
            <v-list-item class="delivery-address-list-item" v-if="businessAddress.deliveryAddress">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">mdi-truck</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Delivery Address</v-list-item-title>
                <v-list-item-subtitle>
                  <ul class="address-subtitle pre-line">
                    <li class="address-line1">{{ businessAddress.deliveryAddress.streetAddress }}</li>
                    <li class="address-line2">{{ businessAddress.deliveryAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">
                      {{ businessAddress.deliveryAddress.addressCity }}
                      {{ businessAddress.deliveryAddress.addressRegion }}
                      {{ businessAddress.deliveryAddress.postalCode }}
                    </li>
                    <li class="address-line4">
                      <span>{{ getCountryName(businessAddress.deliveryAddress.addressCountry) }}</span>
                    </li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item" v-if="businessAddress.mailingAddress">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">mdi-email-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <div
                    class="same-as-above"
                    v-if="isSame(businessAddress.deliveryAddress, businessAddress.mailingAddress, ['id'])">
                    <span>Same as above</span>
                  </div>
                  <ul v-else class="address-subtitle pre-line">
                    <li class="address-line1">{{ businessAddress.mailingAddress.streetAddress }}</li>
                    <li class="address-line2">{{ businessAddress.mailingAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">
                      {{ businessAddress.mailingAddress.addressCity }}
                      {{ businessAddress.mailingAddress.addressRegion }}
                      {{ businessAddress.mailingAddress.postalCode }}
                    </li>
                    <li class="address-line4">
                      <span>{{ getCountryName(businessAddress.mailingAddress.addressCountry) }}</span>
                    </li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

// Mixins
import { CommonMixin, CountriesProvincesMixin } from '@/mixins'

// Interfaces
import { OfficeAddressIF } from '@/interfaces'

@Component({})
export default class FirmsAddressList extends Mixins(CommonMixin, CountriesProvincesMixin) {
  /** Whether to display "complete your filing" instead of the address list. */
  @Prop({ default: false })
  readonly showCompleteYourFilingMessage: boolean

  /** Whether to gray out (disable) the director list. */
  @Prop({ default: false })
  readonly showGrayedOut: boolean

  @State businessAddress!: OfficeAddressIF

  /** Whether to appear disabled. */
  private get disabled (): boolean {
    return (this.showCompleteYourFilingMessage || this.showGrayedOut)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

// Variables
$icon-width: 2.75rem;

// Complete filing required styling
.complete-filing {
  color: $gray6;
  font-size: $px-14;
  white-space: pre-wrap;
}

.v-list-item {
  padding: 0 1rem;
}

.v-list-item:first-of-type {
  padding-bottom: 1rem;
}

.v-list-item__icon {
  margin-top: 0.7rem;
  margin-right: 0;
}

.v-list-item__title {
  font-size: $px-14;
  font-weight: 400;
}

.v-list-item__subtitle {
  line-height: 1.25rem !important;
}

.v-list-item__content {
  padding: 0;
}

.address-icon {
  width: $icon-width;
  margin-top: 0;
}

.address-subtitle {
  margin: 0;
  padding: 0;
  list-style-type: none;
}
</style>
