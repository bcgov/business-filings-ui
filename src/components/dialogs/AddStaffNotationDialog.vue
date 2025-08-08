<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="add-staff-notation-dialog"
  >
    <v-card>
      <v-card-title>
        <span
          id="dialog-title"
          class="font-weight-bold"
        >
          <template v-if="isPutBackOn">Correction - {{ displayName }}</template>
          <template v-else-if="isAdministrativeDissolution">{{ displayName }}</template>
          <template v-else-if="isAdministerFreeze">
            {{ !isAdminFrozen ? displayName : displayName.replace('Freeze', 'Unfreeze') }}
          </template>
          <template v-else>Add a {{ displayName }}</template>
        </span>
      </v-card-title>

      <v-card-text class="font-16">
        <p v-if="isAdministrativeDissolution">
          You are about to dissolve <strong><span class="text-uppercase">{{ getLegalName }}</span>,
            {{ getIdentifier }}</strong>.
        </p>

        <p v-if="isPutBackOn">
          You are about to put <strong><span class="text-uppercase">{{ getLegalName }}</span>,
            {{ getIdentifier }}</strong> back on the register.
        </p>

        <p v-if="isAdministerFreeze">
          You are about to {{ !isAdminFrozen ? 'freeze' : 'unfreeze' }}
          <span class="text-uppercase font-weight-bold">{{ getLegalName }}</span>, {{ getIdentifier }}.
        </p>

        <p v-if="isAdministerFreeze">
          This filing will not appear in Recent Filing History.
        </p>

        <v-form
          v-if="!isAdministerFreeze"
          id="notation-form"
          ref="notationFormRef"
        >
          <p
            id="notation-text"
            :class="{ 'mt-4': isAdministrativeDissolution || isPutBackOn }"
          >
            Enter a {{ (isAdministrativeDissolution || isPutBackOn) ? 'detail' : displayName }}
            that will appear on the ledger for this entity:
          </p>

          <v-textarea
            v-model="notation"
            class="notation-textarea xmt-4"
            filled
            :label="notationLabel"
            :rows="isCourtOrder ? 2: 5"
            :no-resize="true"
            :rules="enableValidation ? notationRules : []"
            :counter="NOTATION_MAX_LENGTH"
          />
        </v-form>

        <template v-if="isCourtOrder">
          <p>
            AND/OR upload a PDF of the Court Order:
          </p>

          <ul class="ml-2">
            <li>Use a white background and a legible font with contrasting font colour</li>
            <li>PDF file type (maximum {{ MAX_FILE_SIZE }} MB file size)</li>
          </ul>

          <div class="d-flex mt-4">
            <span class="font-weight-bold">Upload File</span>
            <FileUploadPdf
              ref="fileUploadRef"
              :file.sync="file"
              :fileKey.sync="fileKey"
              class="ml-12 flex-grow-1"
              :isRequired="enableValidation && isCourtOrder && !notation"
              :customErrorMSg="courtOrderCustomValidationMsg"
              :maxSize="MAX_FILE_SIZE"
              :pageSize="PageSizes.LETTER_PORTRAIT"
              :userId="getKeycloakGuid"
            />
          </div>

          <v-divider class="mt-4" />
        </template>

        <template v-if="!isAdministerFreeze">
          <p class="mt-4">
            If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant
            to a plan of arrangement, enter the court order number and select Plan of Arrangement.
          </p>

          <CourtOrderPoa
            ref="courtOrderPoaRef"
            :key="courtOrderPoaKey"
            class="mt-4"
            :displaySideLabels="false"
            :autoValidation="enableValidation"
            :courtOrderNumberRequired="courtOrderNumberRequired"
            @emitCourtNumber="courtOrderNumber = $event"
            @emitPoa="planOfArrangement = $event"
          />
        </template>
      </v-card-text>

      <v-divider class="mx-4" />

      <v-card-actions>
        <v-spacer />
        <div class="form__btns">
          <v-btn
            id="dialog-save-button"
            text
            color="primary"
            class="font-weight-bold"
            :loading="saving"
            @click.native="onSave()"
          >
            <span>{{ (isAdministrativeDissolution || isPutBackOn || isAdministerFreeze) ? 'File' : 'Save' }}</span>
          </v-btn>
          <v-btn
            id="dialog-cancel-button"
            text
            color="primary"
            :disabled="saving"
            @click.native="emitClose(false)"
          >
            <span>Cancel</span>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { DateMixin } from '@/mixins'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import FileUploadPdf from '@/components/common/FileUploadPdf.vue'
import { FormIF } from '@/interfaces'
import { EffectOfOrderTypes, FilingSubTypes, PageSizes } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { EnumUtilities, LegalServices } from '@/services'
import { useAuthenticationStore, useBusinessStore, useRootStore } from '@/stores'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: {
    CourtOrderPoa,
    FileUploadPdf
  }
})
export default class AddStaffNotationDialog extends Mixins(DateMixin) {
  $refs!: Vue['$refs'] & {
    courtOrderPoaRef: FormIF,
    fileUploadRef: FormIF,
    notationFormRef: FormIF
  }

  readonly MAX_FILE_SIZE = 30 // in MB
  readonly NOTATION_MAX_LENGTH = 2000 // characters

  // For template
  readonly PageSizes = PageSizes

  /** Prop to display the dialog. */
  @Prop({ required: true }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop for the item's display name. */
  @Prop({ required: true }) readonly displayName!: string

  /** Prop for the item's name (filing type). */
  @Prop({ required: true }) readonly name!: FilingTypes

  /** Prop for the item's dissolution type. */
  @Prop({ default: null }) readonly dissolutionType!: FilingSubTypes

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

  /** Whether this filing is an Administrative Dissolution. */
  get isAdministrativeDissolution (): boolean {
    return EnumUtilities.isTypeDissolutionAdministrative({ filingSubType: this.dissolutionType })
  }

  /** Whether this filing is a Put Back On. */
  get isPutBackOn (): boolean {
    return EnumUtilities.isTypePutBackOn({ name: this.name })
  }

  /** Whether this filing is an Admin Freeze or Unfreeze. */
  get isAdministerFreeze (): boolean {
    return EnumUtilities.isTypeAdminFreeze({ name: this.name })
  }

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
    if (this.isAdministrativeDissolution || this.isPutBackOn) {
      return 'Add Detail'
    } else if (this.isCourtOrder) {
      return `${this.displayName} Text`
    } else {
      return `${this.displayName}`
    }
  }

  /** The notation textarea validation rules. */
  get notationRules (): Array<(v) => boolean | string> {
    return [
      // Administrative Dissolution, Put Back On, Freeze/Unfreeze Business require a detailed comment
      (v: string) => (
        !!v ||
        (!this.isAdministrativeDissolution && !this.isPutBackOn) ||
        'Enter a detailed comment'
      ),
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
        (this.isAdministrativeDissolution || this.isPutBackOn || this.isCourtOrder) ||
        `Enter a ${this.displayName}`
      ),
      (v: string) => (
        !v ||
        (v.length <= this.NOTATION_MAX_LENGTH) ||
        'Maximum characters exceeded.'
      )
    ]
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

  /** Called when user clicks button to file/save the current filing. */
  async onSave (): Promise<void> {
    // prevent double saving
    if (this.saving) return

    this.saving = true

    // enable validation
    this.enableValidation = true
    await this.$nextTick() // wait for form to update

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

    const effectOfOrder = (this.planOfArrangement ? EffectOfOrderTypes.PLAN_OF_ARRANGEMENT : '') as string
    const fileNumber = (this.courtOrderNumber || '')

    if (this.isPutBackOn) {
      filing[FilingTypes.PUT_BACK_ON] = {
        details: this.notation
      }
      if (this.courtOrderNumber) {
        // add court order sub-object
        filing[FilingTypes.PUT_BACK_ON].courtOrder = {
          effectOfOrder,
          fileNumber
        }
      }
    } else if (this.isAdministrativeDissolution) {
      filing[FilingTypes.DISSOLUTION] = {
        dissolutionType: FilingSubTypes.DISSOLUTION_ADMINISTRATIVE,
        dissolutionDate: this.getCurrentDate,
        details: this.notation
      }
      if (this.courtOrderNumber) {
        // add court order sub-object
        filing[FilingTypes.DISSOLUTION].courtOrder = {
          effectOfOrder,
          fileNumber,
          orderDetails: this.notation
        }
      }
    } else if (this.isCourtOrder) {
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
    } else if (this.isAdministerFreeze) {
      filing[FilingTypes.ADMIN_FREEZE] = {
        freeze: !this.isAdminFrozen
      }
    } else {
      // this may be a Registrar's Notation or a Registrar's Order filing
      filing[this.name] = {
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
        console.log('save() error =', error)
        let fileType: string
        if (this.isPutBackOn) {
          fileType = 'put back on filing'
        } else if (this.isAdministrativeDissolution) {
          fileType = 'administrative dissolution filing'
        } else if (this.isAdministerFreeze) {
          fileType = 'admin freeze filing'
        } else {
          fileType = 'notation'
        }
        alert(`Could not save your ${fileType}. Please try again or cancel.`)
      })

    this.saving = false
    if (success) this.emitClose(true)
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

// override label color
:deep(.notation-textarea .v-label) {
  color: $gray7 !important;
}
</style>
