<template>
  <div
    v-if="!isDisableNonBenCorps"
    id="staff-notation"
    :class="{ 'add-scrollbar-offset': addScrollbarOffset }"
  >
    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsNotation"
      attach="#staff-notation"
      :displayName="FilingNames.REGISTRARS_NOTATION"
      :name="FilingTypes.REGISTRARS_NOTATION"
      @close="hideRegistrarsNotationDialog($event)"
    />

    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsOrder"
      attach="#staff-notation"
      :displayName="FilingNames.REGISTRARS_ORDER"
      :name="FilingTypes.REGISTRARS_ORDER"
      @close="hideRegistrarsOrderDialog($event)"
    />

    <AddStaffNotationDialog
      :dialog="isAddingCourtOrder"
      attach="#staff-notation"
      :displayName="FilingNames.COURT_ORDER"
      :name="FilingTypes.COURT_ORDER"
      courtOrderNumberRequired="true"
      @close="hideCourtOrderDialog($event)"
    />

    <AddStaffNotationDialog
      :dialog="isAddingAdministrativeDissolution"
      attach="#staff-notation"
      :displayName="FilingNames.DISSOLUTION_ADMINISTRATIVE"
      :name="FilingTypes.DISSOLUTION"
      :dissolutionType="FilingSubTypes.DISSOLUTION_ADMINISTRATIVE"
      @close="hideAdministrativeDissolutionDialog($event)"
    />

    <AddStaffNotationDialog
      :dialog="isAddingPutBackOn"
      attach="#staff-notation"
      :displayName="FilingNames.PUT_BACK_ON"
      :name="FilingTypes.PUT_BACK_ON"
      @close="hidePutBackOnDialog($event)"
    />

    <AddStaffNotationDialog
      :dialog="isAddingAdministerFreeze"
      attach="#staff-notation"
      :displayName="FilingNames.ADMIN_FREEZE"
      :name="FilingTypes.ADMIN_FREEZE"
      @close="hideAdministerFreezeDialog($event)"
    />

    <div class="staff-notation-container">
      <v-menu
        v-model="expand"
        offset-y
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <v-btn
            text
            color="primary"
            class="menu-btn pr-3"
            v-on="on"
          >
            <v-icon color="primary">
              mdi-plus
            </v-icon>
            <span>Add Staff Filing</span>
            <v-icon v-if="expand">
              mdi-menu-up
            </v-icon>
            <v-icon v-else>
              mdi-menu-down
            </v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item
              data-type="registrars-notation"
              :disabled="!isAllowed(AllowableActions.REGISTRARS_NOTATION)"
              @click="showRegistrarsNotationDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Notation</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="registrars-order"
              :disabled="!isAllowed(AllowableActions.REGISTRARS_ORDER)"
              @click="showRegistrarsOrderDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="court-order"
              :disabled="!isAllowed(AllowableActions.COURT_ORDER)"
              @click="showCourtOrderDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">Add Court Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isEntityFirm"
              data-type="record-conversion"
              :disabled="!isAllowed(AllowableActions.RECORD_CONVERSION)"
              @click="goToConversionFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Record Conversion</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical"
              data-type="administrative-dissolution"
              :disabled="!isAllowed(AllowableActions.ADMINISTRATIVE_DISSOLUTION)"
              @click="showAdministrativeDissolutionDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">Administrative Dissolution</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isHistorical"
              data-type="restoration"
              :disabled="!isAllowed(AllowableActions.RESTORATION)"
              @click="goToRestorationFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Restore Company</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.PUT_BACK_ON)"
              data-type="put-back-on"
              @click="showPutBackOnDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">Put Back On</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.FREEZE_UNFREEZE)"
              data-type="admin-freeze"
              @click="showAdministerFreezeDialog()"
            >
              <v-list-item-title>
                <span class="app-blue">{{ isAdminFrozen ? 'Unfreeze Business' : 'Freeze Business' }}</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical && showConsentAmalgamateOut"
              data-type="consent-amalgamate-out"
              :disabled="!isAllowed(AllowableActions.CONSENT_AMALGAMATION_OUT)"
              @click="goToConsentAmalgamationOutFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Consent to Amalgamate Out</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical && showAmalgamateOut"
              data-type="amalgamate-out"
              :disabled="!isAllowed(AllowableActions.AMALGAMATION_OUT)"
              @click="goToAmalgamationOutFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Amalgamate Out</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical && showConsentContinueOut"
              data-type="consent-continue-out"
              :disabled="!isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)"
              @click="goToConsentContinuationOutFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Consent to Continuation Out</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical && showContinueOut"
              data-type="continue-out"
              :disabled="!isAllowed(AllowableActions.CONTINUATION_OUT)"
              @click="goToContinuationOutFiling()"
            >
              <v-list-item-title>
                <span class="app-blue">Continue Out</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.LIMITED_RESTORATION_EXTENSION)"
              data-type="extend-limited-restoration"
              @click="goToRestorationFiling(FilingSubTypes.LIMITED_RESTORATION_EXTENSION)"
            >
              <v-list-item-title>
                <span class="app-blue">Extend Limited Restoration</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.LIMITED_RESTORATION_TO_FULL)"
              data-type="convert-full-restoration"
              @click="goToRestorationFiling(FilingSubTypes.LIMITED_RESTORATION_TO_FULL)"
            >
              <v-list-item-title>
                <span class="app-blue">Convert to Full Restoration</span>
              </v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Emit, Mixins, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { GetFeatureFlag, navigate } from '@/utils'
import { AllowableActions, FilingSubTypes, Routes } from '@/enums'
import { FilingNames, FilingTypes } from '@bcrs-shared-components/enums'
import { AddStaffNotationDialog } from '@/components/dialogs'
import { AllowableActionsMixin, FilingMixin } from '@/mixins'
import { LegalServices } from '@/services'
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'

@Component({
  components: { AddStaffNotationDialog }
})
export default class StaffNotation extends Mixins(AllowableActionsMixin, FilingMixin) {
  isAddingAdministerFreeze = false
  isAddingAdministrativeDissolution = false
  isAddingCourtOrder = false
  isAddingPutBackOn = false
  isAddingRegistrarsNotation = false
  isAddingRegistrarsOrder = false
  expand = false

  // enums for template
  readonly AllowableActions = AllowableActions
  readonly FilingNames = FilingNames
  readonly FilingSubTypes = FilingSubTypes
  readonly FilingTypes = FilingTypes

  /** Prop for the scrollbar offset to be added. */
  @Prop() readonly addScrollbarOffset!: string

  @Getter(useConfigurationStore) getCreateUrl!: string
  @Getter(useConfigurationStore) getEditUrl!: string
  @Getter(useBusinessStore) isAdminFrozen!: boolean
  @Getter(useBusinessStore) isBaseCompany!: boolean
  @Getter(useBusinessStore) isDisableNonBenCorps!: boolean
  // @Getter(useBusinessStore) isEntityCoop!: boolean
  // @Getter(useBusinessStore) isEntityFirm!: boolean
  @Getter(useBusinessStore) isHistorical!: boolean

  @Action(useRootStore) setFetchingDataSpinner!: (x: boolean) => void

  showRegistrarsNotationDialog (): void {
    this.isAddingRegistrarsNotation = true
  }

  hideRegistrarsNotationDialog (needReload: boolean): void {
    this.isAddingRegistrarsNotation = false
    this.close(needReload)
  }

  showRegistrarsOrderDialog (): void {
    this.isAddingRegistrarsOrder = true
  }

  hideRegistrarsOrderDialog (needReload: boolean): void {
    this.isAddingRegistrarsOrder = false
    this.close(needReload)
  }

  showCourtOrderDialog (): void {
    this.isAddingCourtOrder = true
  }

  hideCourtOrderDialog (needReload: boolean): void {
    this.isAddingCourtOrder = false
    this.close(needReload)
  }

  goToConversionFiling (): void {
    const url = `${this.getEditUrl}${this.getIdentifier}/conversion`
    navigate(url)
  }

  showAdministrativeDissolutionDialog (): void {
    this.isAddingAdministrativeDissolution = true
  }

  hideAdministrativeDissolutionDialog (needReload: boolean): void {
    this.isAddingAdministrativeDissolution = false
    this.close(needReload)
  }

  get showConsentAmalgamateOut (): boolean {
    return (
      (this.isBaseCompany || this.isEntityCoop) &&
      !!GetFeatureFlag('supported-consent-amalgamation-out-entities').includes(this.getLegalType)
    )
  }

  get showAmalgamateOut (): boolean {
    return (
      (this.isBaseCompany || this.isEntityCoop) &&
      !!GetFeatureFlag('supported-amalgamation-out-entities').includes(this.getLegalType)
    )
  }

  get showConsentContinueOut (): boolean {
    return (
      (this.isBaseCompany || this.isEntityCoop) &&
      !!GetFeatureFlag('supported-consent-continuation-out-entities').includes(this.getLegalType)
    )
  }

  get showContinueOut (): boolean {
    return (
      (this.isBaseCompany || this.isEntityCoop) &&
      !!GetFeatureFlag('supported-continuation-out-entities').includes(this.getLegalType)
    )
  }

  goToConsentAmalgamationOutFiling (): void {
    // 0 means "new filing"
    this.$router.push({ name: Routes.CONSENT_AMALGAMATION_OUT, query: { filingId: '0' } })
  }

  goToAmalgamationOutFiling ():void {
    // 0 means "new filing"
    this.$router.push({ name: Routes.AMALGAMATION_OUT, query: { filingId: '0' } })
  }

  goToConsentContinuationOutFiling (): void {
    // 0 means "new filing"
    this.$router.push({ name: Routes.CONSENT_CONTINUATION_OUT, query: { filingId: '0' } })
  }

  goToContinuationOutFiling ():void {
    // 0 means "new filing"
    this.$router.push({ name: Routes.CONTINUATION_OUT, query: { filingId: '0' } })
  }

  async goToRestorationFiling (restorationType: FilingSubTypes = null): Promise<void> {
    let url: string

    try {
      // show spinner since the network calls below can take a few seconds
      this.setFetchingDataSpinner(true)

      // create restoration draft filing
      const restoration = this.buildRestorationFiling(restorationType)
      const filing = await LegalServices.createFiling(this.getIdentifier, restoration, true)
      const id = +filing?.header?.filingId

      if (isNaN(id)) throw new Error('Invalid API response')

      // navigate to Edit UI for limited restoration extension filing
      // navigate to Edit UI for limited restoration to full filing
      // navigate to Create UI for full or limited restoration filing
      if (restorationType === FilingSubTypes.LIMITED_RESTORATION_EXTENSION) {
        url = `${this.getEditUrl}${this.getIdentifier}/limitedRestorationExtension?restoration-id=${id}`
      } else if (restorationType === FilingSubTypes.LIMITED_RESTORATION_TO_FULL) {
        url = `${this.getEditUrl}${this.getIdentifier}/limitedRestorationToFull?restoration-id=${id}`
      } else {
        url = `${this.getCreateUrl}?id=${this.getIdentifier}`
      }

      navigate(url)
    } catch (error) {
      // clear spinner on error
      this.setFetchingDataSpinner(false)

      alert(`Could not create restoration filing. Please try again or cancel.`)
    }
  }

  showPutBackOnDialog (): void {
    this.isAddingPutBackOn = true
  }

  hidePutBackOnDialog (needReload: boolean): void {
    this.isAddingPutBackOn = false
    this.close(needReload)
  }

  showAdministerFreezeDialog (): void {
    this.isAddingAdministerFreeze = true
  }

  hideAdministerFreezeDialog (needReload: boolean): void {
    this.isAddingAdministerFreeze = false
    this.close(needReload)
  }

  @Emit('close')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  close (needReload: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.staff-notation-container {
  display: inline-block;
}

// This class will be applied when addScrollbarOffset prop is true.
// This is necessary to align with FilingHistoryList component that may have an active scroll bar.
.add-scrollbar-offset {
  overflow-y: scroll;
  scrollbar-color: transparent transparent; // FireFox uses this property

  // Webkit browsers use ::-webkit-scrollbar pseudo element
  &::-webkit-scrollbar {
    background: transparent;
  }
}

// Fix the transparent added by .add-scrollbar-offset (Firefox only).
:deep(.add-staff-notation-dialog) {
  scrollbar-color: auto;
}

.v-icon.mdi-plus {
  font-size: 1.2rem;
  padding: 0.2rem;
  margin-bottom: 0.2rem;
}

#app > div.v-menu__content {
  margin: 0.625rem 0 0 0;
}

:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}

.v-icon.mdi-plus {
  margin-top: 2px;
}
</style>
