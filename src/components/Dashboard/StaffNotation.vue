<template>
  <div id="staff-notation" class="pr-6" :class="{ 'add-scrollbar-offset': addScrollbarOffset }">
    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsNotation"
      @close="hideRegistrarsNotationDialog($event)"
      attach="#staff-notation"
      displayName="Registrar's Notation"
      name="registrarsNotation"
    />

    <AddStaffNotationDialog
      :dialog="isAddingRegistrarsOrder"
      @close="hideRegistrarsOrderDialog($event)"
      attach="#staff-notation"
      displayName="Registrar's Order"
      name="registrarsOrder"
    />

    <AddStaffNotationDialog
      :dialog="isAddingCourtOrder"
      @close="hideCourtOrderDialog($event)"
      attach="#staff-notation"
      displayName="Court Order"
      name="courtOrder"
      courtOrderNumberRequired="true"
    />

    <AddStaffNotationDialog
      :dialog="isAddingRecordConversion"
      @close="hideRecordConversionDialog($event)"
      attach="#staff-notation"
      displayName="Firm Record Conversion"
      name="conversion"
    />

    <div class="filing-item__actions">
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
            <v-list-item @click="showRecordConversionDialog()" :disabled="disabled">
              <v-list-item-title>
                <span class="app-blue">Add Firm Record Conversion</span>
              </v-list-item-title>
            </v-list-item>
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
// Dialog
import { AddStaffNotationDialog } from '@/components/dialogs'

@Component({
  components: { AddStaffNotationDialog }
})
export default class StaffNotation extends Vue {
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private isAddingCourtOrder = false
  private isAddingRecordConversion = false
  private expand = false

  /** Prop for the scrollbar offset to be added. */
  @Prop() readonly addScrollbarOffset: string

  /** Prop for disabling the menu items. */
  @Prop({ default: false }) readonly disabled: boolean

  @Getter isFirm!: boolean
  @Getter getIdentifier: string

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

  /** If entity is a Firm then navigate to Edit UI,
    * Else display message that this is not a firm. */
  showRecordConversionDialog (): void {
    this.isFirm ? this.goToChangeFiling() : this.isAddingRecordConversion = true
  }

  hideRecordConversionDialog (needReload: boolean): void {
    this.isAddingRecordConversion = false
    this.close(needReload)
  }

  @Emit('close')
  private close (needReload: boolean): void {
    // Intentionally empty
  }

  /** The Edit URL string. */
  get editUrl (): string {
    return sessionStorage.getItem('EDIT_URL')
  }

  goToChangeFiling ():void {
    const url = `${this.editUrl}${this.getIdentifier}/change`
    navigate(url)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

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
::v-deep .add-notation-dialog {
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

::v-deep .theme--light.v-list-item--disabled {
  opacity: 0.38 !important;
}
</style>
