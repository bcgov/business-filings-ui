<template>
  <v-card flat class="pt-6 px-4">
    <v-row no-gutters>
      <v-col cols="12" sm="3">
        <label class="title-label">Jurisdiction</label>
      </v-col>
      <v-col cols="12" sm="9">
        <v-select
          id="country-selector"
          :items="countryNames"
          v-model="selectedCountry"
          filled
          placeholder="Jurisdiction Country"
          :rules="countryRules"
          @change="emitChangedCountry($event)"
        />
        <v-select
          v-if="canadaUsaRegions.length > 0"
          id="region-selector"
          :items="canadaUsaRegions"
          v-model="selectedRegion"
          filled
          placeholder="Jurisdiction Province"
          :rules="regionRules"
          @change="emitChangedRegion($event)"
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
  selectedCountry = ''
  selectedRegion = ''

  /** Get country names as an array of strings. */
  get countryNames (): string[] {
    return this.getCountries().map(country => country.name)
  }

  /** Get the respective regions of the country selected as an array of strings. */
  get canadaUsaRegions (): string[] {
    if (this.selectedCountry === 'Canada') {
      let regions = this.getCountryRegions('CA').map(region => region.name)
      regions = regions.filter(province => province !== 'British Columbia')
      regions.push('Federal')
      return regions
    } else if (this.selectedCountry === 'United States of America') {
      return this.getCountryRegions('US').map(region => region.name)
    }
    return []
  }

  /** Validation rules for the Jurisdiction Country dropdown. */
  get countryRules (): Array<(val) => boolean | string> {
    return [
      val => (val && val.trim().length > 0) || 'Jurisdiction Country is required.'
    ]
  }

  /** Validation rules for the Jurisdiction Region dropdown. */
  get regionRules (): Array<(val) => boolean | string> {
    return [
      val => (val && val.trim().length > 0) || 'Jurisdiction Region is required.'
    ]
  }

  /** Emit event whenever a country is selected. */
  @Emit('update:country')
  emitChangedCountry (): void {
    this.selectedRegion = ''
    if (this.selectedCountry !== '') {
      if (this.selectedCountry === 'Canada' || this.selectedCountry === 'United States of America') {
        this.validateRegions()
      } else {
        this.emitValid(true)
      }
    } else {
      this.emitValid(false)
    }
  }

  /** Helper function to validate if a region is selected when applicable. */
  private validateRegions (): void {
    if (this.canadaUsaRegions.length > 0) {
      if (this.selectedRegion !== '') {
        this.emitValid(true)
      } else {
        this.emitValid(false)
      }
    }
  }

  /** Emit event whenever a region is selected. */
  @Emit('update:region')
  emitChangedRegion (): void { /* no empty function */ }

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
</style>
