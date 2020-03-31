<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="name-request-auth-error-dialog">
    <v-card>
      <v-card-title>Unable to Access Name Request</v-card-title>

      <v-card-text>
        <p class="genErr">Your account is currently unable to access this Name Request. This may be
          because of the following:</p>
        <ul>
          <li>Your account is not authorized to access this Name Request &mdash; contact the Name
            Request owner to get access.</li>
          <li>Your login session has timed out &mdash; please exit and then login again.</li>
          <li>The specified Name Request Number is not valid.</li>
        </ul>
        <p class="mt-4">You can retry now, or you can exit and try to access this Name Request at
          another time.</p>
        <template v-if="!isRoleStaff">
          <p class="genErr">If this error persists, please contact us.</p>
          <ErrorContact />
        </template>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Exit</v-btn>
        <v-spacer></v-spacer>
        <v-btn id="dialog-retry-button" color="primary" text @click="retry()">Retry</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { ErrorContact } from '@/components/common'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ErrorContact }
})
export default class NameRequestAuthErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Prop to display the dialog.
  @Prop() private dialog: boolean

  // Prop to provide attachment selector.
  @Prop() private attach: string

  // Pass click events to parent.
  @Emit() private exit () { }
  @Emit() private retry () { }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';
</style>
