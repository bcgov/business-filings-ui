<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="add-staff-notation-dialog">
    <v-card>
      <v-card-title>
        <span id="dialog-title" class="font-weight-bold">
          <template v-if="isPutBackOn" >Correction - {{displayName}}</template>
          <template v-else-if="isAdministrativeDissolution">{{displayName}}</template>
          <template v-else >Add a {{displayName}}</template>
        </span>
      </v-card-title>

      <v-card-text class="font-16">
        <p v-if="isAdministrativeDissolution">
          You are about to dissolve <strong><span class="text-uppercase">{{getEntityName}}</span>,
          {{getIdentifier}}</strong>.
        </p>

        <p v-if="isPutBackOn">
          You are about to put <strong><span class="text-uppercase">{{getEntityName}}</span>,
          {{getIdentifier}}</strong> back on the register.
        </p>

        <p v-if="isAdministerFreeze">
          You are about to {{ !isAdminFreeze ? 'Freeze' : 'Unfreeze' }} <span class="text-uppercase font-weight-bold">{{getEntityName}}</span>,
          {{getIdentifier}}.
        </p>

        <v-form ref="notationFormRef" id="notation-form">
          <p id="notation-text" :class="{ 'mt-4': isAdministrativeDissolution || isPutBackOn }">
            Enter a {{(isAdministrativeDissolution || isPutBackOn || isAdministerFreeze) ? 'Detail' : displayName}}
            that will appear on the ledger for this entity:
          </p>

          <v-textarea
            v-model="notation"
            class="notation-textarea xmt-4"
            filled
            :label="(isAdministrativeDissolution || isPutBackOn || isAdministerFreeze) ? 'Add Detail' : displayName"
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
            <li>PDF file type (maximum {{MAX_FILE_SIZE}} MB file size)</li>
          </ul>

          <div class="d-flex mt-4">
            <span class="font-weight-bold">Upload File</span>
            <FileUploadPdf
              ref="fileUploadRef"
              class="ml-12 flex-grow-1"
              :file.sync="file"
              :fileKey.sync="fileKey"
              :isRequired="enableValidation && isCourtOrder && !notation"
              :maxSize="MAX_FILE_SIZE"
              :pageSize="PageSizes.LETTER_PORTRAIT"
              :userId="getUserKeycloakGuid"
              :getPresignedUrl="LegalServices.getPresignedUrl"
              :uploadToUrl="LegalServices.uploadToUrl"
            />
          </div>
        </template>

        <v-divider v-if="isCourtOrder" class="mt-4" />

        <p class="mt-4" v-if="!isAdministerFreeze">
          If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant
          to a plan of arrangement, enter the court order number and select Plan of Arrangement.
        </p>

        <CourtOrderPoa v-if="!isAdministerFreeze"
          ref="courtOrderPoaRef"
          class="mt-4"
          @emitCourtNumber="courtOrderNumber = $event"
          @emitPoa="planOfArrangement = $event"
          :displaySideLabels="false"
          :key="courtOrderPoaKey"
          :autoValidation="enableValidation"
          :courtOrderNumberRequired="courtOrderNumberRequired"
        />
      </v-card-text>

      <v-divider class="mx-4" />

      <v-card-actions>
        <v-spacer />
        <div class="form__btns">
          <v-btn text color="primary"
            id="dialog-save-button"
            class="font-weight-bold"
            :loading="saving"
            @click.native="onSave()"
          >
            <span>{{(isAdministrativeDissolution || isPutBackOn || isAdministerFreeze) ? 'File' : 'Save'}}</span>
          </v-btn>
          <v-btn text color="primary"
            id="dialog-cancel-button"
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
import Vue from 'vue'
import { Component, Prop, Watch, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin, EnumMixin } from '@/mixins'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import FileUploadPdf from '@/components/common/FileUploadPdf.vue'
import { FormIF } from '@/interfaces'
import { EffectOfOrderTypes, FilingTypes, DissolutionTypes, PageSizes } from '@/enums'
import { LegalServices } from '@/services'

@Component({
  components: { CourtOrderPoa, FileUploadPdf },
  mixins: [ DateMixin, EnumMixin ]
})
export default class AddStaffNotationDialog extends Vue {
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

  /** Prop to display the dialog. */
  @Prop({ required: true }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop for the item's display name. */
  @Prop({ required: true }) readonly displayName!: string

  /** Prop for the item's name (filing type). */
  @Prop({ required: true }) readonly name!: FilingTypes

  /** Prop for the item's dissolution type. */
  @Prop({ default: null }) readonly dissolutionType!: DissolutionTypes

  /** Prop to require court order number regardless the plan of arrangement. */
  @Prop({ default: false }) readonly courtOrderNumberRequired!: boolean

  // Global getters
  @Getter getCurrentDate!: string
  @Getter getBusinessNumber!: string
  @Getter getEntityFoundingDate!: Date
  @Getter getEntityName!: string
  @Getter getEntityType!: string
  @Getter getIdentifier!: string
  @Getter getUserKeycloakGuid!: string
  @Getter isAdminFreeze!: boolean

  // Properties
  protected notation = '' // notation text
  protected courtOrderNumber = '' // court order number
  protected planOfArrangement = false // whether filing has plan of arrangement
  protected saving = false // whether this component is currently saving
  protected courtOrderPoaKey = 0 // court order component key, to force re-render
  protected enableValidation = false // flag to enable validation
  protected file: File = null // court order file object
  protected fileKey: string = null // court order file key

  /** Whether this filing is an Administrative Dissolution. */
  get isAdministrativeDissolution (): boolean {
    return this.isTypeAdministrativeDissolution({ name: this.name, dissolutionType: this.dissolutionType })
  }

  /** Whether this filing is a Put Back On. */
  get isPutBackOn (): boolean {
    return this.isTypePutBackOn({ name: this.name })
  }

  /** Whether this filing is a admin freeze. */
  get isAdministerFreeze (): boolean {
    return this.isTypeAdminFreeze({ name: this.name })
  }

  /** Whether this filing is a Court Order. */
  get isCourtOrder (): boolean {
    return this.isTypeCourtOrder({ name: this.name })
  }

  /** The notation textarea validation rules. */
  get notationRules (): Array<(v) => boolean | string> {
    return [
      // Administrative Dissolution and Put Back On require a detailed comment
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
        `Enter a ${this.displayName}`
      ),
      // others require a comment
      (v: string) => (
        !!v ||
        (this.isAdministrativeDissolution || this.isPutBackOn || this.isCourtOrder || this.isAdministerFreeze) ||
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
  private async onNotationChanged (): Promise<void> {
    // if this is a court order and notation has changed, re-validate file upload component
    if (this.isCourtOrder && this.enableValidation) {
      await Vue.nextTick() // wait for variables to update
      this.$refs.fileUploadRef.validate()
    }
  }

  // NB: watch "fileKey" because it changes according to file validity (while "file" might not)
  @Watch('fileKey')
  private async onFileKeyChanged (): Promise<void> {
    // if this is a court order and file has changed, re-validate notation form
    if (this.isCourtOrder && this.enableValidation) {
      await Vue.nextTick() // wait for variables to update
      this.$refs.notationFormRef.validate()
    }
  }

  @Watch('dialog')
  private onDialogChanged (val: boolean): void {
    // when dialog is hidden, reset everything
    if (!val) {
      // disable validation
      this.enableValidation = false

      // reset notation form
      this.$refs.notationFormRef.reset()

      // reset file upload component
      if (this.isCourtOrder) this.$refs.fileUploadRef.reset()

      // reset court order component and variables
      this.courtOrderPoaKey++ // force re-render
      this.courtOrderNumber = ''
      this.planOfArrangement = false
    }
  }

  /** Called when user clicks button to file/save the current filing. */
  protected async onSave (): Promise<void> {
    // prevent double saving
    if (this.saving) return

    this.saving = true

    // enable validation
    this.enableValidation = true
    await Vue.nextTick() // wait for form to update

    // if any component is invalid, don't save
    const isNotationFormValid = this.$refs.notationFormRef.validate()
    const isFileComponentValid = (!this.isCourtOrder || this.$refs.fileUploadRef.validate())
    const isCourtOrderPoaValid = !this.isAdministerFreeze ? this.$refs.courtOrderPoaRef.validate() : true

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
        legalType: this.getEntityType,
        legalName: this.getEntityName,
        foundingDate: this.getEntityFoundingDate
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
        dissolutionType: DissolutionTypes.ADMINISTRATIVE,
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
      filing[FilingTypes.COURT_ORDER] = {
        effectOfOrder,
        fileNumber,
        orderDetails: this.notation,
        fileKey: this.fileKey,
        fileName: this.file.name,
        fileLastModified: this.file.lastModified,
        fileSize: this.file.size
      }
    } else if (this.isAdministerFreeze) {
      filing[FilingTypes.ADMIN_FREEZE] = {
        details: this.notation,
        freeze: !this.isAdminFreeze
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
  protected emitClose (needReload: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

// override label color
:deep(.notation-textarea .v-label) {
  color: $gray7 !important;
}
</style>
