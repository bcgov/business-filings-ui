<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="not-in-good-standing-dialog">
    <v-card class="pa-5">
      <v-card-subtitle class="pt-5" align="center">
        <v-icon color="error" large>mdi-information-outline</v-icon>
        <v-btn small text color="primary" class="close-btn" @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-subtitle>

      <v-card-text>
        <p class="warning-title">
          Business is not in good standing
        </p>

        <template v-if="isDissolveMessage">
          <p class="warning-text">
            This business cannot be dissolved at this time because it is not in good standing
            with the Business Registry. There may be several reasons why a business is not in
            good standing, but the most common reason is an overdue annual report.
          </p>

          <p class="warning-text">
            Please file any overdue annual reports in your To Do list and try your voluntary
            dissolution again, or contact BC Registries staff:
          </p>
        </template>

        <template v-else-if="isChangeCompanyInfoMessage">
          <p class="warning-text">
            The complete company information for this business cannot be viewed or changed at
            this time because the business is not in good standing with the Business Registry.
            There may be several reasons why a business is not in good standing, but the most
            common reason is an overdue annual report.
          </p>

          <p class="warning-text">
            Please file any overdue annual reports in your To Do list and try to view and change
            the company information again, or contact BC Registries staff:
          </p>
        </template>

        <template v-else>
          <p class="warning-text">
            Please contact BC Registries staff:
          </p>
        </template>

        <ContactInfo class="mt-5" />
      </v-card-text>

      <v-card-actions>
        <v-row no-gutters justify="center">
          <v-btn
            id="dialog-close-button"
            class="mr-2 action-btn"
            color="primary"
            @click="close()"
          >
            OK
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'
import { NigsMessage } from '@/enums'

@Component({
  components: { ContactInfo }
})
export default class NotInGoodStandingDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop to select display message.
  @Prop() readonly message!: NigsMessage

  get isDissolveMessage (): boolean {
    return (this.message === NigsMessage.DISSOLVE)
  }

  get isChangeCompanyInfoMessage (): boolean {
    return (this.message === NigsMessage.CHANGE_COMPANY_INFO)
  }

  // Pass click event to parent.
  @Emit() close () {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.close-btn {
  position: absolute;
  right: 2rem;
}

.action-btn {
  min-width: 100px !important;
  min-height: 44px;
}

.warning-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: $gray9;
  text-align: center;
  line-height: 2.125rem;
}

.warning-text {
  font-weight: normal;
  font-size: $px-16;
  color: $gray7;
  line-height: 1.5rem;
}

// Vuetify overrides
:deep(.v-dialog .v-card .v-card__text) {
  padding-top: 0 !important;
}
</style>
