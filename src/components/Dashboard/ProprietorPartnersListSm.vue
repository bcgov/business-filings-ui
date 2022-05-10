<template>
  <div id="proprietor-partners-list-sm" :class="{ 'disabled': disabled }">
    <div v-if="showCompleteYourFilingMessage">
      <span class="complete-filing">Complete your filing to display</span>
    </div>

    <v-expansion-panels v-else accordion multiple>
      <v-expansion-panel class="align-items-top address-panel" v-if="proprietorPartners.length===0">
        <span class="complete-filing">Complete your filing to display</span>
      </v-expansion-panel>
      <!-- when grayed out, disable expansion -->
      <v-expansion-panel class="align-items-top address-panel" v-else
        v-for="(party, index) in proprietorPartners"
        :key="index"
        :disabled="disabled"
      >
        <v-expansion-panel-header class="address-panel-toggle">
          <div class="avatar-container">
            <v-avatar color="primary" size="25">{{ officerName(party).substring(0,1) }}</v-avatar>
          </div>
          <div class="list-item__title">{{ officerName(party) }}</div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-list class="pt-0 pb-0">
            <v-list-item class="email-address-list-item">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Email Address</v-list-item-title>
                <v-list-item-subtitle class="email-address-text">
                  {{ party.officer.email || 'Not Entered'}}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="delivery-address-list-item">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Delivery Address</v-list-item-title>
                <v-list-item-subtitle>
                  <ul class="address-subtitle pre-line" v-if="party.deliveryAddress">
                    <li class="address-line1">{{ party.deliveryAddress.streetAddress }}</li>
                    <li class="address-line2">{{ party.deliveryAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">{{ party.deliveryAddress.addressCity }}
                                              {{ party.deliveryAddress.addressRegion }}
                                              {{ party.deliveryAddress.postalCode }}</li>
                    <li class="address-line4">{{ getCountryName(party.deliveryAddress.addressCountry) }}</li>
                  </ul>
                  <ul class="address-subtitle pre-line" v-else>
                    <li class="delivery-address-not-entered">Not Entered</li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <div v-if="party.mailingAddress">
                    <span class="same-as-above"
                      v-if="isSame(party.deliveryAddress, party.mailingAddress, 'id')">
                      Same as above
                    </span>
                    <ul v-else class="address-subtitle pre-line">
                      <li class="address-line1">{{ party.mailingAddress.streetAddress }}</li>
                      <li class="address-line2">{{ party.mailingAddress.streetAddressAdditional }}</li>
                      <li class="address-line3">{{ party.mailingAddress.addressCity }}
                                                {{ party.mailingAddress.addressRegion }}
                                                {{ party.mailingAddress.postalCode }}</li>
                      <li class="address-line4">{{ getCountryName(party.mailingAddress.addressCountry) }}</li>
                    </ul>
                  </div>
                  <div class="mailing-address-not-entered" v-else>
                    <span>Not Entered</span>
                  </div>
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
import { Getter } from 'vuex-class'
import { CommonMixin, CountriesProvincesMixin } from '@/mixins'
import { PartyIF } from '@/interfaces'
import { Roles } from '@/enums'

@Component({})
export default class ProprietorPartnersListSm extends Mixins(CommonMixin, CountriesProvincesMixin) {
  /** Whether to display "complete your filing" instead of the proprietor / partners list. */
  @Prop({ default: false })
  readonly showCompleteYourFilingMessage: boolean

  /** Whether to gray out (disable) the proprietor / partners list. */
  @Prop({ default: false })
  readonly showGrayedOut: boolean

  @Getter getParties!: PartyIF[]
  @Getter isSoleProp!: boolean
  @Getter isPartnership!: boolean

  /** The proprietor / partners list. */
  get proprietorPartners (): PartyIF[] {
    if (this.isSoleProp) {
      // return array with the proprietor
      return [ this.getParties.find(party => party.roles.some(role => role.roleType === Roles.PROPRIETOR)) ]
    }
    if (this.isPartnership) {
      // return array with all partners
      return this.getParties.filter(party => party.roles.some(role => role.roleType === Roles.PARTNER))
    }
    return []
  }

  /** Whether to appear disabled. */
  protected get disabled (): boolean {
    return (this.showCompleteYourFilingMessage || this.showGrayedOut)
  }

  /** Returns formatted officer name or organization name. */
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

#proprietor-partners-list-sm.disabled {
  opacity: 0.6;
}

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

::v-deep .v-expansion-panel-content__wrap {
  padding-right: 1rem;
  padding-left: 1rem;
  padding-bottom: 1rem;
}

.v-avatar {
  flex: 0 0 auto;
  color: $gray0;
  font-size: $px-14;
}

// Director Address Information
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
