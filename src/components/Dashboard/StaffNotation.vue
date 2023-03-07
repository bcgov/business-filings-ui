<template>
  <div id="staff-notation" :class="{ 'add-scrollbar-offset': addScrollbarOffset }">
    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsNotation"
      @close="hideRegistrarsNotationDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.REGISTRARS_NOTATION"
      :name="FilingTypes.REGISTRARS_NOTATION"
    />

    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsOrder"
      @close="hideRegistrarsOrderDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.REGISTRARS_ORDER"
      :name="FilingTypes.REGISTRARS_ORDER"
    />

    <AddStaffNotationDialog
      :dialog="isAddingCourtOrder"
      @close="hideCourtOrderDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.COURT_ORDER"
      :name="FilingTypes.COURT_ORDER"
      courtOrderNumberRequired="true"
    />

    <AddStaffNotationDialog
      :dialog="isAddingAdministrativeDissolution"
      @close="hideAdministrativeDissolutionDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.DISSOLUTION_ADMINISTRATIVE"
      :name="FilingTypes.DISSOLUTION"
      :dissolutionType="FilingSubTypes.DISSOLUTION_ADMINISTRATIVE"
    />

    <AddStaffNotationDialog
      :dialog="isAddingPutBackOn"
      @close="hidePutBackOnDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.PUT_BACK_ON"
      :name="FilingTypes.PUT_BACK_ON"
    />

    <AddStaffNotationDialog
      :dialog="isAddingAdministerFreeze"
      @close="hideAdministerFreezeDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.ADMIN_FREEZE"
      :name="FilingTypes.ADMIN_FREEZE"
    />

    <div class="staff-notation-container">
      <v-menu offset-y transition="slide-y-transition" v-model="expand">
        <template v-slot:activator="{ on }">
          <v-btn text color="primary" class="menu-btn pr-3" v-on="on">
            <v-icon color="primary">mdi-plus</v-icon>
            <span>Add Staff Filing</span>
            <v-icon v-if="expand">mdi-menu-up</v-icon>
            <v-icon v-else>mdi-menu-down</v-icon>
          </v-btn>
        </template>

        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item
              data-type="registrars-notation"
              @click="showRegistrarsNotationDialog()"
              :disabled="!isAllowed(AllowableActions.REGISTRARS_NOTATION)"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Notation</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="registrars-order"
              @click="showRegistrarsOrderDialog()"
              :disabled="!isAllowed(AllowableActions.REGISTRARS_ORDER)"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="court-order"
              @click="showCourtOrderDialog()"
              :disabled="!isAllowed(AllowableActions.COURT_ORDER)"
            >
              <v-list-item-title>
                <span class="app-blue">Add Court Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isFirm"
              data-type="record-conversion"
              @click="goToConversionFiling()"
              :disabled="!isAllowed(AllowableActions.RECORD_CONVERSION)"
            >
              <v-list-item-title>
                <span class="app-blue">Record Conversion</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="!isHistorical"
              data-type="administrative-dissolution"
              @click="showAdministrativeDissolutionDialog()"
              :disabled="!isAllowed(AllowableActions.ADMINISTRATIVE_DISSOLUTION)"
            >
              <v-list-item-title>
                <span class="app-blue">Administrative Dissolution</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.RESTORATION)"
              data-type="restoration"
              @click="goToRestorationFiling(ApplicationTypes.CREATE_UI, FilingSubTypes.RESTORATION_FULL)"
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
              data-type="consent-continue-out"
              @click="goToConsentContinuationOutFiling()"
              :disabled="!isAllowed(AllowableActions.CONSENT_CONTINUATION_OUT)"
            >
              <v-list-item-title>
                <span class="app-blue">Consent to Continuation Out</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.LIMITED_RESTO_EXTEND)"
              data-type="extend-limited-restoration"
              @click="goToRestorationFiling(ApplicationTypes.EDIT_UI, FilingSubTypes.RESTORATION_EXTENSION)"
            >
              <v-list-item-title>
                <span class="app-blue">Extend Limited Restoration</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              v-if="isAllowed(AllowableActions.LIMITED_RESTO_CONVERT)"
              data-type="convert-full-restoration"
              @click="goToRestorationFiling(ApplicationTypes.EDIT_UI, FilingSubTypes.RESTORATION_CONVERSION)"
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
import Vue from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
import { navigate } from '@/utils'
import {
  AllowableActions,
  ApplicationTypes,
  FilingNames,
  FilingSubTypes,
  FilingTypes,
  Routes
} from '@/enums'
import { AddStaffNotationDialog } from '@/components/dialogs'
import { AllowableActionsMixin, FilingMixin } from '@/mixins'
import { LegalServices } from '@/services'
import { mapGetters } from 'vuex'

@Component({
  components: { AddStaffNotationDialog },
  computed: {
    ...mapGetters([
      'getCreateUrl',
      'getEditUrl',
      'getIdentifier',
      'isAdminFrozen',
      'isFirm',
      'isHistorical',
      'isInLimitedRestoration'
    ])
  },
  mixins: [
    AllowableActionsMixin,
    FilingMixin
  ]
})
export default class StaffNotation extends Vue {
  private isAddingAdministerFreeze = false
  private isAddingAdministrativeDissolution = false
  private isAddingCourtOrder = false
  private isAddingPutBackOn = false
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private expand = false

  // enums for template
  readonly AllowableActions = AllowableActions
  readonly ApplicationTypes = ApplicationTypes
  readonly FilingNames = FilingNames
  readonly FilingSubTypes = FilingSubTypes
  readonly FilingTypes = FilingTypes

  /** Prop for the scrollbar offset to be added. */
  @Prop() readonly addScrollbarOffset!: string

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

  goToConversionFiling ():void {
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

  goToConsentContinuationOutFiling ():void {
    // 0 means "new filing"
    this.$router.push({ name: Routes.CONSENT_CONTINUATION_OUT, params: { filingId: '0' } })
  }

  async goToRestorationFiling (applicationName: ApplicationTypes, restorationType: FilingSubTypes): Promise<void> {
    let url: string
    try {
      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      // create restoration draft filing
      const restoration = this.buildRestorationFiling(restorationType)
      const filing = await LegalServices.createFiling(this.getIdentifier, restoration, true)
      const id = +filing?.header?.filingId

      if (isNaN(id)) throw new Error('Invalid API response')

      // navigate to Create UI if Full/Limited restoration
      // navigate to Edit UI if Limited extension/Full to Limited conversion
      if (applicationName === ApplicationTypes.CREATE_UI) {
        url = `${this.getCreateUrl}?id=${this.getIdentifier}`
      }
      if (applicationName === ApplicationTypes.EDIT_UI) {
        url = `${this.getEditUrl}${this.getIdentifier}/` + restorationType + `?restoration-id=${id}`
      }

      navigate(url)
    } catch (error) {
      // clear spinner on error
      this.$root.$emit('showSpinner', false)

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
  private close (needReload: boolean): void {}
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.staff-notation-container {
  display: inline-block;

  .expand-btn {
    letter-spacing: -0.01rem;
    font-size: $px-14;
    font-weight: 700;
  }
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
