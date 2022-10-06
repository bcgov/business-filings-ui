<template>
  <div id="director-list-sm" :class="{ 'disabled': disabled }">
    <div v-if="showCompleteYourFilingMessage">
      <span class="complete-filing">Complete your filing to display</span>
    </div>

    <v-expansion-panels v-else accordion multiple>
      <!-- when grayed out, disable expansion -->
      <v-expansion-panel class="align-items-top address-panel"
        v-for="director in directors"
        :key="director.id"
        :disabled="disabled"
      >
        <v-expansion-panel-header class="address-panel-toggle">
          <div class="avatar-container">
            <v-avatar color="primary" size="25">{{ director.officer.firstName.substring(0,1) }}</v-avatar>
          </div>
          <div class="list-item__title">
            {{ director.officer.firstName }} {{ director.officer.middleInitial }} {{ director.officer.lastName }}
          </div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-list class="pt-0 pb-0">
            <v-list-item class="delivery-address-list-item" v-if="director.deliveryAddress">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Delivery Address</v-list-item-title>
                <v-list-item-subtitle>
                  <ul class="address-subtitle pre-line">
                    <li class="address-line1">{{ director.deliveryAddress.streetAddress }}</li>
                    <li class="address-line2">{{ director.deliveryAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">{{ director.deliveryAddress.addressCity }}
                                              {{ director.deliveryAddress.addressRegion }}
                                              {{ director.deliveryAddress.postalCode }}</li>
                    <li class="address-line4">{{ getCountryName(director.deliveryAddress.addressCountry) }}</li>
                  </ul>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item class="mailing-address-list-item" v-if="director.mailingAddress">
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="same-as-above"
                    v-if="isSame(director.deliveryAddress, director.mailingAddress, 'id')"
                  >
                    <span>Same as above</span>
                  </div>
                  <ul v-else class="address-subtitle pre-line">
                    <li class="address-line1">{{ director.mailingAddress.streetAddress }}</li>
                    <li class="address-line2">{{ director.mailingAddress.streetAddressAdditional }}</li>
                    <li class="address-line3">{{ director.mailingAddress.addressCity }}
                                              {{ director.mailingAddress.addressRegion }}
                                              {{ director.mailingAddress.postalCode }}</li>
                    <li class="address-line4">{{ getCountryName(director.mailingAddress.addressCountry) }}</li>
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
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CommonMixin, CountriesProvincesMixin, DirectorMixin } from '@/mixins'
import { DirectorIF, PartyIF } from '@/interfaces'
import { Roles } from '@/enums'

@Component({
  mixins: [
    CommonMixin,
    CountriesProvincesMixin,
    DirectorMixin
  ]
})
export default class DirectorListSm extends Vue {
  /** Whether to display "complete your filing" instead of the director list. */
  @Prop({ default: false }) readonly showCompleteYourFilingMessage!: boolean

  /** Whether to gray out (disable) the director list. */
  @Prop({ default: false }) readonly showGrayedOut!: boolean

  @Getter getParties!: PartyIF[]

  /** The directors list. */
  get directors (): DirectorIF[] {
    const directors = this.getParties.filter(
      party => party.roles?.some(role => role.roleType === Roles.DIRECTOR)
    )
    const directorsWithProps = directors.map((director: any, i: number) =>
      ({ ...director, id: i + 1 } as DirectorIF)
    )
    return directorsWithProps.sort(
      this.fieldSorter(['lastName', 'firstName', 'middleName'])
    )
  }

  /** Whether to appear disabled. */
  protected get disabled (): boolean {
    return (this.showCompleteYourFilingMessage || this.showGrayedOut)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

// Variables
$avatar-width: 2.75rem;

#director-list-sm.disabled {
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
