<template>
  <div class="header-actions">
    <!-- the main button -->
    <v-btn
      class="expand-btn"
      :class="{ 'bootstrap-filing': isBootstrapFiling }"
      outlined
      color="primary"
      :ripple="false"
      @click.stop="toggleFilingHistoryItem(index)"
    >
      <template v-if="filing.availableOnPaperOnly">
        <span class="view-details app-blue">Request a Copy</span>
        <span class="hide-details app-blue">Close</span>
      </template>
      <template v-else-if="isTypeStaff || isBootstrapFiling">
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
import { AllowableActions } from '@/enums'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { ApiFilingIF } from '@/interfaces'
import { AllowableActionsMixin } from '@/mixins'
import { EnumUtilities } from '@/services'
import { useBusinessStore, useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({})
export default class HeaderActions extends Mixins(AllowableActionsMixin) {
  readonly AllowableActions = AllowableActions

  @Prop({ required: true }) readonly filing!: ApiFilingIF
  @Prop({ required: true }) readonly index!: number

  @Getter(useBusinessStore) isBaseCompany!: boolean
  @Getter(useRootStore) isBootstrapFiling!: boolean
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
   * (This is function instead of a getter so that we always query the realtime FF.)
   */
  disableCorrection (): boolean {
    // disable if not allowed
    if (!this.isAllowed(AllowableActions.CORRECTION)) return true

    // disable if filing is paper-only
    if (this.filing.availableOnPaperOnly) return true

    // disable if filing is future effective but is not completed or corrected
    if (
      this.filing.isFutureEffective &&
      !EnumUtilities.isStatusCompleted(this.filing) &&
      !EnumUtilities.isStatusCorrected(this.filing)
    ) return true

    // disable for certain filing types
    switch (true) {
      case EnumUtilities.isTypeAdminFreeze(this.filing): return true // staff filing not allowed
      case EnumUtilities.isTypeAlteration(this.filing): break
      case EnumUtilities.isTypeAgmExtension(this.filing): return true // not supported
      case EnumUtilities.isTypeAgmLocationChange(this.filing): return true // not supported
      case EnumUtilities.isTypeAmalgamationApplication(this.filing):
        // disable if not a base company (safety check for filing compatibility)
        if (!this.isBaseCompany) return true
        break
      case EnumUtilities.isTypeAmalgamationOut(this.filing): return true // not supported
      case EnumUtilities.isTypeAnnualReport(this.filing): return true // not supported
      case EnumUtilities.isTypeChangeOfAddress(this.filing): break
      case EnumUtilities.isTypeChangeOfCompanyInfo(this.filing): return true // not supported
      case EnumUtilities.isTypeChangeOfDirectors(this.filing): break
      case EnumUtilities.isTypeChangeOfName(this.filing): break
      case EnumUtilities.isTypeChangeOfRegistration(this.filing):
        // disable if not a firm (safety check for filing compatibility)
        if (!this.isFirm) return true
        break
      case EnumUtilities.isTypeConsentAmalgamationOut(this.filing): return true // not supported
      case EnumUtilities.isTypeConsentContinuationOut(this.filing): return true // not supported
      case EnumUtilities.isTypeContinuationIn(this.filing):
        // disable if not a base company (safety check for filing compatibility)
        if (!this.isBaseCompany) return true
        break
      case EnumUtilities.isTypeContinuationOut(this.filing): return true // not supported
      case EnumUtilities.isTypeConversion(this.filing): return true // not supported
      case EnumUtilities.isTypeCorrection(this.filing):
        // disable if not a firm, base company, or coop (safety check for filing compatibility)
        if (!this.isFirm && !this.isBaseCompany && !this.isCoop) return true
        break
      case EnumUtilities.isTypeCourtOrder(this.filing): return true // staff filing not allowed
      case EnumUtilities.isTypeDissolution(this.filing): return true // not supported
      case EnumUtilities.isTypeDissolved(this.filing): return true // not supported
      case EnumUtilities.isTypeIncorporationApplication(this.filing):
        // disable if not a base company or coop (safety check for filing compatibility)
        if (!this.isBaseCompany && !this.isCoop) return true
        break
      case EnumUtilities.isTypePutBackOn(this.filing): return true // staff filing not allowed
      case EnumUtilities.isTypeRegistration(this.filing):
        // disable if not a firm (safety check for filing compatibility)
        if (!this.isFirm) return true
        break
      case EnumUtilities.isTypeRegistrarsNotation(this.filing): return true // staff filing not allowed
      case EnumUtilities.isTypeRegistrarsOrder(this.filing): return true // staff filing not allowed
      case EnumUtilities.isTypeRestoration(this.filing): return true // not supported
      case EnumUtilities.isTypeSpecialResolution(this.filing): break
      case EnumUtilities.isTypeTransition(this.filing): return true // not supported
    }

    // if we get this far then don't disable correction
    return false
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
        return

      case FilingTypes.CHANGE_OF_ADDRESS:
      case FilingTypes.CHANGE_OF_DIRECTORS:
        if (this.isBaseCompany || this.isCoop) {
          // correction via Edit UI if current type is BEN/BC/CC/ULC/C/CBEN/CCC/CUL or CP
          this.setCurrentFiling(filing)
          this.setFileCorrectionDialog(true)
          return
        }
        break
    }

    // correction is not supported for all other filings
    // eslint-disable-next-line no-console
    console.log('correctThisFiling(), invalid correction type for filing =', this.filing)
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

// when panel is active and this is a bootstrap filing, hide button
.v-expansion-panel.v-expansion-panel--active .bootstrap-filing {
  display: none;
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
