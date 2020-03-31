<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="name-request-invalid-dialog">
    <v-card>
      <v-card-title>Invalid Name Request</v-card-title>

      <v-card-text>
        <p class="genErr" v-if="type === NameRequestStates.EXPIRED">
          The specified name request has expired.</p>

        <p class="genErr" v-else-if="type === NameRequestStates.CONSUMED">
          The specified name request has already been consumed.</p>

        <p class="genErr" v-else-if="type === NameRequestStates.NOT_APPROVED">
          The specified name request has not been approved.</p>

        <p class="genErr" v-else-if="type === NameRequestStates.NOT_FOUND">
          The specified name request number could not be found.</p>

        <p class="genErr" v-else-if="type === NameRequestStates.NEED_CONSENT">
          The specified name request number is awaiting consent.</p>

        <p class="genErr" v-else>An unexpected error has occurred.</p>

        <p class="mt-4">You can retry now, or you can exit and try to access this Name Request
          at another time.</p>

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
import { NameRequestStates } from '@/enums'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ErrorContact }
})
export default class NameRequestInvalidDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Enum definition for use in template.
  NameRequestStates = NameRequestStates

  // Prop to display the dialog.
  @Prop() private dialog: boolean

  // Prop to provide message type.
  @Prop({ default: null }) private type: NameRequestStates

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
