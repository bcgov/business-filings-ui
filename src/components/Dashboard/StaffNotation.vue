<template>
  <div id="staff-notation" class="pr-6" :class="{ 'add-scrollbar-offset': addScrollbarOffset }">
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
      :dialog="isAddingPutBackOn"
      @close="hidePutBackOnDialog($event)"
      attach="#staff-notation"
      :displayName="FilingNames.PUT_BACK_ON"
      :name="FilingTypes.PUT_BACK_ON"
    />

    <AddStaffNotationDialog
      :dialog="isAddingAdministrativeDissolution"
      @close="hideAdministrativeDissolutionDialog($event)"
      attach="#staff-notation"
      :displayName="DissolutionNames.ADMINISTRATIVE"
      :name="FilingTypes.DISSOLUTION"
      :dissolutionType="DissolutionTypes.ADMINISTRATIVE"
    />

    <div class="staff-notation-container">
      <v-menu offset-y left transition="slide-y-transition" v-model="expand">
        <template v-slot:activator="{ on }">
          <span><!-- This span is needed to fix a positioning issue with the menu -->
            <span
              v-on="on"
              id="add-staff-filing-label"
              class="app-blue"
              @click="expand = !expand"
            >
              <v-icon id="add-staff-filing-icon" class="app-blue">mdi-plus</v-icon>
              <span>Add Staff Filing</span>
            </span>
            <v-btn
              text
              v-on="on"
              class="menu-btn"
              :class="{active: expand}"
              @click="expand = !expand"
            >
              <v-icon>mdi-menu-down</v-icon>
            </v-btn>
          </span>
        </template>
        <v-list dense>
          <v-list-item-group color="primary">
            <v-list-item @click="showRegistrarsNotationDialog()" :disabled="disabled">
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Notation</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="showRegistrarsOrderDialog()" :disabled="disabled">
              <v-list-item-title>
                <span class="app-blue">Add Registrar's Order</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="showCourtOrderDialog()" :disabled="disabled">
              <v-list-item-title>
                <span class="app-blue">Add Court Order</span>
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="goToConversionFiling()" :disabled="disabled || !isFirm">
              <v-list-item-title>
                <span class="app-blue">Record Conversion</span>
              </v-list-item-title>
            </v-list-item>
            <template v-if="isFirm || isCoop || isBComp">
              <v-list-item v-if="isHistorical" @click="showPutBackOnDialog()" :disabled="!isHistorical">
                <v-list-item-title>
                  <span class="app-blue">Put Back On</span>
                </v-list-item-title>
              </v-list-item>
            </template>
            <template v-if="isFirm || isCoop || isBComp">
              <v-list-item v-if="!isHistorical" @click="showAdministrativeDissolutionDialog()" :disabled="disabled">
                <v-list-item-title>
                  <span class="app-blue">Administrative Dissolution</span>
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
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { navigate } from '@/utils'
import { DissolutionTypes, DissolutionNames, FilingTypes, FilingNames } from '@/enums'
// Dialog
import { AddStaffNotationDialog } from '@/components/dialogs'

@Component({
  components: { AddStaffNotationDialog }
})
export default class StaffNotation extends Vue {
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private isAddingCourtOrder = false
  private isAddingPutBackOn = false
  private isAddingAdministrativeDissolution = false
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
  @Getter isBComp!: boolean
  @Getter isCoop!: boolean
  @Getter getIdentifier: string
  @Getter isHistorical!: boolean

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

  showPutBackOnDialog (): void {
    this.isAddingPutBackOn = true
  }

  hidePutBackOnDialog (needReload: boolean): void {
    this.isAddingPutBackOn = false
    this.close(needReload)
  }

  showAdministrativeDissolutionDialog (): void {
    this.isAddingAdministrativeDissolution = true
  }

  hideAdministrativeDissolutionDialog (needReload: boolean): void {
    this.isAddingAdministrativeDissolution = false
    this.close(needReload)
  }

  @Emit('close')
  private close (needReload: boolean): void {
    // Intentionally empty
  }

  goToConversionFiling ():void {
    const url = `${this.editUrl}${this.getIdentifier}/conversion`
    navigate(url)
  }
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

  // make menu button slightly smaller
  .menu-btn {
    height: unset !important;
    min-width: unset !important;
    padding: 0.25rem !important;
    color: $app-blue
  }
}

#add-staff-filing-label {
  padding-right: 0.725rem;
  font-size: $px-14;
  border-right: 1px solid $gray3;

  &:hover {
    cursor: pointer;
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

#add-staff-filing-icon {
  font-size: 1.2rem;
  padding: 0.2rem;
  margin-bottom: 0.2rem;
}

#app > div.v-menu__content {
  margin: 0.625rem 0 0 0;
}

.v-btn.active .v-icon {
  transform: rotate(-180deg);
}

:deep(.theme--light.v-list-item--disabled) {
  opacity: 0.38 !important;
}
</style>
