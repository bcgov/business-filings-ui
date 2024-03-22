<template>
  <div class="header-actions">
    <!-- the main button -->
    <v-btn
      class="expand-btn"
      outlined
      color="primary"
      :ripple="false"
      @click.stop="toggleFilingHistoryItem(index)"
    >
      <template v-if="filing.availableOnPaperOnly">
        <span class="view-details app-blue">Request a Copy</span>
        <span class="hide-details app-blue">Close</span>
      </template>
      <template v-else-if="isTypeStaff">
        <span class="view-details app-blue">View</span>
        <span class="hide-details app-blue">Hide</span>
      </template>
      <template v-else-if="filing.documentsLink">
        <span class="view-details app-blue">View Documents</span>
        <span class="hide-details app-blue">Hide Documents</span>
      </template>
    </v-btn>

    <!-- the drop-down menu -->
    <v-menu
      v-if="!isDisableNonBenCorps && isRoleStaff && isBusiness"
      offset-y
      left
      transition="slide-y-transition"
    >
      <template #activator="{ on }">
        <v-btn
          text
          class="menu-btn app-blue pa-1"
          click.stop
          v-on="on"
        >
          <v-icon>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list dense>
        <v-list-item-group color="primary">
          <v-list-item
            :disabled="disableCorrection()"
            @click.stop="correctThisFiling(filing)"
          >
            <v-list-item-icon>
              <v-icon color="primary">
                mdi-file-document-edit-outline
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title class="file-correction-item">
              <span class="app-blue">File a Correction</span>
            </v-list-item-title>
          </v-list-item>

          <v-list-item
            :disabled="!isAllowed(AllowableActions.DETAIL_COMMENT)"
            @click.stop="showCommentDialog(filing)"
          >
            <v-list-item-icon>
              <v-icon color="primary">
                mdi-comment-plus
              </v-icon>
            </v-list-item-icon>
            <v-list-item-title class="add-detail-comment-item">
              <span class="app-blue">Add Detail</span>
            </v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { AllowableActions, FilingTypes, Routes } from '@/enums'
import { ApiFilingIF } from '@/interfaces'
import { AllowableActionsMixin } from '@/mixins'
import { EnumUtilities } from '@/services'
import { useBusinessStore, useFilingHistoryListStore } from '@/stores'

@Component({})
export default class HeaderActions extends Mixins(AllowableActionsMixin) {
  readonly AllowableActions = AllowableActions

  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) isBenBcCccUlc!: boolean
  @Getter(useBusinessStore) isDisableNonBenCorps!: boolean
  // @Getter(useAuthenticationStore) isRoleStaff!: boolean

  @Action(useFilingHistoryListStore) showCommentDialog!: (x: ApiFilingIF) => void
  @Action(useFilingHistoryListStore) setCurrentFiling!: (x: ApiFilingIF) => void
  @Action(useFilingHistoryListStore) setFileCorrectionDialog!: (x: boolean) => void
  @Action(useFilingHistoryListStore) toggleFilingHistoryItem!: (x: number) => Promise<void>

  /** Whether this entity is a business (and not a temporary registration). */
  get isBusiness (): boolean {
    return !!sessionStorage.getItem('BUSINESS_ID')
  }

  get isTypeStaff (): boolean {
    return EnumUtilities.isTypeStaff(this.filing)
  }

  /**
   * Whether to disable correction for THIS filing.
   * This is function instead of a getter so that we always query the realtime FF.
   */
  disableCorrection (): boolean {
    // first check allowable actions
    if (!this.isAllowed(AllowableActions.CORRECTION)) return true

    const conditions: Array<() => boolean> = []
    // list of conditions to DISABLE correction
    // (any condition not listed below is ALLOWED)
    conditions[0] = () => this.filing.availableOnPaperOnly
    conditions[1] = () => this.isTypeStaff
    conditions[2] = () => (
      this.filing.isFutureEffective &&
      !EnumUtilities.isStatusCompleted(this.filing) &&
      !EnumUtilities.isStatusCorrected(this.filing)
    )
    conditions[3] = () => (EnumUtilities.isTypeIncorporationApplication(this.filing) &&
      !this.isBenBcCccUlc && !this.isCoop)
    conditions[4] = () => (EnumUtilities.isTypeChangeOfRegistration(this.filing) && !this.isFirm)
    conditions[5] = () => (EnumUtilities.isTypeCorrection(this.filing) && !this.isFirm &&
      !this.isBenBcCccUlc && !this.isCoop)
    conditions[6] = () => (EnumUtilities.isTypeRegistration(this.filing) && !this.isFirm)
    conditions[7] = () => (EnumUtilities.isTypeAmalgamation(this.filing) && !this.isBenBcCccUlc)

    // check if any condition is True
    return conditions.some(condition => condition())
  }

  /** Called by File a Correction button to correct the subject filing. */
  async correctThisFiling (filing: ApiFilingIF): Promise<void> {
    // see also TodoList.vue:doResumeFiling()
    switch (filing?.name) {
      case FilingTypes.ALTERATION:
      case FilingTypes.AMALGAMATION_APPLICATION:
      case FilingTypes.CHANGE_OF_REGISTRATION:
      case FilingTypes.CORRECTION:
      case FilingTypes.INCORPORATION_APPLICATION:
      case FilingTypes.REGISTRATION:
      case FilingTypes.SPECIAL_RESOLUTION:
        // correction via Edit UI
        this.setCurrentFiling(filing)
        this.setFileCorrectionDialog(true)
        break

      case FilingTypes.CHANGE_OF_ADDRESS:
      case FilingTypes.CHANGE_OF_DIRECTORS:
        if (this.isBenBcCccUlc || this.isCoop) {
          // correction via Edit UI if current type is BC, CC, ULC, BEN or COOP
          this.setCurrentFiling(filing)
          this.setFileCorrectionDialog(true)
          break
        } else {
          // Local correction otherwise
          this.$router.push({
            name: Routes.CORRECTION,
            params: { correctedFilingId: filing.filingId.toString() }
          })
          break
        }

      case FilingTypes.ANNUAL_REPORT:
      case FilingTypes.CONVERSION:
      default:
        // local correction for all other filings
        this.$router.push({
          name: Routes.CORRECTION,
          params: { correctedFilingId: filing.filingId.toString() }
        })
        break
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.header-actions {
  text-align: right;
  min-width: 12rem;
}

.expand-btn {
  letter-spacing: -0.01rem;
  font-size: $px-14;
  font-weight: bold;
  border: none;
}

// when panel is active, hide View span
.v-expansion-panel.v-expansion-panel--active .view-details {
  display: none;
}

// when panel is not active, hide Hide span
.v-expansion-panel:not(.v-expansion-panel--active) .hide-details {
  display: none;
}

// make menu button slightly smaller
.menu-btn {
  height: unset !important;
  min-width: unset !important;
  padding: 0.25rem !important;
}

// gray out disabled menu items
:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}
</style>
