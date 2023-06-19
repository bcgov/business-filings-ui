<template>
  <v-card
    id="foreign-jurisdiction"
    flat
  >
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="3"
      >
        <label class="title-label">Jurisdiction</label>
      </v-col>
      <v-col
        cols="12"
        sm="9"
      >
        <v-select
          id="country-selector"
          ref="countrySelectRef"
          v-model="selectedCountryName"
          :items="getCountries()"
          item-text="name"
          filled
          placeholder="Jurisdiction Country"
          :rules="countryRules"
          immediate:
          true
          menu-props="auto"
          @input="emitChangedCountry($event)"
        />
        <v-select
          v-if="canadaUsaRegions.length > 0"
          id="region-selector"
          ref="regionSelectRef"
          v-model="selectedRegionName"
          :items="canadaUsaRegions"
          item-text="name"
          filled
          placeholder="Jurisdiction Region"
          :rules="regionRules"
          immediate:
          true
          @input="emitChangedRegion($event)"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Watch } from 'vue-property-decorator'
import { CountriesProvincesMixin } from '@/mixins'

@Component({})
export default class ForeignJurisdiction extends Mixins(CountriesProvincesMixin) {
    // Refs
    $refs!: {
      countrySelectRef: any
      regionSelectRef: any
  }

  /** Country passed into this component. */
  @Prop({ default: () => '' }) readonly draftCountry!: string

  /** Region passed into this component. */
  @Prop({ default: () => '' }) readonly draftRegion!: string

  /** Prompt the validations. Used for global validations. */
  @Prop({ default: false }) readonly validateForm!: boolean

  selectedCountryName = ''
  selectedRegionName = ''

  /** Restore the selected country and region from draft filing if applicable. */
  mounted (): void {
    if (this.draftCountry) {
      this.selectedCountryName = this.getCountryNameFromCode(this.draftCountry)
      this.emitChangedCountry()
    }
    if (this.draftRegion) {
      this.selectedRegionName = this.getRegionNameFromCode(this.draftRegion)
      this.emitChangedRegion()
    }
  }

  /** Get the respective regions of the country selected as an array of objects. */
  get canadaUsaRegions (): Array<object> {
    if (this.selectedCountryName === 'Canada') {
      let regions = this.getCountryRegions('CA')
      regions = regions.filter(province => province.short !== 'BC')
      regions.push({ name: 'Federal', short: 'FEDERAL' })
      return regions
    } else if (this.selectedCountryName === 'United States of America') {
      return this.getCountryRegions('US')
    }
    return []
  }

  /** Validation rules for the Jurisdiction Country dropdown. */
  get countryRules (): Array<(val) => boolean | string> {
    return [
      val => !!(val) || 'Jurisdiction Country is required.'
    ]
  }

  /** Validation rules for the Jurisdiction Region dropdown. */
  get regionRules (): Array<(val) => boolean | string> {
    return [
      val => !!(val) || 'Jurisdiction Region is required.'
    ]
  }

  /** Get the selected country's code. */
  get selectedCountryCode (): string {
    const countryCode = this.getCountries().find(country => country.name === this.selectedCountryName)
    return countryCode?.code
  }

  /** Helper function to get a country's name when given the code.
   * @example ('CA') -> 'Canada'
   */
  private getCountryNameFromCode (code: string): string {
    const country = this.getCountries().find(country => country.code === code)
    return country?.name
  }

  /** Helper function to get a region's name when given the short.
   * @example ('AB') -> 'Alberta'
   * @example ('NY') -> 'New York'
   */
  private getRegionNameFromCode (short: string): string {
    const region = this.canadaUsaRegions?.find(region => region.short === short)
    return region?.name
  }

  @Watch('draftCountry')
  onDraftCountryChanged (val: string): void {
    this.selectedCountryName = val
  }

  @Watch('draftRegion')
  onDraftRegionChanged (val: string): void {
    this.selectedRegionName = val
  }

  /** Validate country field */
  @Watch('validateForm')
  validateForeignJurisdiction (): void {
    if (this.validateForm && !this.selectedCountryName) {
      this.$refs.countrySelectRef.validate()
      this.$refs.countrySelectRef.error = true
    }
  }

  /** Validate region field */
  @Watch('selectedCountryName')
  @Watch('validateForm')
  async onCountrychanged (): Promise<void> {
    if (this.validateForm) {
      await this.$nextTick()
      if (this.selectedCountryName === 'Canada' || this.selectedCountryName === 'United States of America') {
        this.$refs.regionSelectRef.validate()
        this.$refs.regionSelectRef.error = true
      }
    }
  }

  /** Emit the selected country's code whenever a new country is selected. */
  @Emit('update:country')
  emitChangedCountry (): string {
    this.selectedRegionName = ''
    this.emitChangedRegion()
    if (this.selectedCountryName === 'Canada' || this.selectedCountryName === 'United States of America') {
      this.emitValid(false)
    } else {
      this.emitValid(true)
    }
    return this.selectedCountryCode
  }

  /** Emit the selected country's region short whenever a new region is selected. */
  @Emit('update:region')
  emitChangedRegion (): string {
    if (this.selectedRegionName) {
      this.emitValid(true)
    }
    const region = this.canadaUsaRegions.find(region => region.name === this.selectedRegionName)
    return region?.short
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
