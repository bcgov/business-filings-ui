<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach">
    <v-card>
      <v-card-title class="pt-8">Correction Filing</v-card-title>

      <v-card-text class="font-15">
        <p>Select who caused the correction. If client, completing party information and certification
          will be required. If staff, completing party information and certification will not be required.</p>
        <v-radio-group v-model="correctionOption">
          <v-radio id="fas-radio" class="mb-0 pt-2" label="Client Error" :value="correctionOptions.CLIENT" />
          <v-radio id="bcol-radio" class="mb-0 pt-2" label="Staff Error" :value="correctionOptions.STAFF" />
        </v-radio-group>
        <template v-if="!hasChosenCorrection">
          <p class="font-15 option-error">Choose one option to proceed</p>
        </template>
      </v-card-text>

      <v-card-actions class="py-10">
        <v-btn outlined large
          class="mr-2"
          color="primary"
          id="dialog-exit-button"
          @click="exit()"
        > Cancel </v-btn>
        <v-btn depressed large
          color="primary"
          id="dialog-start-button"
          @click="checkToStart()"
        >Start Correction</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { ContactInfo } from '@/components/common'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class FileCorrectionDialog extends Vue {
  // Initialize hasChosenCorrection.
  private hasChosenCorrection = true

  /** Radio group model property. */
  private correctionOptions = {
    NONE: 0,
    CLIENT: 1,
    STAFF: 2
  }

  private correctionOption = this.correctionOptions.NONE

  // Prop to display the dialog.
  @Prop() readonly dialog: boolean

  // Prop to provide attachment selector.
  @Prop() readonly attach: string

  // Pass click event to parent.
  @Emit() private exit () {
    this.hasChosenCorrection = true
    this.correctionOption = this.correctionOptions.NONE
  }

  private checkToStart () {
    if (this.correctionOption === this.correctionOptions.NONE) {
      this.hasChosenCorrection = false
    } else {
      this.hasChosenCorrection = true
      this.emitStart(true)
    }
  }

  /** Called when payment option (radio group item) has changed. */
  @Watch('correctionOption')
  private onCorrectionOptionChanged (val: number): void {
    switch (val) {
      case this.correctionOptions.CLIENT:
        this.correctionOption = this.correctionOptions.CLIENT
        this.hasChosenCorrection = true
        break
      case this.correctionOptions.STAFF:
        this.correctionOption = this.correctionOptions.STAFF
        this.hasChosenCorrection = true
        break
      default:
        break
    }
  }

  /**
   * Emits event to Edit UI for correction.
   * @param startCorrection Whether to redirect to start correction.
   */
  @Emit('start')
  private emitStart (startCorrection: boolean): void { }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

::v-deep .v-dialog {
  .v-card {
    .v-card__title {
      color: black;
      background: #ffff;
      font-weight: bold;
    }
    .v-card__actions {
      justify-content: center;
    }
    .option-error {
      color: $app-red;
    }
  }
}
</style>
