<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="name-request-invalid-dialog">
    <v-card>
      <v-card-title>Invalid Incorporation Application</v-card-title>

      <v-card-text>
        <p class="font-15" v-if="type === NameRequestStates.EXPIRED">
          The name request has expired.</p>

        <p class="font-15" v-else-if="type === NameRequestStates.CONSUMED">
          The name request has already been consumed.</p>

        <p class="font-15" v-else-if="type === NameRequestStates.NOT_APPROVED">
          The name request has not been approved.</p>

        <p class="font-15" v-else-if="type === NameRequestStates.NOT_FOUND">
          The name request number could not be found.</p>

        <p class="font-15" v-else-if="type === NameRequestStates.NEED_CONSENT">
          The name request number is awaiting consent.</p>

        <p class="font-15" v-else>An unexpected error has occurred.</p>

        <p class="mt-4">You can retry now, or you can exit and try to access this Incorporation Application
          at another time.</p>

        <template v-if="!isRoleStaff">
          <p class="font-15">If this error persists, please contact us.</p>
          <ContactInfo class="mt-5" />
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
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { mapState } from 'pinia'
import { ContactInfo } from '@/components/common'
import { NameRequestStates } from '@/enums'
import { useRootStore } from '@/stores/rootStore'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapState(useRootStore, ['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class NameRequestInvalidDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Enum definition for use in template.
  NameRequestStates = NameRequestStates

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop to provide message type.
  @Prop({ default: null }) readonly type!: NameRequestStates

  // Pass click events to parent.
  @Emit() protected exit () {}
  @Emit() protected retry () {}
}
</script>
