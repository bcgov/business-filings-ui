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
      :displayName="DissolutionNames.ADMINISTRATIVE"
      :name="FilingTypes.DISSOLUTION"
      :dissolutionType="DissolutionTypes.ADMINISTRATIVE"
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
              disabled="disabled"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Notation</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="registrars-order"
              @click="showRegistrarsOrderDialog()"
              :disabled="disabled || isAdminFreeze"
            >
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="court-order"
              @click="showCourtOrderDialog()"
              :disabled="disabled || isAdminFreeze"
            >
              <v-list-item-title>
                <span class="app-blue">Add Court Order</span>
              </v-list-item-title>
            </v-list-item>

            <v-list-item
              data-type="record-conversion"
              @click="goToConversionFiling()"
              :disabled="disabled || !isFirm || isAdminFreeze"
            >
              <v-list-item-title>
                <span class="app-blue">Record Conversion</span>
              </v-list-item-title>
            </v-list-item>

            <template v-if="(isFirm || isCoop || isBenBcCccUlc) && !isHistorical">
              <v-list-item
                data-type="administrative-dissolution"
                @click="showAdministrativeDissolutionDialog()"
                :disabled="disabled  || isAdminFreeze"
              >
                <v-list-item-title>
                  <span class="app-blue">Administrative Dissolution</span>
                </v-list-item-title>
              </v-list-item>
            </template>

            <template v-if="isBenBcCccUlc && isHistorical">
              <v-list-item
                data-type="restoration"
                @click="goToRestorationFiling()"
              >
                <v-list-item-title>
                  <span class="app-blue">Restore Company</span>
                </v-list-item-title>
              </v-list-item>
            </template>

            <template v-if="(isFirm || isCoop || isBenBcCccUlc) && isHistorical">
              <v-list-item
                data-type="put-back-on"
                @click="showPutBackOnDialog()"
              >
                <v-list-item-title>
                  <span class="app-blue">Put Back On</span>
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-if="!isHistorical">
              <v-list-item @click="showAdministerFreezeDialog()">
                <v-list-item-title>
                  <span class="app-blue">{{ isAdminFreeze ? 'Administer Unfreeze' : 'Administer freeze' }}</span>
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-list-item-group>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { navigate } from '@/utils'
import { DissolutionTypes, DissolutionNames, FilingTypes, FilingNames } from '@/enums'
import { AddStaffNotationDialog } from '@/components/dialogs'
import { FilingMixin } from '@/mixins'
import { LegalServices } from '@/services'

@Component({
  components: { AddStaffNotationDialog },
  mixins: [FilingMixin]
})
export default class StaffNotation extends Vue {
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private isAddingCourtOrder = false
  private isAddingPutBackOn = false
  private isAddingAdministrativeDissolution = false
  private isAddingAdministerFreeze = false
  private expand = false

  // enum for template
  readonly FilingTypes = FilingTypes
  readonly FilingNames = FilingNames
  readonly DissolutionTypes = DissolutionTypes
  readonly DissolutionNames = DissolutionNames

  /** Prop for the scrollbar offset to be added. */
  @Prop() readonly addScrollbarOffset!: string

  /** Prop for disabling the menu items. */
  @Prop({ default: false }) readonly disabled!: boolean

  @Getter isFirm!: boolean
  @Getter isBenBcCccUlc!: boolean
  @Getter isCoop!: boolean
  @Getter getIdentifier: string
  @Getter isHistorical!: boolean
  @Getter isAdminFreeze!: boolean

  /** The Create URL string. */
  get createUrl (): string {
    return sessionStorage.getItem('CREATE_URL')
  }

  /** The Edit URL string. */
  get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

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
    const url = `${this.editUrl}${this.getIdentifier}/conversion`
    navigate(url)
  }

  showAdministrativeDissolutionDialog (): void {
    this.isAddingAdministrativeDissolution = true
  }

  hideAdministrativeDissolutionDialog (needReload: boolean): void {
    this.isAddingAdministrativeDissolution = false
    this.close(needReload)
  }

  async goToRestorationFiling (): Promise<void> {
    try {
      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      // create restoration draft filing
      const restoration = this.buildRestorationFiling()
      const filing = await LegalServices.createFiling(this.getIdentifier, restoration, true)
      const id = +filing?.header?.filingId

      if (isNaN(id)) throw new Error('Invalid API response')

      // navigate to Create UI
      const url = `${this.createUrl}?id=${this.getIdentifier}`
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
