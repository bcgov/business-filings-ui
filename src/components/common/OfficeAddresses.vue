<template>
  <div id="office-addresses">
    <v-card flat>
      <ul class="list address-list" :class="{ 'show-address-form' : showAddressForm }">
        <!-- Registered Office Section -->
        <div class="address-edit-header" v-if="showAddressForm">
          <label class="address-edit-title">Registered Office</label>
        </div>

        <!-- Registered Delivery Address -->
        <li class="address-list-container registered-delivery-address">
          <div class="meta-container">
            <label v-if="!showAddressForm">Registered Office</label>
            <label v-else>Delivery Address</label>

            <div class="meta-container__inner">
              <label v-if="!showAddressForm"><strong>Delivery Address</strong></label>

              <div class="address-wrapper">
                <delivery-address
                  :address="deliveryAddress"
                  :editing="showAddressForm"
                  :schema="officeAddressSchema"
                  @update:address="updateBaseAddress(deliveryAddress, $event)"
                  @valid="deliveryAddressValid=$event"
                />
              </div>

              <!-- Change and Reset Buttons -->
              <v-expand-transition>
                <div class="address-block__actions">
                  <v-btn
                    color="primary"
                    text
                    id="reg-off-addr-change-btn"
                    small
                    v-if="!showAddressForm && componentEnabled"
                    @click="showAddressForm=true"
                  >
                    <v-icon small>mdi-pencil</v-icon>
                    <span>Change</span>
                  </v-btn>
                  <br />
                  <v-btn
                    class="reset-btn"
                    color="error"
                    id="reg-off-addr-reset-btn"
                    outlined
                    small
                    v-if="!showAddressForm && anyModified"
                    @click="resetAddresses()"
                  >
                    <span>Reset</span>
                  </v-btn>
                </div>
                </v-expand-transition>
            </div>
          </div>
        </li>

        <!-- Registered Mailing Address -->
        <li class="address-list-container registered-mailing-address">
          <div class="meta-container">
            <label>{{ showAddressForm ? "Mailing Address" : "" }}</label>
            <div class="meta-container__inner">
              <label v-if="!showAddressForm
                && !isSame(deliveryAddress, mailingAddress, ['actions','addressType'])"
              >
                <strong>Mailing Address</strong>
              </label>
              <div class="form__row">
                <v-checkbox
                  class="inherit-checkbox"
                  label="Same as Delivery Address"
                  v-if="showAddressForm"
                  v-model="inheritDeliveryAddress"
                />
              </div>
              <div class="address-wrapper" v-if="showAddressForm ||
                !isSame(deliveryAddress, mailingAddress, ['actions','addressType'])"
              >
                <mailing-address
                  v-if="!showAddressForm || !inheritDeliveryAddress"
                  :address="mailingAddress"
                  :editing="showAddressForm"
                  :schema="officeAddressSchema"
                  @update:address="updateBaseAddress(mailingAddress, $event)"
                  @valid="mailingAddressValid=$event"
                />
              </div>
              <span v-else id="regMailSameAsDeliv">Mailing Address same as above</span>
            </div>
          </div>
        </li>

        <div v-if="isBComp">
          <div class="address-edit-header" v-if="showAddressForm">
            <label class="address-edit-title">Records Office</label>
            <v-checkbox
              class="records-inherit-checkbox"
              label="Same as Registered Office"
              v-if="showAddressForm"
              v-model="inheritRegisteredAddress"
            />
          </div>

          <div v-if="!inheritRegisteredAddress">
            <!-- Records Delivery Address -->
            <li class="address-list-container records-delivery-address">
              <div class="meta-container">
                <label v-if="!showAddressForm">Records Office</label>
                <label v-else>Delivery Address</label>

                <div class="meta-container__inner">
                  <label v-if="!showAddressForm"><strong>Delivery Address</strong></label>
                  <div class="address-wrapper">
                    <delivery-address
                      :address="recDeliveryAddress"
                      :editing="showAddressForm"
                      :schema="officeAddressSchema"
                      @update:address="updateBaseAddress(recDeliveryAddress, $event)"
                      @valid="recDeliveryAddressValid=$event"
                    />
                  </div>
                </div>
              </div>
            </li>

            <!-- Records Mailing Address -->
            <li class="address-list-container records-mailing-address">
              <div class="meta-container">
                <label>{{ showAddressForm ? "Mailing Address" : "" }}</label>
                <div class="meta-container__inner">
                  <label v-if="!showAddressForm &&
                    !isSame(recDeliveryAddress, recMailingAddress, ['actions','addressType'])"
                  >
                    <strong>Mailing Address</strong>
                  </label>
                  <div class="form__row">
                    <v-checkbox
                      class="inherit-checkbox"
                      label="Same as Delivery Address"
                      v-if="showAddressForm"
                      v-model="inheritRecDeliveryAddress"
                    />
                  </div>
                  <div class="address-wrapper" v-if="showAddressForm ||
                    !isSame(recDeliveryAddress, recMailingAddress, ['actions','addressType'])"
                  >
                    <mailing-address
                      v-if="!showAddressForm || !inheritRecDeliveryAddress"
                      :address="recMailingAddress"
                      :editing="showAddressForm"
                      :schema="officeAddressSchema"
                      @update:address="updateBaseAddress(recMailingAddress, $event)"
                      @valid="recMailingAddressValid=$event"
                    />
                  </div>
                  <span v-else id="recMailSameAsDeliv">Mailing Address same as above</span>
                </div>
              </div>
            </li>
          </div>

          <div v-else>
            <li class="address-list-container" v-if="!showAddressForm">
              <div class="meta-container">
                <label>Records Office</label>
                <div class="meta-container__inner">
                  <span id="recSameAsReg">Same as Registered Office</span>
                </div>
              </div>
            </li>
          </div>
        </div>

        <!-- Form Button Section -->
        <li>
          <div class="form__row form__btns" v-show="showAddressForm">
            <v-btn
              class="update-btn"
              color="primary"
              id="reg-off-update-addr-btn"
              :disabled="!formValid"
              @click="updateAddresses()"
            >
              <span>Update Addresses</span>
            </v-btn>
            <v-btn
              id="reg-off-cancel-addr-btn"
              @click="cancelEditAddresses()"
            >
              <span>Cancel</span>
            </v-btn>
          </div>
        </li>
      </ul>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Emit, Prop, Watch } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { isEmpty } from 'lodash'
import { Getter } from 'vuex-class'
import { officeAddressSchema } from '@/schemas'
import BaseAddress from 'sbc-common-components/src/components/BaseAddress.vue'
import { CommonMixin } from '@/mixins'
import { RegRecAddressesIF, AddressIF } from '@/interfaces'
import { Actions } from '@/enums'

@Component({
  components: {
    'delivery-address': BaseAddress,
    'mailing-address': BaseAddress
  },
  mixins: [CommonMixin]
})
export default class OfficeAddresses extends Vue {
  /** Indicates whether this component should be enabled or not. */
  @Prop({ default: true }) readonly componentEnabled!: boolean

  /**
   * Addresses object from parent page, used to set our working addresses (4 properties below).
   * As needed, we emit this back to parent (ie, update/sync).
   */
  @Prop({ default: () => {} }) readonly addresses!: RegRecAddressesIF

  @Getter isBComp!: boolean
  @Getter getIdentifier!: string

  /** Effective date for fetching office addresses. */
  private asOfDate: string

  /** Original addresses object from Legal API. */
  private original = {} as RegRecAddressesIF

  // Working addresses data (also used as v-models for the BaseAddress components)
  private deliveryAddress = {} as AddressIF
  private mailingAddress = {} as AddressIF
  private recDeliveryAddress = {} as AddressIF
  private recMailingAddress = {} as AddressIF

  // Validation events from BaseAddress components
  private deliveryAddressValid = true
  private mailingAddressValid = true
  private recDeliveryAddressValid = true
  private recMailingAddressValid = true

  /** Whether to show the editable form for an address (true) or the static display address (false). */
  private showAddressForm = false

  /** V-model for "Registered Mailing Address same as Registered Delivery Address" checkbox. */
  private inheritDeliveryAddress = true

  /** V-model for "Records Mailing Address same as Records Delivery Address" checkbox. */
  private inheritRecDeliveryAddress = true

  /** V-model for "Records Addresses same as Registered Addresses" checkbox. */
  private inheritRegisteredAddress = true

  /** The Address schema containing Vuelidate rules. */
  private officeAddressSchema = officeAddressSchema

  /** Whether the address form is valid. */
  get formValid (): boolean {
    return ((this.deliveryAddressValid && (this.inheritDeliveryAddress || this.mailingAddressValid)) &&
      (this.recDeliveryAddressValid && (this.inheritRecDeliveryAddress || this.recMailingAddressValid)))
  }

  /** Whether any address has been modified from the original. */
  get anyModified (): boolean {
    return (
      !this.isSame(this.deliveryAddress, this.original?.registeredOffice?.deliveryAddress, ['actions']) ||
      !this.isSame(this.mailingAddress, this.original?.registeredOffice?.mailingAddress, ['actions']) ||
      !this.isSame(this.recDeliveryAddress, this.original?.recordsOffice?.deliveryAddress, ['actions']) ||
      !this.isSame(this.recMailingAddress, this.original?.recordsOffice?.mailingAddress, ['actions'])
    )
  }

  /** Fetches the office addresses on As Of Date from the Legal API. */
  // FUTURE: this API call should be in the parent component or some mixin/service
  private async fetchAddresses (): Promise<void> {
    if (this.getIdentifier && this.asOfDate) {
      const url = `businesses/${this.getIdentifier}/addresses?date=${this.asOfDate}`
      await axios.get(url).then(response => {
        // registered office is required
        const registeredOffice = response?.data?.registeredOffice
        if (registeredOffice) {
          this.original.registeredOffice = {
            deliveryAddress: { ...registeredOffice.deliveryAddress, actions: [] },
            mailingAddress: { ...registeredOffice.mailingAddress, actions: [] }
          }
        } else {
          throw new Error('Missing registered office address')
        }

        // records office is required only for BCOMP
        const recordsOffice = response?.data?.recordsOffice
        if (recordsOffice) {
          this.original.recordsOffice = {
            deliveryAddress: { ...recordsOffice.deliveryAddress, actions: [] },
            mailingAddress: { ...recordsOffice.mailingAddress, actions: [] }
          }
        } else if (this.isBComp) {
          throw new Error('Missing records office address')
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchAddresses() error =', error)
        // re-throw error
        throw error
      })
    }
  }

  /** Called externally to _asynchronously_ get the original office addresses on As Of Date. */
  // FUTURE: this logic should be in the parent component
  public async getOrigAddresses (asOfDate: string, updateWorkingAddresses: boolean): Promise<void> {
    this.asOfDate = asOfDate

    try {
      // fetch original office addresses
      await this.fetchAddresses()
      this.emitOriginalAddresses()

      if (updateWorkingAddresses) {
        // fill working addresses from original and sync them with parent
        this.fillWorkingAddresses(this.original)
        this.emitWorkingAddresses()
        this.emitModified()
      }
    } catch {
      // emit event to parent to display Fetch Error Dialog
      this.$root.$emit('fetch-error-event')
    }
  }

  /**
   * Called when Addresses prop changes - this is how we get our working addresses, eg:
   * - after we emit our working addresses (ie, sync)
   * - when a draft filing is loaded
   **/
  @Watch('addresses', { deep: true })
  private onAddressesChanged (): void {
    // fill working addresses from parent
    this.fillWorkingAddresses(this.addresses)
  }

  /** Assigns the specified addresses to local properties, and sets inherited flags. */
  private fillWorkingAddresses (addresses: RegRecAddressesIF): void {
    this.deliveryAddress = { ...addresses?.registeredOffice?.deliveryAddress }
    this.mailingAddress = { ...addresses?.registeredOffice?.mailingAddress }

    this.inheritDeliveryAddress =
      this.isSame(this.deliveryAddress, this.mailingAddress, ['addressType'])

    if (this.isBComp) {
      this.recDeliveryAddress = { ...addresses?.recordsOffice?.deliveryAddress }
      this.recMailingAddress = { ...addresses?.recordsOffice?.mailingAddress }

      this.inheritRecDeliveryAddress =
        this.isSame(this.recDeliveryAddress, this.recMailingAddress, ['addressType'])

      this.inheritRegisteredAddress = (
        this.isSame(this.deliveryAddress, this.recDeliveryAddress) &&
        this.isSame(this.mailingAddress, this.recMailingAddress)
      )
    }
  }

  /**
   * Event callback from BaseAddress to update the specified address.
   * @param baseAddress The base address that will be updated.
   * @param newAddress the object containing the new address.
   */
  private updateBaseAddress (baseAddress: AddressIF, newAddress: AddressIF): void {
    // Note that we do a copy of the fields (rather than change the object reference)
    // to prevent an infinite loop with the property.
    Object.assign(baseAddress, newAddress)
  }

  /** Cancels the editing of addresses when user clicks Cancel button. */
  private cancelEditAddresses (): void {
    // reset working addresses from draft
    this.fillWorkingAddresses(this.addresses)
    this.showAddressForm = false
  }

  /** Resets the working addresses when user clicks Reset button. */
  private resetAddresses (): void {
    // reset working addresses from original and sync them with parent
    this.fillWorkingAddresses(this.original)
    this.emitWorkingAddresses()
    this.emitModified()
  }

  /**
   * Updates the address data using what was entered on the forms.
   * Called when user clicks Update Addresses button.
   */
  private updateAddresses (): void {
    if (this.inheritDeliveryAddress) {
      // inherit the registered delivery address
      this.mailingAddress = { ...this.deliveryAddress, addressType: 'mailing' }
    }
    if (this.isBComp) {
      if (this.inheritRecDeliveryAddress) {
        // inherit the records delivery address
        this.recMailingAddress = { ...this.recDeliveryAddress, addressType: 'mailing' }
      }
      if (this.inheritRegisteredAddress) {
        // inherit both registered addresses
        this.recDeliveryAddress = { ...this.deliveryAddress }
        this.recMailingAddress = { ...this.mailingAddress }
      }
    }

    this.showAddressForm = false
    // sync working addresses with parent
    this.emitWorkingAddresses()
    this.emitModified()
  }

  /** Adds an action, if it doesn't already exist. */
  private addAction (address: AddressIF, val: string): void {
    if (address.actions.indexOf(val) < 0) address.actions.push(val)
  }

  /** Removes an action, if it already exists. */
  private removeAction (address: AddressIF, val: string): void {
    address.actions = address.actions.filter(action => action !== val)
  }

  /** When form valid state changes, emit event up to parent. */
  @Watch('formValid')
  private onFormValidChanged (): void {
    this.emitValid()
  }

  /** Emits the valid state of the addresses. */
  @Emit('valid')
  private emitValid (): boolean {
    return this.formValid
  }

  /** Emits the modified state of the addresses. */
  @Emit('modified')
  private emitModified (): boolean {
    return this.anyModified
  }

  /** Emits original addresses object to the parent page. */
  @Emit('original')
  private emitOriginalAddresses (): RegRecAddressesIF {
    if (this.isBComp) {
      return {
        registeredOffice: this.original.registeredOffice,
        recordsOffice: this.original.recordsOffice
      } as RegRecAddressesIF
    } else {
      return {
        registeredOffice: this.original.registeredOffice
      } as RegRecAddressesIF
    }
  }

  /** Emits updated addresses object to the parent page (ie, sync). */
  @Emit('update:addresses')
  private emitWorkingAddresses (): RegRecAddressesIF {
    const deliveryAddress = { ...this.deliveryAddress } as AddressIF
    const mailingAddress = { ...this.mailingAddress } as AddressIF
    const recDeliveryAddress = { ...this.recDeliveryAddress } as AddressIF
    const recMailingAddress = { ...this.recMailingAddress } as AddressIF

    // safety check
    if (!isEmpty(deliveryAddress) && !isEmpty(mailingAddress)) {
      // update registered delivery action
      this.isSame(this.deliveryAddress, this.original?.registeredOffice?.deliveryAddress)
        ? this.removeAction(deliveryAddress, Actions.ADDRESSCHANGED)
        : this.addAction(deliveryAddress, Actions.ADDRESSCHANGED)

      // update registered mailing action
      this.isSame(this.mailingAddress, this.original?.registeredOffice?.mailingAddress)
        ? this.removeAction(mailingAddress, Actions.ADDRESSCHANGED)
        : this.addAction(mailingAddress, Actions.ADDRESSCHANGED)

      if (this.isBComp) {
        // update records delivery action
        this.isSame(this.recDeliveryAddress, this.original?.recordsOffice?.deliveryAddress)
          ? this.removeAction(recDeliveryAddress, Actions.ADDRESSCHANGED)
          : this.addAction(recDeliveryAddress, Actions.ADDRESSCHANGED)

        // update records mailing action
        this.isSame(this.recMailingAddress, this.original?.recordsOffice?.mailingAddress)
          ? this.removeAction(recMailingAddress, Actions.ADDRESSCHANGED)
          : this.addAction(recMailingAddress, Actions.ADDRESSCHANGED)

        return {
          registeredOffice: { deliveryAddress, mailingAddress },
          recordsOffice: { deliveryAddress: recDeliveryAddress, mailingAddress: recMailingAddress }
        } as RegRecAddressesIF
      }

      return {
        registeredOffice: { deliveryAddress, mailingAddress }
      } as RegRecAddressesIF
    }

    // should never happen
    return null
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.address-list-container {
  padding: 1.25rem;
}

.v-btn {
  margin: 0;
  min-width: 6rem;
  text-transform: none;
}

.reset-btn {
  margin-top: 0.5rem;
}

.meta-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;
}

.meta-container__inner {
  margin-top: 1rem;
}

label:first-child {
  font-weight: 700;
  &__inner {
    flex: 1 1 auto;
  }
}

@media (min-width: 768px) {
  .meta-container {
    flex-flow: row nowrap;

    label:first-child {
      flex: 0 0 auto;
      width: 12rem;
    }
  }

  .meta-container__inner {
    flex: 1 1 auto;
    margin-top: 0;
  }
}

.address-list .form {
  margin-top: 1rem;
}

@media (min-width: 768px) {
  .address-list .form {
    margin-top: 0;
  }
}

// Address Block Layout
.address-wrapper {
  margin-top: 0.5rem;
}

.address-block__actions {
  position: absolute;
  top: 0;
  right: 0;

  .v-btn {
    min-width: 4rem;
  }

  .v-btn + .v-btn {
    margin-left: 0.5rem;
  }
}

// Form Row Elements
.form__row + .form__row {
  margin-top: 0.25rem;
}

.form__btns {
  text-align: right;
  display: flex;
  justify-content: flex-end;
  padding: 1rem;

  .v-btn {
    margin: 0;

    + .v-btn {
      margin-left: 0.5rem;
    }
  }
}

.form__row.three-column {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
}

.inherit-checkbox {
  margin-top: -3px;
  margin-left: -3px;
  padding: 0;
}
.records-inherit-checkbox {
  white-space: nowrap;
  margin-top: 0rem;
  margin-left: 4.65rem;
  margin-bottom: -1.5rem;
  padding: 0;

  .v-messages {
    display: none!important;
  }
}

// Registered Office Address Form Behavior
.show-address-form {
  li:first-child {
    padding-bottom: 0;
  }
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

// Editing Address Form
.address-edit-header {
  display: flex;
  background-color: rgba(1,51,102,0.15);
  padding: 1.25rem;

  address-edit-title {
    font-size: $px-16;
    font-weight: bold;
    line-height: 1.375rem;
  }
}
</style>
