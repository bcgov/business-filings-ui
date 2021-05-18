<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="add-notation-dialog">
    <v-card>
      <v-card-title id="dialog-title">Add a {{itemName}}</v-card-title>
      <v-card-text>
        <div id="notation-text" class="mb-4 mt-2 default-text">
            Enter a {{itemName}} that will appear on the ledger for this entity
        </div>
        <v-form ref="notationFormRef" v-model="notationFormValid" id="notation-form">
            <v-textarea
                v-model="notation"
                class="text-input-field mb-2"
                filled
                :label="itemName"
                id="notation"
                rows="4"
                :rules="notationRules"
                :counter="notationMaxLength"
            />
        </v-form>
        <div class="default-text">
            If this filing is pursuant to a court order, enter the court order number. If this filing is pursuant
            to a plan of arrangement, enter the court order number and select Plan of Arrangement.
        </div>
        <CourtOrderPoa
            id="court-order"
            @emitCourtNumber="setFileNumber($event)"
            @emitPoa="setHasPlanOfArrangement($event)"
            :displaySideLabels="false"
            :key="courtOrderKey"
            autoValidation="true"
            ref="courtOrderPoaRef"
        />
      </v-card-text>
      <v-divider class="mb-4"></v-divider>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <div class="form__btns">
          <v-btn text color="primary"
            id="dialog-save-button"
            :loading="saving"
            @click.native="save()"
          >Save</v-btn>
          <v-btn text color="secondary"
            id="dialog-cancel-button"
            :disabled="saving"
            :loading="saving"
            @click.native="emitClose(false)"
          >Cancel</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'
import { mapState } from 'vuex'
import axios from '@/axios-auth'
import { CourtOrderPoa } from '@bcrs-shared-components/court-order-poa'
import { FormIF } from '@/interfaces'

@Component({
  computed: {
    // ...mapState(['entityIncNo'])
  },
  components: {
    CourtOrderPoa
  }
})
export default class AddStaffNotationDialog extends Vue {
  $refs!: Vue['$refs'] & {
    courtOrderPoaRef: FormIF,
    notationFormRef: FormIF
  }

  /** Prop for the item's name of the dialog. */
  @Prop() readonly itemName: string

  /** Prop to display the dialog. */
  @Prop() readonly dialog: boolean

  /** Prop to provide attachment selector. */
  @Prop() readonly attach: string

  private dialogFromParent = true

  /** The notation text. */
  private notation: string = ''

  /** Whether this component is currently saving. */
  private saving = false

  /** Court Order component key */
  private courtOrderKey = 0

  private notationFormValid = false
  private notationMaxLength = 2000

  private get notationRules (): Array<Function> {
    return [
      (v: string) => !!v || `Enter a ${this.itemName}`,
      (v: string) => v.length <= this.notationMaxLength || 'Maximum characters exceeded.'
    ]
  }

  /** Called when prop changes (ie, dialog is shown/hidden). */
  @Watch('dialog')
  private async onDialogChanged (val: boolean): Promise<void> {
    // when dialog is shown, reset notation and validation
    if (val) {
      this.notation = ''
      await Vue.nextTick()
      this.$refs.notationFormRef.resetValidation()

      // This will make CourtOrderPoa to re-render as it will have a different key everytime it open the dialog.
      // Source: https://michaelnthiessen.com/force-re-render/
      this.courtOrderKey++
    }
  }

  /**
   * Emits event to close this dialog.
   * @param needReload Whether the dashboard needs to be reloaded.
   */
  @Emit('close')
  private emitClose (needReload: boolean): void { }

  /** WIP */
  /** Saves the current notation. */
  private async save (): Promise<void> {
    // prevent double saving
    if (this.saving) return

    const isNotationFormRefValid = this.$refs.notationFormRef.validate()
    const isCourtOrderPoaFormRefValid = this.$refs.courtOrderPoaRef.validate()
    if (!isNotationFormRefValid || !isCourtOrderPoaFormRefValid) {
      console.log('Form invalid')
      return
    }

    this.saving = true

    // const data = {
    //   notation: {
    //     filingId: this.filingId,
    //     notation: this.notation
    //   }
    // }

    // const url = `businesses/${this.entityIncNo}/filings/${this.filingId}/notations`
    // let success = false
    // await axios.post(url, data).then(res => {
    //   success = true
    // }).catch(error => {
    //   // eslint-disable-next-line no-console
    //   console.log('save() error =', error)
    //   alert('Could not save your notation. Please try again or cancel.')
    // })
    await setTimeout(() => {
      this.saving = false
      // if (success)
      this.emitClose(true)
    }, 2000)
  }
  private setFileNumber (courtOrderNumber):void {}
  private setHasPlanOfArrangement (planOfArrangement):void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
::v-deep {
    #court-order div.pl-2 {
        padding-left: 0 !important;
    }
    #court-order {
        padding-right: 0 !important;
        padding-top: 0 !important;
        margin-top: 0 !important;
        padding-bottom: 0 !important;
    }
    #court-num-form div.v-input__slot {
        margin-bottom: 0 !important;
    }
    #court-order .v-input--checkbox .v-input__slot {
        margin-bottom: 0 !important;
    }
}
</style>
