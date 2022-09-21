<template>
  <div id="custodian-list-sm">
    <v-expansion-panels accordion multiple  :value="[0]">
      <v-expansion-panel class="align-items-top address-panel"
                         v-for="custodian in custodians"
                         :key="custodian.id"
      >
        <v-expansion-panel-header class="address-panel-toggle">
          <div class="avatar-container">
            <v-avatar color="primary" size="25">{{ officerName(custodian).substring(0,1) }}</v-avatar>
          </div>
          <div class="list-item__title">{{ officerName(custodian) }}</div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-list class="pt-0 pb-0">
            <v-list-item class="delivery-address-list-item" v-if="custodian.deliveryAddress">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Delivery Address</v-list-item-title>
                <v-list-item-subtitle>
                  <ul class="address-subtitle pre-line">
                    <li class="address-line1">{{ custodian.deliveryAddress.streetAddress }}</li>
                    <li class="address-line2">{{ custodian.deliveryAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">{{ custodian.deliveryAddress.addressCity }}
                      {{ custodian.deliveryAddress.addressRegion }}
                      {{ custodian.deliveryAddress.postalCode }}</li>
                    <li class="address-line4">{{ getCountryName(custodian.deliveryAddress.addressCountry) }}</li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item" v-if="custodian.mailingAddress">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="same-as-above"
                       v-if="isSame(custodian.deliveryAddress, custodian.mailingAddress, 'id')"
                  >
                    <span>Same as above</span>
                  </div>
                  <ul v-else class="address-subtitle pre-line">
                    <li class="address-line1">{{ custodian.mailingAddress.streetAddress }}</li>
                    <li class="address-line2">{{ custodian.mailingAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">{{ custodian.mailingAddress.addressCity }}
                      {{ custodian.mailingAddress.addressRegion }}
                      {{ custodian.mailingAddress.postalCode }}</li>
                    <li class="address-line4">{{ getCountryName(custodian.mailingAddress.addressCountry) }}</li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { CommonMixin, CountriesProvincesMixin } from '@/mixins'
import { PartyIF } from '@/interfaces'

@Component({})
export default class CustodianListSm extends Mixins(CommonMixin, CountriesProvincesMixin) {
  @Prop({ default: () => [] }) readonly custodians!: Array<PartyIF>

  /** Return the officer person or org name */
  protected officerName (party: PartyIF): string {
    if (party.officer.firstName) {
      return `${party.officer.firstName} ${party.officer.middleInitial || ''} ${party.officer.lastName}`
    }
    if (party.officer.organizationName) {
      return party.officer.organizationName
    }
    return '' // should never happen
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

// Variables
$avatar-width: 2.75rem;

// Complete filing required styling
.complete-filing {
  padding: 2rem;
  color: $gray6;
  font-size: $px-14;
  white-space: pre-wrap;
  display: inline-block;
}

// Expansion Panel Customization
.v-expansion-panel-header {
  padding: 1rem;
}

.v-expansion-panel-header > .avatar-container {
  flex: 0 0 auto;
  width: $avatar-width;
}

:deep(.v-expansion-panel-content__wrap) {
  padding-right: 1rem;
  padding-left: 1rem;
  padding-bottom: 1rem;
}

.v-avatar {
  flex: 0 0 auto;
  color: $gray0;
  font-size: $px-14;
}

// Custodian Address Information
.v-list-item {
  padding: 0;
}

.v-list-item:not(last-of-type) {
  padding-bottom: 1rem;
}

.v-list-item__title {
  font-size: $px-14;
  font-weight: 400;
}

.v-list-item__content {
  padding: 0;
  margin-left: $avatar-width;
}

.address-subtitle {
  padding: 0;
  list-style-type: none;
  line-height: 1.25rem;
}
</style>
