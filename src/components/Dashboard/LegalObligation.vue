<template>
  <div
    v-if="showLegalObligation && !!getObligations && isBusinessWithNoMaintenanceFilings && isBusiness"
    class="legal-obligation-container"
  >
    <v-card
      flat
      class="legal-obligation-section"
    >
      <v-icon
        color="primary"
        class="mr-2"
      >
        mdi-information-outline
      </v-icon>
      <div>
        <span class="font-weight-bold obligations-title">{{ getObligations.title }}</span>
        <span class="obligations-copy">
          You are required by the <em>{{ getObligations.act }}</em> {{ getObligations.obligationStatement }}
        </span>
        <p
          class="app-blue cursor-pointer mt-2 mb-0"
          @click="readMoreFlag = true"
        >
          <span v-if="!readMoreFlag"><u>Read more about your obligations</u></span>
        </p>

        <div
          v-if="readMoreFlag"
          class="mb-4"
        >
          <div class="obligations-copy pt-2">
            {{ getObligations.subtitle }}
          </div>
          <div class="pt-2">
            <ul>
              <li
                v-for="(changes, index) in getObligations.includedChanges"
                :key="index"
                class="obligations-copy"
              >
                <span class="font-weight-bold">{{ changes.label }}</span> - {{ changes.description }}
              </li>
            </ul>
          </div>
          <div class="pt-2">
            <a
              :href="getObligations.detailInfoURL"
              target="_blank"
            >Find out more detailed information</a>
            <v-icon
              color="primary"
              class="ml-1"
              small
            >
              mdi-open-in-new
            </v-icon>
          </div>
          <div class="pt-6">
            <span
              class="app-blue cursor-pointer"
              @click="readMoreFlag = false"
            ><u>Read less</u></span>
          </div>
        </div>

        <div class="legal-obligation-btn-panel float-right mt-2">
          <v-btn
            id="dismiss-btn"
            color="primary"
            height="25"
            width="90"
            @click="showLegalObligation = false"
          >
            <span>Dismiss</span>
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import ResourceLookupMixin from '@/mixins/resource-lookup-mixin'
import { useBusinessStore, useRootStore } from '@/stores'

@Component({})
export default class LegalObligation extends Mixins(ResourceLookupMixin) {
  @Getter(useBusinessStore) isActive!: boolean
  @Getter(useRootStore) isBusinessWithNoMaintenanceFilings!: boolean

  readMoreFlag = false
  showLegalObligation = null as boolean

  /** Whether this entity is a business (and not a temporary registration). */
  get isBusiness (): boolean {
    return !!sessionStorage.getItem('BUSINESS_ID')
  }

  /** Sets initial value of showLegalObligation (and any changes). */
  @Watch('isActive', { immediate: true })
  onIsActiveChanged () {
    this.showLegalObligation = this.isActive
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.legal-obligation-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.legal-obligation-section {
    display: flex;
    align-items: flex-start;
    padding: 1.2rem;
    font-size: $px-15;
    width: 75%;
}

.obligations-title {
  color: $gray9;
}

.obligations-copy {
  color: $gray7;
}

ul {
  list-style-type: disc;
}

li {
  padding-top: 0.25rem;
}
</style>
