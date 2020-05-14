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
          <div class="list-item__title">{{ director.officer.firstName }} {{ director.officer.lastName }}</div>
        </v-expansion-panel-header>

        <v-expansion-panel-content>
          <v-list class="pt-0 pb-0">
            <v-list-item class="delivery-address-list-item"
              v-if="director.deliveryAddress"
            >
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

            <v-list-item class="mailing-address-list-item"
              v-if="director.mailingAddress"
            >
              <v-list-item-content>
                <v-list-item-title class="mb-2 address-title">Mailing Address</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="same-as-above"
                    v-if="isSame(director.deliveryAddress, director.mailingAddress)"
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
// Vue Libraries
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { mapState } from 'vuex'

// Mixins
import { CountriesProvincesMixin, CommonMixin } from '@/mixins'

@Component({
  computed: {
    ...mapState(['directors'])
  }
})
export default class DirectorListSm extends Mixins(CountriesProvincesMixin, CommonMixin) {
  readonly directors: Array<object>

  /** Whether to display "complete your filing" instead of the director list. */
  @Prop({ default: false })
  private showCompleteYourFilingMessage: boolean

  /** Whether to gray out (disable) the director list. */
  @Prop({ default: false })
  private showGrayedOut: boolean

  /** Whether to appear disabled. */
  private get disabled (): boolean {
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
  font-size: 0.85rem;
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
  font-size: 0.85rem;
}

// Director Address Information
.v-list-item {
  padding: 0;
}

.v-list-item__title {
  font-size: 0.875rem;
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
