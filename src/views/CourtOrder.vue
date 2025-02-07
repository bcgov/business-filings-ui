<template>
  <div id="court-order">
    <v-container
      id="court-order-container"
      class="view-container"
    >
      <v-row no-gutters>
        <v-col
          class="pr-4 pb-4"
        >
          <article id="court-order-article">
            <!-- Page Title -->
            <header>
              <h1 id="court-order-header">
                Court Order
              </h1>
            </header>

            <section>
              <header>
                <h2 id="court-order-headings">
                  Court Order
                </h2>
              </header>
              <div
                id="court-order-section"
                :class="{ 'invalid-section': !courtOrderValid && showErrors }"
              >
                <v-card
                  flat
                  class="pt-6 px-4"
                >
                  <v-form
                    id="notation-form"
                    ref="notationFormRef"
                  >
                    <v-row class="mt-4">
                      <v-col
                        cols="20"
                        md="3"
                      >
                        <label class="title-label">Court Order Number</label>
                      </v-col>
                      <v-col>
                        <CourtOrderPoa
                          ref="courtOrderPoaRef"
                          :key="courtOrderPoaKey"
                          :displaySideLabels="false"
                          :autoValidation="enableValidation"
                          :courtOrderNumberRequired="true"
                          @emitCourtNumber="courtOrderNumber = $event"
                          @emitPoa="planOfArrangement = $event"
                          @emitValid="courtOrderValid=$event"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="mt-6">
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <label class="title-label">Upload a File</label>
                      </v-col>
                      <v-col>
                        <p>
                          AND/OR upload a PDF of the Court Order:
                        </p>

                        <ul class="ml-2">
                          <li>Use a white background and a legible font with contrasting font colour</li>
                          <li>PDF file type (maximum {{ MAX_FILE_SIZE }} MB file size)</li>
                        </ul>

                        <div class="d-flex mt-4">
                          <v-btn
                            id="add-document-button"
                            ref="uploadBtn"
                            outlined
                            color="primary"
                            class="btn-outlined-primary mt-4"
                            @click="openFileDialog"
                          >
                            <FileUploadPdf
                              v-show="false"
                              ref="fileUploadRef"
                              :file.sync="file"
                              :fileKey.sync="fileKey"
                              class="ml-12 flex-grow-1"
                              :isRequired="enableValidation && isCourtOrder && !notation"
                              :customErrorMSg="courtOrderCustomValidationMsg"
                              :maxSize="MAX_FILE_SIZE"
                              :pageSize="PageSizes.LETTER_PORTRAIT"
                              :userId="getKeycloakGuid"
                              :getPresignedUrl="LegalServices.getPresignedUrl"
                              :uploadToUrl="LegalServices.uploadToUrl"
                            />
                            <v-icon>mdi-plus</v-icon>
                            <span>Add a Document</span>
                          </v-btn>

                          <p
                            v-if="file"
                            class="ml-3 pt-6"
                          >
                            {{ file.name }}
                          </p>
                          <p
                            v-else-if="isCourtOrder && !notation && enableValidation"
                            class="ml-3 pt-6"
                          >
                            {{ courtOrderCustomValidationMsg }}
                          </p>
                        </div>
                      </v-col>
                    </v-row>

                    <v-row class="mt-4">
                      <v-col
                        cols="12"
                        md="3"
                      >
                        <label class="title-label">Court Order Text</label>
                      </v-col>
                      <v-col>
                        <v-textarea
                          ref="notationFormRef"
                          v-model="notation"
                          class="notation-textarea xmt-4"
                          filled
                          :label="notationLabel"
                          :rows="isCourtOrder ? 2: 5"
                          :no-resize="true"
                          :rules="enableValidation ? notationRules : []"
                          :counter="NOTATION_MAX_LENGTH"
                        />
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card>
              </div>
            </section>
          </article>
          <section>
            <header>
              <h2 id="court-order-headings">
                Staff Payment
              </h2>
            </header>
            <div
              id="staff-payment-section"
              :class="{ 'invalid-section': !staffPaymentValid && showErrors }"
            >
              <v-card
                flat
                class="pt-6 px-4"
              >
                <StaffPaymentShared
                  :staffPaymentData.sync="staffPaymentData"
                  @staffPaymentFormValid="staffPaymentValid=$event"
                />
              </v-card>
            </div>
            <v-card-text />
          </section>
        </v-col>

        <v-col
          cols="12"
          lg="3"
          style="position: relative"
        >
          <aside>
            <affix
              relative-element-selector="#court-order-article"
              :offset="{ top: 120, bottom: 40 }"
            >
              <SbcFeeSummary
                :filingData="filingData"
                :payURL="getPayApiUrl"
                @total-fee="totalFee=$event"
              />
              <v-card-actions>
                <div class="form__btns w-full">
                  <v-btn
                    id="dialog-cancel-button"
                    outlined
                    color="primary"
                    class="btn-outlined-primary mt-6 text-lg px-6 py-3"
                    :disabled="saving"

                    @click="goToDashboard()"
                  >
                    <span>Cancel</span>
                  </v-btn>

                  <v-btn
                    id="dialog-save-button"
                    solid
                    color="primary"
                    class="btn-outlined-primary mt-4"
                    :loading="!isPageValid || saving"
                    @click.native="onSave()"
                  >
                    {{ isPayRequired ? "File and Pay" : "File Now (no fee)" }}
                    <v-icon class="btn-icon">
                      mdi-chevron-right
                    </v-icon>
                  </v-btn>
                </div>
              </v-card-actions>
            </affix>
          </aside>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { DateMixin, FilingMixin, CommonMixin } from '@/mixins'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import FileUploadPdf from '@/components/common/FileUploadPdf.vue'
import { FormIF, StaffPaymentIF } from '@/interfaces'
import { EffectOfOrderTypes, PageSizes } from '@/enums'
import { FilingCodes, FilingNames, FilingTypes, StaffPaymentOptions } from '@bcrs-shared-components/enums'
import { EnumUtilities, LegalServices } from '@/services'
import { useAuthenticationStore, useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import SbcFeeSummary from 'sbc-common-components/src/components/SbcFeeSummary.vue'
import { StaffPayment as StaffPaymentShared } from '@bcrs-shared-components/staff-payment/'

@Component({
  components: {
    CourtOrderPoa,
    FileUploadPdf,
    SbcFeeSummary,
    StaffPaymentShared
  }
})
export default class CourtOrderView extends Mixins(DateMixin, FilingMixin, CommonMixin) {
  $refs!: Vue['$refs'] & {
    courtOrderPoaRef: FormIF,
    fileUploadRef: FormIF,
    notationFormRef: FormIF
  }

  readonly MAX_FILE_SIZE = 30 // in MB
  readonly NOTATION_MAX_LENGTH = 2000 // characters

  // For template
  readonly LegalServices = LegalServices
  readonly PageSizes = PageSizes
  // enum for template
  readonly FilingCodes = FilingCodes
  /** Prop to display the dialog. */
  @Prop({ required: true }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop for the item's display name. */
  @Prop({ required: true, default: FilingNames.COURT_ORDER }) readonly displayName!: string

  /** Prop for the item's name (filing type). */
  @Prop({ required: true, default: FilingTypes.COURT_ORDER }) readonly name!: FilingTypes

  /** Prop to require court order number regardless the plan of arrangement. */
  @Prop({ default: false }) readonly courtOrderNumberRequired!: boolean

  // Global getters
  @Getter(useRootStore) getCurrentDate!: string
  @Getter(useBusinessStore) getFoundingDate!: Date
  @Getter(useBusinessStore) getLegalName!: string
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useAuthenticationStore) getKeycloakGuid!: string
  @Getter(useBusinessStore) isAdminFrozen!: boolean
  @Getter(useConfigurationStore) getAuthWebUrl!: string
  @Getter(useRootStore) getBusinessEmail!: string
  @Getter(useConfigurationStore) getPayApiUrl!: string
  @Getter(useRootStore) getUserInfo!: any
  @Getter(useRootStore) isRoleStaff!: boolean
  // Properties
  customErrorMsg = ''
  notation = '' // notation text
  courtOrderNumber = '' // court order number
  planOfArrangement = false // whether filing has plan of arrangement
  saving = false // whether this component is currently saving
  courtOrderPoaKey = 0 // court order component key, to force re-render
  enableValidation = false // flag to enable validation
  file: File = null // court order file object
  fileKey: string = null // court order file key
  courtOrderValid = true
  staffPaymentValid = false

  // other variables
  totalFee = 0
  dataLoaded = false
  loadingMessage = ''
  filingId = 0 // id of this consent to continuation out filing
  showErrors = false // true when we press on File and Pay (trigger validation)
  haveChanges = false

  // variables for staff payment
  staffPaymentData = { option: StaffPaymentOptions.FAS } as StaffPaymentIF

  paymentErrorDialog = false

  /** Whether this filing is a Court Order. */
  get isCourtOrder (): boolean {
    return EnumUtilities.isTypeCourtOrder({ name: this.name })
  }

  get courtOrderCustomValidationMsg (): string {
    if (this.isCourtOrder && !this.notation) {
      return `Enter a ${this.displayName} and/or upload file`
    }
    return ''
  }

  get notationLabel (): string {
    return this.isCourtOrder ? `${this.displayName} Text` : 'Court Order'
  }

  /** The notation textarea validation rules. */
  get notationRules (): Array<(v) => boolean | string> {
    return [
      // Administrative Dissolution, Put Back On, Freeze/Unfreeze Business require a detailed comment

      // Court Order requires a file or a comment
      (v: string) => (
        !!v ||
        !this.isCourtOrder ||
        (!!this.file && !!this.fileKey) ||
        `Enter a ${this.displayName} and/or upload file`
      ),
      // others require a comment
      (v: string) => (
        !!v ||
        (this.isCourtOrder) ||
        `Enter a ${this.displayName}`
      ),
      (v: string) => (
        !v ||
        (v.length <= this.NOTATION_MAX_LENGTH) ||
        'Maximum characters exceeded.'
      )
    ]
  }

  get isPageValid (): boolean {
    const filingDataValid = (this.filingData.length > 0)
    return (filingDataValid && this.courtOrderValid)
  }

  /**
   * Routes to dashboard if there are no outstanding changes,
   * else prompts user before routing.
   */
  goToDashboard (force = false): void {
    // check if there are no data changes
    if (!this.haveChanges || force) {
      // route to dashboard
      this.navigateToBusinessDashboard(this.getIdentifier)
      return
    }

    // open confirmation dialog and wait for response
    this.$refs.confirm.open(
      'Unsaved Changes',
      'You have unsaved changes in your Continue Out. Do you want to exit your filing?',
      {
        width: '45rem',
        persistent: true,
        yes: 'Return to my filing',
        no: null,
        cancel: 'Exit without saving'
      }
    ).then(() => {
      // if we get here, Yes was clicked
      // nothing to do
    }).catch(() => {
      // if we get here, Cancel was clicked
      // ignore changes
      this.haveChanges = false
      // route to dashboard
      this.navigateToBusinessDashboard(this.getIdentifier)
    })
  }

  @Watch('notation')
  async onNotationChanged (): Promise<void> {
    // if this is a court order and notation has changed, re-validate file upload component
    if (this.isCourtOrder && this.enableValidation) {
      await this.$nextTick() // wait for variables to update
      this.$refs.fileUploadRef?.validate()
    }
  }

  // NB: watch "fileKey" because it changes according to file validity (while "file" might not)
  @Watch('fileKey')
  async onFileKeyChanged (): Promise<void> {
    // if this is a court order and file has changed, re-validate notation form
    if (this.isCourtOrder && this.enableValidation) {
      await this.$nextTick() // wait for variables to update
      this.$refs.notationFormRef?.validate()
    }
  }

  openFileDialog () {
    // Access the underlying file input element and trigger click
    const fileInput = this.$refs.fileUploadRef.$el.querySelector('input')
    if (fileInput) {
      fileInput.click() // Open file input dialog
    }
  }

  readonly validComponents = [
    'court-order-section',
    'staff-payment-section'
  ]

  get validFlags (): object {
    return {
      courtOrder: this.courtOrderValid,
      staffPayment: this.staffPaymentValid
    }
  }

  @Watch('staffPaymentValid')
  @Watch('courtOrderValid')
  onHaveChanges (): void {
    this.haveChanges = true
  }

  @Watch('staffPaymentData')
  onStaffPaymentDataChanged (val: StaffPaymentIF): void {
    const waiveFees = (val.option === StaffPaymentOptions.NO_FEE)

    // add Waive Fees flag to all filing codes
    this.updateFilingData('add', FilingCodes.COURT_ORDER, val.isPriority, waiveFees)

    this.haveChanges = true
  }
  @Watch('dialog')
  onDialogChanged (val: boolean): void {
    // when dialog is hidden, reset everything
    if (!val) {
      // disable validation
      this.enableValidation = false

      // reset notation form
      this.$refs.notationFormRef?.reset()

      // reset file upload component
      this.$refs.fileUploadRef?.reset()

      // reset court order component and variables
      this.courtOrderPoaKey++ // force re-render
      this.courtOrderNumber = ''
      this.planOfArrangement = false
    }
  }

  /** True if payment is required, else False. */
  get isPayRequired (): boolean {
    // FUTURE: modify rule here as needed
    return (this.totalFee > 0)
  }
  /** Called when component is created. */
  created (): void {
    // Safety check to make sure Staff is filing the Continuation Out.
    if (!this.isRoleStaff) {
      this.resumeErrorDialog = true
      throw new Error('This is a Staff only Filing.')
    }

    // init
    this.setFilingData([])

    // before unloading this page, if there are changes then prompt user
    window.onbeforeunload = (event) => {
      if (this.haveChanges) {
        event.preventDefault()
        // NB: custom text is not supported in all browsers
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    // this is the id of THIS filing
    // if 0, this is a new filing
    // otherwise it's a draft filing
    this.filingId = +this.$route.query.filingId // number or NaN

    // if required data isn't set, go back to dashboard
    if (isNaN(this.filingId)) {
      this.navigateToBusinessDashboard(this.getIdentifier)
    }
  }

  /** Called when user clicks button to file/save the current filing. */
  async onSave (): Promise<void> {
    if (this.saving) return

    this.saving = true

    // enable validation
    this.enableValidation = true
    await this.$nextTick() // wait for form to update

    if (!this.isPageValid) {
      this.showErrors = true
      await this.validateAndScroll(this.validFlags, this.validComponents)
      return
    }

    // if any component is invalid, don't save
    const isNotationFormValid = (!this.$refs.notationFormRef || this.$refs.notationFormRef.validate())
    const isFileComponentValid = (!this.$refs.fileUploadRef || this.$refs.fileUploadRef.validate())
    const isCourtOrderPoaValid = (!this.$refs.courtOrderPoaRef || this.$refs.courtOrderPoaRef.validate())

    if (!isNotationFormValid || !isFileComponentValid || !isCourtOrderPoaValid) {
      this.saving = false
      return
    }

    // base filing
    const filing: any = {
      header: {
        name: this.name,
        date: this.getCurrentDate, // NB: API will reassign this date according to its clock
        certifiedBy: ''
      },
      business: {
        identifier: this.getIdentifier,
        legalType: this.getLegalType,
        legalName: this.getLegalName,
        foundingDate: this.getFoundingDate
      }
    }

    switch (this.staffPaymentData.option) {
      case StaffPaymentOptions.FAS:
        filing.header['routingSlipNumber'] = this.staffPaymentData.routingSlipNumber
        filing.header['priority'] = this.staffPaymentData.isPriority
        break

      case StaffPaymentOptions.BCOL:
        filing.header['bcolAccountNumber'] = this.staffPaymentData.bcolAccountNumber
        filing.header['datNumber'] = this.staffPaymentData.datNumber
        filing.header['folioNumber'] = this.staffPaymentData.folioNumber
        filing.header['priority'] = this.staffPaymentData.isPriority
        break

      case StaffPaymentOptions.NO_FEE:
        filing.header['waiveFees'] = true
        break

      case StaffPaymentOptions.NONE: // should never happen
        break
    }

    const effectOfOrder = (this.planOfArrangement ? EffectOfOrderTypes.PLAN_OF_ARRANGEMENT : '') as string
    const fileNumber = (this.courtOrderNumber || '')

    if (this.file) {
      filing[FilingTypes.COURT_ORDER] = {
        effectOfOrder,
        fileNumber,
        orderDetails: this.notation,
        fileKey: this.fileKey,
        fileName: this.file.name,
        fileLastModified: this.file.lastModified,
        fileSize: this.file.size
      }
    } else {
      filing[FilingTypes.COURT_ORDER] = {
        effectOfOrder,
        fileNumber,
        orderDetails: this.notation
      }
    }

    let success = false
    await LegalServices.createFiling(this.getIdentifier, filing, false)
      .then(() => {
        success = true
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log('save() error =', error.log)
        alert(`Could not save your court order. Please try again or cancel.`)
      })

    this.saving = false
    if (success) { this.navigateToBusinessDashboard(this.getIdentifier) }
  }

  /**
   * Emits event to close this dialog.
   * @param needReload Whether the dashboard needs to be reloaded.
   */
   @Emit('close')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitClose (needReload: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#court-order {
  /* Set "header-counter" to 0 */
  counter-reset: header-counter;
}

h2::before {
  /* Increment "header-counter" by 1 */
  counter-increment: header-counter;
  content: counter(header-counter) '. ';
}

  section{
  .v-card {
    line-height: 1.2rem;
    font-size: $px-14;
    padding: 3rem;
  }}

header p,
section p {
  color: $gray7;
}

section + section {
  margin-top: 3rem;
}

h1 {
  margin-bottom: 1.25rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
}

h2 {
  margin-bottom: 0.25rem;
  margin-top: 3rem;
  font-size: 1.125rem;
}

.form__btns {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

#dialog-cancel-button {
  width: 100%;
}

#dialog-save-button {
  width: 100%;
}
#court-order-headings{
  margin-bottom: 2rem;
}

:deep() {
  .invalid-component {
      .certify-stmt, .title-label {
        color: $app-red;
        border-left: 3px solid $app-red;
      }
    }

  .title-label {
    font-weight: bold;
    color: $gray9;
  }
}
</style>
