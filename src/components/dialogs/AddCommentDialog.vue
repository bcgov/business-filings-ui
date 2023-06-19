<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="add-comment-dialog"
  >
    <v-card>
      <v-card-title id="dialog-title">
        Add Detail
      </v-card-title>

      <v-card-text>
        <DetailComment
          ref="detailComment"
          v-model="comment"
          autofocus
          placeholder="Add a Detail that will appear on the ledger for this entity."
          @valid="detailCommentValid=$event"
        />
      </v-card-text>

      <v-card-actions class="pt-0">
        <v-spacer />
        <div class="form__btns">
          <v-btn
            id="dialog-save-button"
            text
            color="primary"
            :disabled="!detailCommentValid || saving"
            :loading="saving"
            @click.native="save()"
          >
            Save
          </v-btn>
          <v-btn
            id="dialog-cancel-button"
            text
            color="secondary"
            :disabled="saving"
            :loading="saving"
            @click.native="emitClose(false)"
          >
            Cancel
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Watch, Emit, Vue } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { DetailComment } from '@/components/common'
import { ApiFilingIF } from '@/interfaces'

@Component({
  components: { DetailComment }
})
export default class AddCommentDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** The filing to add a comment to. */
  @Prop({ default: null }) readonly filing!: ApiFilingIF

  /** The comment text. */
  comment = ''

  /** Whether the detail component is valid. */
  detailCommentValid = false

  /** Whether this component is currently saving. */
  saving = false

  /** Called when prop changes (ie, dialog is shown/hidden). */
  @Watch('dialog')
  onDialogChanged (val: boolean): void {
    // when dialog is shown, reset comment and validation
    if (val) {
      this.comment = ''
      const dc = this.$refs.detailComment as any
      if (dc) {
        dc.resetValidation()
      }
    }
  }

  /**
   * Emits event to close this dialog.
   * @param needReload Whether the dashboard needs to be reloaded.
   */
  @Emit('close')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitClose (needReload: boolean): void { /* no empty function */ }

  /** Saves the current comment. */
  async save (): Promise<void> {
    // prevent double saving
    if (this.saving) return

    // ensure we have a valid filing
    if (!this.filing?.filingId || !this.filing?.commentsLink) {
      // eslint-disable-next-line no-console
      console.log('save() error - invalid filing =', this.filing)
      return
    }

    this.saving = true

    const data = {
      comment: {
        filingId: this.filing.filingId,
        comment: this.comment
      }
    }

    const url = this.filing.commentsLink
    let success = false
    await axios.post(url, data).then(() => {
      success = true
    }).catch(error => {
      // eslint-disable-next-line no-console
      console.log('save() error =', error)
      alert('Could not save your comment. Please try again or cancel.')
    })

    this.saving = false
    if (success) this.emitClose(true)
  }
}
</script>
