<template>
  <div id="firms-address-list">
    <div :disabled="disabled">
      <div
        id="business-address-panel"
        class="align-items-top"
        :class="{ 'disabled': disabled }"
      >
        <div
          v-if="showCompleteYourFilingMessage"
          class="pt-4 pb-4"
        >
          <v-list class="pt-0 pb-0">
            <!-- Delivery Address -->
            <v-list-item class="delivery-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">
                  mdi-truck
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">
                  Delivery Address
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="complete-filing">Complete your filing to display</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">
                  mdi-email-outline
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">
                  Mailing Address
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="complete-filing">Complete your filing to display</span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>

        <div
          v-else
          class="pt-4 pb-4"
        >
          <v-list class="pt-0 pb-0">
            <!-- Delivery Address -->
            <v-list-item class="delivery-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">
                  mdi-truck
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">
                  Delivery Address
                </v-list-item-title>
                <v-list-item-subtitle v-if="businessAddress">
                  <ul
                    v-if="businessAddress.deliveryAddress"
                    class="address-subtitle pre-line"
                  >
                    <li class="address-line1">
                      {{ businessAddress.deliveryAddress.streetAddress }}
                    </li>
                    <li class="address-line2">
                      {{ businessAddress.deliveryAddress.streetAddressAdditional }}
                    </li>
                    <li class="address-line3">
                      {{ businessAddress.deliveryAddress.addressCity }}
                      {{ businessAddress.deliveryAddress.addressRegion }}
                      {{ businessAddress.deliveryAddress.postalCode }}
                    </li>
                    <li class="address-line4">
                      <span>{{ getCountryName(businessAddress.deliveryAddress.addressCountry) }}</span>
                    </li>
                  </ul>
                  <ul
                    v-else
                    class="address-subtitle pre-line"
                  >
                    <li class="delivery-address-not-entered">
                      (Not entered)
                    </li>
                  </ul>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-else>
                  <ul class="address-subtitle pre-line">
                    <li class="delivery-address-not-entered">
                      (Not entered)
                    </li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <!-- Mailing Address -->
            <v-list-item class="mailing-address-list-item">
              <v-list-item-icon class="address-icon mr-0">
                <v-icon color="primary">
                  mdi-email-outline
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">
                  Mailing Address
                </v-list-item-title>
                <v-list-item-subtitle v-if="businessAddress">
                  <div v-if="businessAddress.mailingAddress">
                    <span
                      v-if="isSame(businessAddress.deliveryAddress, businessAddress.mailingAddress, ['id'])"
                      class="same-as-above"
                    >
                      Same as above
                    </span>
                    <ul
                      v-else
                      class="address-subtitle pre-line"
                    >
                      <li class="address-line1">
                        {{ businessAddress.mailingAddress.streetAddress }}
                      </li>
                      <li class="address-line2">
                        {{ businessAddress.mailingAddress.streetAddressAdditional }}
                      </li>
                      <li class="address-line3">
                        {{ businessAddress.mailingAddress.addressCity }}
                        {{ businessAddress.mailingAddress.addressRegion }}
                        {{ businessAddress.mailingAddress.postalCode }}
                      </li>
                      <li class="address-line4">
                        <span>{{ getCountryName(businessAddress.mailingAddress.addressCountry) }}</span>
                      </li>
                    </ul>
                  </div>
                  <div
                    v-else
                    class="mailing-address-not-entered"
                  >
                    <span>(Not entered)</span>
                  </div>
                </v-list-item-subtitle>
                <v-list-item-subtitle v-else>
                  <div class="mailing-address-not-entered">
                    <span>(Not entered)</span>
                  </div>
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
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { isEmpty } from 'lodash'
import { CommonMixin, CountriesProvincesMixin } from '@/mixins'
import { OfficeAddressIF } from '@/interfaces'
import { useRootStore } from '@/stores'

@Component({})
export default class FirmsAddressList extends Mixins(CommonMixin, CountriesProvincesMixin) {
  /** Whether to display "complete your filing" instead of the address list. */
  @Prop({ default: false }) readonly showCompleteYourFilingMessage!: boolean

  /** Whether to gray out (disable) the director list. */
  @Prop({ default: false }) readonly showGrayedOut!: boolean

  @Getter(useRootStore) getBusinessAddress!: OfficeAddressIF

  // Business
  get businessAddress (): OfficeAddressIF|null {
    if (isEmpty(this.getBusinessAddress?.deliveryAddress)) return null
    return this.getBusinessAddress
  }

  /** Whether to appear disabled. */
  get disabled (): boolean {
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
  color: $gray7;
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
