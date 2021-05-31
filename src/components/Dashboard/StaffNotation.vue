<template>
    <div id="staff-notation" class="pr-6" :class="{ 'add-scrollbar-offset': addScrollbarOffset }">
        <add-staff-notation-dialog
            :dialog="isAddingRegistrarsNotation"
            @close="hideRegistrarsNotationDialog($event)"
            attach="#staff-notation"
            itemName="Registrar's Notation"
            filingType="registrarsNotation"
        />
        <add-staff-notation-dialog
            :dialog="isAddingRegistrarsOrder"
            @close="hideRegistrarsOrderDialog($event)"
            attach="#staff-notation"
            itemName="Registrar's Order"
            filingType="registrarsOrder"
        />
        <add-staff-notation-dialog
            :dialog="isAddingCourtOrder"
            @close="hideCourtOrderDialog($event)"
            attach="#staff-notation"
            itemName="Court Order"
            filingType="courtOrder"
            courtOrderNumberRequired="true"
        />
        <div class="filing-item__actions">
            <v-menu offset-y left transition="slide-y-transition" v-model="expand">
                <template v-slot:activator="{ on }">
                    <span><!-- This span is needed to fix a positioning issue with the menu -->
                        <span
                            v-on="on"
                            id="add-staff-filing-label"
                            @click="expand = !expand">
                            <v-icon id="add-staff-filing-icon">mdi-plus</v-icon>Add Staff Filing
                        </span>
                        <v-btn
                            text
                            v-on="on"
                            class="menu-btn"
                            :class="{active: expand}"
                            @click="expand = !expand" >
                            <v-icon>mdi-menu-down</v-icon>
                        </v-btn>
                    </span>
                </template>
                <v-list dense>
                    <v-list-item-group color="primary">
                        <v-list-item @click="showRegistrarsNotationDialog()">
                            <v-list-item-title>
                                <span class="app-action">Add Registrar's Notation</span>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showRegistrarsOrderDialog()">
                            <v-list-item-title>
                                <span class="app-action">Add Registrar's Order</span>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showCourtOrderDialog()">
                            <v-list-item-title>
                                <span class="app-action">Add Court Order</span>
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

// Dialog
import { AddStaffNotationDialog } from '@/components/dialogs'

@Component({
  components: { AddStaffNotationDialog }
})
export default class StaffNotation extends Vue {
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private isAddingCourtOrder = false
  private expand = false

  /** Prop for the scrollbar offset to be added. */
  @Prop() private addScrollbarOffset: string

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

  @Emit('close')
  private close (needReload: boolean): void {
    // Intentionally empty
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";
#add-staff-filing-label {
    padding-right: 0.725rem;
    font-size: 0.875rem;
    color: $app-blue;
    border-right: 1px solid $gray3;

    &:hover {
      cursor: pointer;
    }
}

// This class will be applied when addScrollbarOffset prop is true
// This is necessary to align with FilingHistoryList component that may have an active scroll bar
.add-scrollbar-offset {
    overflow-y: scroll;
    scrollbar-color: transparent transparent; // FireFox uses this property

    // Webkit browsers use ::-webkit-scrollbar pseudo element
    &::-webkit-scrollbar {
        background: transparent;
    }
}

#add-staff-filing-icon {
    font-size: 1.2rem;
    padding: 0.2rem;
    margin-bottom: 0.2rem;
    color: $app-blue;
}

#app > div.v-menu__content {
    margin: 0.625rem 0 0 0;
}
.v-btn.active .v-icon {
    transform: rotate(-180deg);
}
</style>
