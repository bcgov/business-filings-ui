<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="dashboard-unavailable-dialog"
  >
    <v-card>
      <v-card-title>Dashboard Unavailable</v-card-title>

      <v-card-text>
        <p class="font-15">
          We are currently unable to access your dashboard. You can retry to access
          your dashboard now, or you can exit and try to access your dashboard at another time.
        </p>

        <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
          <p class="font-15">
            If this error persists, please contact us.
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          id="dialog-exit-button"
          color="primary"
          text
          @click="exit()"
        >
          Exit
        </v-btn>
        <v-spacer />
        <v-btn
          id="dialog-retry-button"
          color="primary"
          text
          @click="retry()"
        >
          Retry
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Emit, Vue } from 'vue-property-decorator'
import { AuthorizedActions } from '@/enums'
import { ContactInfo } from '@/components/common'
import { IsAuthorized } from '@/utils'

@Component({
  components: { ContactInfo }
})
export default class DashboardUnavailableDialog extends Vue {
  /** For Template Contact Info message */
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click events to parent.
  @Emit() exit () {}
  @Emit() retry () {}
}
</script>
