<template>
    <div id="staff-notation" :class="{ 'add-scrollbar-offset': addScrollbarOffset }">
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
            <v-menu offset-y left transition="slide-y-transition">
                <template v-slot:activator="{ on }">
                    <span>
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
                            @click="expand = !expand">
                            <v-icon>mdi-menu-down</v-icon>
                        </v-btn>
                    </span>
                </template>
                <v-list dense>
                    <v-list-item-group color="primary">
                        <v-list-item @click="showRegistrarsNotationDialog(1)">
                            <v-list-item-title
                                class="file-correction-item"
                            >
                                <span class="app-action">Add Registrar's Notation</span>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showRegistrarsOrderDialog(1)">
                            <v-list-item-title
                                class="add-detail-comment-item"
                            >
                                <span class="app-action">Add Registrar's Order</span>
                            </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="showCourtOrderDialog(1)">
                            <v-list-item-title
                                class="add-detail-comment-item"
                            >
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
  private currentFilingId: number = null
  private isAddingRegistrarsNotation = false
  private isAddingRegistrarsOrder = false
  private isAddingCourtOrder = false
  private expand = false

  /** Prop for the scrollbar offset to be added. */
  @Prop() private addScrollbarOffset: string

  showRegistrarsNotationDialog (filingId: number): void {
    this.isAddingRegistrarsNotation = true
  }
  async hideRegistrarsNotationDialog (needReload: boolean): Promise<void> {
    this.isAddingRegistrarsNotation = false
    this.hasAddedFiling(needReload)
  }
  showRegistrarsOrderDialog (filingId: number): void {
    this.isAddingRegistrarsOrder = true
  }
  async hideRegistrarsOrderDialog (needReload: boolean): Promise<void> {
    this.isAddingRegistrarsOrder = false
    this.hasAddedFiling(needReload)
  }
  showCourtOrderDialog (filingId: number): void {
    this.isAddingCourtOrder = true
  }
  async hideCourtOrderDialog (needReload: boolean): Promise<void> {
    this.isAddingCourtOrder = false
    this.hasAddedFiling(needReload)
  }

  @Emit('hasAddedFiling')
  private hasAddedFiling (needReload: boolean): void {
    console.log('calling hasAddedFiling', needReload)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";
#add-staff-filing-label {
    padding-right: 0.725rem;
    font-size: 0.875rem;
    color: $app-blue;
}

#staff-notation {
    padding-right: 1.5rem;
}

.add-scrollbar-offset {
    overflow-y: scroll;
    scrollbar-color: transparent transparent; // FireFox uses this property

    // Webkit browsers use ::-webkit-scrollbar pseudo element
    &::-webkit-scrollbar {
        background: transparent;
    }
}
#staff-notation > div.filing-item__actions > button {
    font-size: 0.875rem;
    color: $app-blue;
}
#add-staff-filing-icon {
    font-size: 1.2rem;
    padding: 0.2rem;
    margin-bottom: 0.2rem;
    color: $app-blue;
}

.filing-item__actions {
  display: inline-block;
  margin-right: 0.5rem;

  .expand-btn {
    letter-spacing: -0.01rem;
    font-size: 0.875rem;
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
#app > div.v-menu__content {
    margin: 0.625rem 0 0 0;
}
.v-btn.active .v-icon {
    transform: rotate(-180deg);
  }
</style>
