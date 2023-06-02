<template>
  <v-card flat id="foreign-jurisdiction">
    <v-row no-gutters>
      <v-col cols="12" sm="3">
        <label class="title-label">Jurisdiction</label>
      </v-col>
      <v-col cols="12" sm="9">
        <v-select
          id="country-selector"
          :items="getCountries()"
          item-text="name"
          v-model="selectedCountry"
          filled
          return-object
          placeholder="Jurisdiction Country"
          :rules="countryRules"
          menu-props="auto"
          @input="emitChangedCountry($event)"
        />
        <v-select
          v-if="canadaUsaRegions.length > 0"
          id="region-selector"
          :items="canadaUsaRegions"
          item-text="name"
          v-model="selectedRegion"
          filled
          return-object
          placeholder="Jurisdiction Region"
          :rules="regionRules"
          @input="emitChangedRegion($event)"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Mixins } from 'vue-property-decorator'
import { CountriesProvincesMixin } from '@/mixins'

@Component({})
export default class ForeignJurisdiction extends Mixins(CountriesProvincesMixin) {
  selectedCountry = {}
  selectedRegion = {}

  /** Get the respective regions of the country selected as an array of objects. */
  get canadaUsaRegions (): Array<object> {
    if (this.selectedCountry.code === 'CA') {
      let regions = this.getCountryRegions('CA')
      regions = regions.filter(province => province.short !== 'BC')
      regions.push({ name: 'Federal', short: 'FD' })
      return regions
    } else if (this.selectedCountry.code === 'US') {
      return this.getCountryRegions('US')
    }
    return []
  }

  /** Validation rules for the Jurisdiction Country dropdown. */
  get countryRules (): Array<(val) => boolean | string> {
    return [
      val => !!(val.code) || 'Jurisdiction Country is required.'
    ]
  }

  /** Validation rules for the Jurisdiction Region dropdown. */
  get regionRules (): Array<(val) => boolean | string> {
    return [
      val => !!(val.short) || 'Jurisdiction Region is required.'
    ]
  }

  /** Emit event whenever a country is selected. */
  @Emit('update:country')
  emitChangedCountry (): object {
    this.selectedRegion = {}
    if (this.selectedCountry.name !== '') {
      if (this.selectedCountry.code === 'CA' || this.selectedCountry.code === 'US') {
        this.validateRegions()
      } else {
        this.emitValid(true)
      }
    } else {
      this.emitValid(false)
    }
    return this.selectedCountry
  }

  /** Helper function to validate if a region is selected when applicable. */
  private validateRegions (): void {
    if (this.canadaUsaRegions.length > 0) {
      if (!this.selectedRegion) {
        this.emitValid(true)
      } else {
        this.emitValid(false)
      }
    }
  }

  /** Emit event whenever a region is selected. */
  @Emit('update:region')
  emitChangedRegion (): object {
    return this.selectedRegion
  }

  /** Emits an event indicating whether or not the form is valid. */
  @Emit('valid')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitValid (valid: boolean): void { /* no empty function */ }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
.title-label {
  color: $gray9;
  font-weight: bold;
}

// Vuetify Overrides
:deep(.v-select__selection--comma) {
  overflow: inherit;
}
</style>
