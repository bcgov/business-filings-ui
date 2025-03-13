<template>
  <div class="base-address">
    <!-- Display fields -->
    <v-expand-transition>
      <div
        v-if="!editing"
        class="address-block"
      >
        <div class="address-block__info pre-line">
          <div class="address-block__info-row street-address">
            {{ addressLocal.streetAddress }}
          </div>

          <div class="address-block__info-row street-address-additional">
            {{ addressLocal.streetAddressAdditional }}
          </div>

          <div class="address-block__info-row">
            <span class="address-city">{{ addressLocal.addressCity }}</span>

            <template v-if="addressLocal.addressRegion">
              <span class="address-region">&nbsp;{{ addressLocal.addressRegion }}</span>
            </template>

            <template v-if="addressLocal.postalCode">
              <span class="postal-code">&nbsp;{{ addressLocal.postalCode }}</span>
            </template>
          </div>

          <div class="address-block__info-row address-country">
            {{ getCountryName(addressCountry) }}
          </div>

          <template v-if="addressLocal.deliveryInstructions">
            <div class="address-block__info-row delivery-instructions mt-5 font-italic">
              {{ addressLocal.deliveryInstructions }}
            </div>
          </template>
        </div>
      </div>
    </v-expand-transition>

    <!-- Edit fields -->
    <v-expand-transition>
      <v-form
        v-if="editing"
        ref="addressForm"
        name="address-form"
        lazy-validation
      >
        <div class="form__row">
          <!-- NB1: AddressComplete needs to be enabled each time user clicks in this search field.
               NB2: Only process first keypress -- assumes if user moves between instances of this
                   component then they are using the mouse (and thus, clicking). -->
          <v-text-field
            :id="streetAddressId"
            v-model="addressLocal.streetAddress"
            autocomplete="chrome-off"
            :name="Math.random()"
            filled
            class="street-address"
            :hint="streetAddressHint"
            persistent-hint
            :label="streetAddressLabel"
            :rules="[...rules.streetAddress, ...spaceRules]"
            @keypress.once="enableAddressComplete()"
            @click="enableAddressComplete()"
          />
        </div>
        <div class="form__row">
          <v-textarea
            v-model="addressLocal.streetAddressAdditional"
            autocomplete="chrome-off"
            :name="Math.random()"
            auto-grow
            filled
            class="street-address-additional"
            :label="streetAddressAdditionalLabel"
            rows="1"
            :rules="[...rules.streetAddressAdditional, ...spaceRules]"
          />
        </div>
        <div class="form__row three-column">
          <v-text-field
            v-model="addressLocal.addressCity"
            filled
            class="item address-city"
            :label="addressCityLabel"
            :rules="[...rules.addressCity, ...spaceRules]"
          />
          <v-select
            v-if="useCountryRegions(addressCountry)"
            v-model="addressLocal.addressRegion"
            filled
            class="item address-region"
            :menu-props="{maxHeight:'40rem'}"
            :label="addressRegionLabel"
            item-text="name"
            item-value="short"
            :items="isAddressCountryCanadaAndExcludeBc ? getCanadaRegionsExcludeBC() :
              getCountryRegions(addressCountry)"
            :rules="[...rules.addressRegion, ...spaceRules]"
          />
          <v-text-field
            v-else
            v-model="addressLocal.addressRegion"
            filled
            class="item address-region"
            :label="addressRegionLabel"
            :rules="[...rules.addressRegion, ...spaceRules]"
          />
          <v-text-field
            v-model="addressLocal.postalCode"
            filled
            class="item postal-code"
            :label="postalCodeLabel"
            :rules="[...rules.postalCode, ...spaceRules]"
          />
        </div>
        <div class="form__row">
          <v-select
            v-model="addressLocal.addressCountry"
            filled
            class="address-country"
            :label="addressCountryLabel"
            menu-props="auto"
            item-text="name"
            item-value="code"
            :items="getCountries()"
            :rules="[...rules.addressCountry, ...spaceRules]"
          />
          <!-- special field to select AddressComplete country, separate from our model field -->
          <input
            :id="addressCountryId"
            type="hidden"
            :value="addressCountry"
          >
        </div>
        <div class="form__row">
          <v-textarea
            v-model="addressLocal.deliveryInstructions"
            auto-grow
            filled
            class="delivery-instructions"
            :label="deliveryInstructionsLabel"
            rows="2"
            :rules="[...rules.deliveryInstructions, ...spaceRules]"
          />
        </div>
      </v-form>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { required } from 'vuelidate/lib/validators'
import { Component, Mixins, Emit, Prop, Watch } from 'vue-property-decorator'
import { Validations } from 'vuelidate-property-decorators'
import { uniqueId } from 'lodash'
import { ValidationMixin, CountriesProvincesMixin } from '@bcrs-shared-components/mixins'

/**
 * The component for displaying and editing an address.
 * Vuelidate is used to implement the validation rules (eg, what 'required' means and whether it's satisfied).
 * Vuetify is used to display any validation errors/styling.
 * Optionally uses Canada Post AddressComplete (aka Postal Code Anywhere - PCA) for address lookup.
 */
@Component({
  mixins: [ValidationMixin, CountriesProvincesMixin]
})
export default class BaseAddress extends Mixins(ValidationMixin, CountriesProvincesMixin) {
  /**
   * The validation object used by Vuelidate to compute address model validity.
   * @returns the Vuelidate validations object
   */
  @Validations()
  public validations (): any {
    return { addressLocal: { ...this.schemaLocal } }
  }

  /**
   * The address to be displayed/edited.
   * Default is "empty address" in case parent doesn't provide it (eg, for new address).
   */
  @Prop({
    default: () => ({
      streetAddress: '',
      streetAddressAdditional: '',
      addressCity: '',
      addressRegion: '',
      postalCode: '',
      addressCountry: '',
      deliveryInstructions: ''
    })
  })
  readonly address: object

  /** Whether the address should be shown in editing mode (true) or display mode (false). */
  @Prop({ default: false })
  readonly editing: boolean

  /** The address schema containing Vuelidate rules. */
  @Prop({ default: null })
  readonly schema: any

  @Prop({ default: false })
  readonly noPoBox: boolean

  @Prop({ default: '' })
  readonly deliveryInstructionsText: string

  @Prop({ default: false })
  readonly excludeBC: boolean

  /** A local (working) copy of the address, to contain the fields edited by the component (ie, the model). */
  addressLocal: object = {}

  /** A local (working) copy of the address schema. */
  schemaLocal: any = {}

  /** A unique id for this instance of this component. */
  uniqueId = uniqueId()

  /** A unique id for the Street Address input. */
  get streetAddressId (): string {
    return `street-address-${this.uniqueId}`
  }

  /** A unique id for the Address Country input. */
  get addressCountryId (): string {
    return `address-country-${this.uniqueId}`
  }

  /** The Address Country, to simplify the template and so we can watch it below. */
  get addressCountry (): string {
    return this.addressLocal['addressCountry']
  }

  get isAddressCountryCanadaAndExcludeBc (): boolean {
    return this.addressLocal['addressCountry'] === 'CA' && this.excludeBC
  }

  /** The Street Address Additional label with 'optional' as needed. */
  get streetAddressAdditionalLabel (): string {
    return 'Additional Street Address' + (this.isSchemaRequired('streetAddressAdditional') ? '' : ' (Optional)')
  }

  /** The Street Address label with 'optional' as needed. */
  get streetAddressLabel (): string {
    return 'Street Address' + (this.isSchemaRequired('streetAddress') ? '' : ' (Optional)')
  }

  /** The Address City label with 'optional' as needed. */
  get addressCityLabel (): string {
    return 'City' + (this.isSchemaRequired('addressCity') ? '' : ' (Optional)')
  }

  /** The Address Region label with 'optional' as needed. */
  get addressRegionLabel (): string {
    let label: string
    let required = this.isSchemaRequired('addressRegion')

    // NB: make region required for Canada and USA
    if (this.addressLocal['addressCountry'] === 'CA') {
      label = 'Province'
      required = true
    } else if (this.addressLocal['addressCountry'] === 'US') {
      label = 'State'
      required = true
    } else {
      label = 'Province/State'
    }

    return label + (required ? '' : ' (Optional)')
  }

  /** The Postal Code label with 'optional' as needed. */
  get postalCodeLabel (): string {
    let label: string
    if (this.addressLocal['addressCountry'] === 'US') {
      label = 'Zip Code'
    } else {
      label = 'Postal Code'
    }
    return label + (this.isSchemaRequired('postalCode') ? '' : ' (Optional)')
  }

  /** The Address Country label with 'optional' as needed. */
  get addressCountryLabel (): string {
    return 'Country' + (this.isSchemaRequired('addressCountry') ? '' : ' (Optional)')
  }

  /** The Delivery Instructions label with 'optional' as needed. */
  get deliveryInstructionsLabel (): string {
    if (this.deliveryInstructionsText) {
      return this.deliveryInstructionsText + (this.isSchemaRequired('deliveryInstructions') ? '' : ' (Optional)')
    } else {
      return 'Delivery Instructions' + (this.isSchemaRequired('deliveryInstructions') ? '' : ' (Optional)')
    }
  }

  get streetAddressHint (): string {
    return this.noPoBox ? 'Address cannot be a PO Box' : ''
  }

  /** Whether the specified prop is required according to the schema. */
  isSchemaRequired (prop: string): boolean {
    return Boolean(this.schemaLocal && this.schemaLocal[prop] && this.schemaLocal[prop].required)
  }

  /** Array of validation rules used by input elements to prevent extra whitespace. */
  readonly spaceRules: Array<(v: string) => boolean | string> = [
    v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
    v => !/\s$/g.test(v) || 'Invalid spaces', // trailing spaces
    v => !/\s\s/g.test(v) || 'Invalid word spacing' // multiple inline spaces
  ]

  /**
   * The Vuetify rules object. Used to display any validation errors/styling.
   * NB: As a getter, this is initialized between created() and mounted().
   * @returns the Vuetify validation rules object
   */
  get rules (): { [attr: string]: Array<() => boolean | string> } {
    return this.createVuetifyRulesObject('addressLocal') as { [attr: string]: Array<() => boolean | string> }
  }
  /** Emits an update message for the address prop, so that the caller can ".sync" with it. */
  @Emit('update:address')
  emitAddress (address: object): void { }

  /** Emits the validity of the address entered by the user. */
  @Emit('valid')
  emitValid (valid: boolean): void { }

  /**
   * Watches changes to the Schema object, so that if the parent changes the data, then
   * the working copy of it is updated.
   */
  @Watch('schema', { deep: true, immediate: true })
  onSchemaChanged (): void {
    this.schemaLocal = { ...this.schema }
  }

  /**
   * Watches changes to the Address object, so that if the parent changes the data, then
   * the working copy of it is updated.
   */
  @Watch('address', { deep: true, immediate: true })
  onAddressChanged (): void {
    this.addressLocal = { ...this.address }
  }

  /**
   * Watches changes to the Address Country and updates the schema accordingly.
   */
  @Watch('addressCountry')
  onAddressCountryChanged (): void {
    // skip this if component is called without a schema (eg, display mode)
    if (this.schema) {
      if (this.useCountryRegions(this.addressLocal['addressCountry'])) {
        // we are using a region list for the current country so make region a required field
        const addressRegion = { ...this.schema.addressRegion, required }
        // re-assign the local schema because Vue does not detect property addition
        this.schemaLocal = { ...this.schema, addressRegion }
      } else {
        // we are not using a region list for the current country so remove required property
        const { required, ...addressRegion } = this.schema.addressRegion
        // re-assign the local schema because Vue does not detect property deletion
        this.schemaLocal = { ...this.schema, addressRegion }
      }
    }
  }

  /**
   * Watches changes to the Address Local object, to catch any changes to the fields within the address.
   * Will notify the parent object with the new address and whether or not the address is valid.
   */
  @Watch('addressLocal', { deep: true, immediate: true })
  onAddressLocalChanged (): void {
    this.emitAddress(this.addressLocal)
    this.emitValid(!this.$v.$invalid)
  }

  /**
   * Determines whether to use a country's known regions (ie, provinces/states).
   * @param code the short code of the country
   * @returns whether to use v-select (true) or v-text-field (false) for input
   */
  useCountryRegions (code: string): boolean {
    return (code === 'CA' || code === 'US')
  }

  /** Enables AddressComplete for this instance of the address. */
  enableAddressComplete (): void {
    // If you want to use this component with the Canada Post AddressComplete service:
    // 1. The AddressComplete JavaScript script (and stylesheet) must be loaded.
    // 2. Your AddressComplete account key must be defined.
    const pca = window['pca']
    const key = window['addressCompleteKey']
    if (!pca || !key) {
      // eslint-disable-next-line no-console
      console.log('AddressComplete not initialized due to missing script and/or key')
      return
    }

    // Destroy the old object if it exists, and create a new one.
    if (window['currentAddressComplete']) {
      window['currentAddressComplete'].destroy()
    }
    window['currentAddressComplete'] = this.createAddressComplete(pca, key)
  }

  /**
   * Creates the AddressComplete object for this instance of the component.
   * @param pca the Postal Code Anywhere object provided by AddressComplete
   * @param key the key for the Canada Post account that is to be charged for lookups
   * @returns an object that is a pca.Address instance
   */
  createAddressComplete (pca, key: string): object {
    // Set up the two fields that AddressComplete will use for input.
    // Ref: https://www.canadapost.ca/pca/support/guides/advanced
    // Note: Use special field for country, which user can't click, and which AC will overwrite
    //       but that we don't care about.
    const fields = [
      { element: this.streetAddressId, field: 'Line1', mode: pca.fieldMode.SEARCH },
      { element: this.addressCountryId, field: 'CountryName', mode: pca.fieldMode.COUNTRY }
    ]
    const options = {
      key,
      bar: { visible: false }
    }

    const addressComplete = new pca.Address(fields, options)

    // The documentation contains sample load/populate callback code that doesn't work, but this will. The side effect
    // is that it breaks the autofill functionality provided by the library, but we really don't want the library
    // altering the DOM because Vue is already doing so, and the two don't play well together.
    addressComplete.listen('populate', this.addressCompletePopulate)

    return addressComplete
  }

  /**
   * Callback to update the address data after the user chooses a suggested address.
   * @param address the data object returned by the AddressComplete Retrieve API
   */
  addressCompletePopulate (address: object): void {
    const newAddressLocal: object = {}

    newAddressLocal['streetAddress'] = address['Line1'] || 'N/A'
    // Combine extra address lines into Street Address Additional field.
    newAddressLocal['streetAddressAdditional'] = this.combineLines(
      this.combineLines(address['Line2'], address['Line3']),
      this.combineLines(address['Line4'], address['Line5'])
    )
    newAddressLocal['addressCity'] = address['City']
    if (this.useCountryRegions(address['CountryIso2'])) {
      // In this case, v-select will map known province code to province name
      // or v-select will be blank and user will have to select a known item.
      newAddressLocal['addressRegion'] = address['ProvinceCode']
    } else {
      // In this case, v-text-input will allow manual entry but province info is probably too long
      // so set region to null and add province name to the Street Address Additional field.
      // If length is excessive, user will have to fix it.
      newAddressLocal['addressRegion'] = null
      newAddressLocal['streetAddressAdditional'] = this.combineLines(
        newAddressLocal['streetAddressAdditional'], address['ProvinceName']
      )
    }
    newAddressLocal['postalCode'] = address['PostalCode']
    newAddressLocal['addressCountry'] = address['CountryIso2']

    // re-assign the local address to force Vuetify update
    this.addressLocal = newAddressLocal

    // Validate the form, in case any fields are missing or incorrect.
    Vue.nextTick(() => { (this.$refs.addressForm as any).validate() })
  }

  combineLines (line1: string, line2: string) {
    if (!line1) return line2
    if (!line2) return line1
    return line1 + '\n' + line2
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

// Address Block Layout
.address-block {
  display: flex;
}

.address-block__info {
  flex: 1 1 auto;
}

.address-block__info-row {
  color: $gray7;
}

// Form Row Elements
.form__row.three-column {
  align-items: stretch;
  display: flex;
  flex-flow: row nowrap;
  margin-left: -0.5rem;
  margin-right: -0.5rem;

  .item {
    flex: 1 1 auto;
    flex-basis: 0;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
}

// text field labels
::v-deep .v-label {
  color: $gray7;
  font-size: $px-16;
  font-weight: normal;
}

// text field inputs
::v-deep {
  .v-input input {
    color: $gray9;
  }
}

.pre-line {
  white-space: pre-line;
}

// make 'readonly' inputs looks disabled
// (can't use 'disabled' because we want normal error styling)
.v-select.v-input--is-readonly,
.v-text-field.v-input--is-readonly {
  pointer-events: none;

  ::v-deep .v-label {
    // set label colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  ::v-deep .v-select__selection {
    // set selection colour to same as disabled
    color: rgba(0,0,0,.38);
  }

  ::v-deep .v-icon {
    // set error icon colour to same as disabled
    color: rgba(0,0,0,.38) !important;
    opacity: 0.6;
  }
}
</style>
