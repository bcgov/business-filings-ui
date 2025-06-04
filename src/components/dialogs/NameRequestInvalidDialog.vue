<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="name-request-invalid-dialog"
  >
    <v-card>
      <v-card-title>Invalid Incorporation Application</v-card-title>

      <v-card-text>
        <p
          v-if="type === NameRequestStates.EXPIRED"
          class="font-15"
        >
          The name request has expired.
        </p>

        <p
          v-else-if="type === NameRequestStates.CONSUMED"
          class="font-15"
        >
          The name request has already been consumed.
        </p>

        <p
          v-else-if="type === NameRequestStates.NOT_APPROVED"
          class="font-15"
        >
          The name request has not been approved.
        </p>

        <p
          v-else-if="type === NameRequestStates.NOT_FOUND"
          class="font-15"
        >
          The name request number could not be found.
        </p>

        <p
          v-else-if="type === NameRequestStates.NEED_CONSENT"
          class="font-15"
        >
          The name request number is awaiting consent.
        </p>

        <p
          v-else
          class="font-15"
        >
          An unexpected error has occurred.
        </p>

        <p class="mt-4">
          You can retry now, or you can exit and try to access this Incorporation Application
          at another time.
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
import { AuthorizedActions, NameRequestStates } from '@/enums'
import { ContactInfo } from '@/components/common'
import { IsAuthorized } from '@/utils'

@Component({
  components: { ContactInfo }
})
export default class NameRequestInvalidDialog extends Vue {
  // For Template Contact Info message
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Enum definition for use in template. */
  readonly NameRequestStates = NameRequestStates

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop to provide message type.
  @Prop({ default: null }) readonly type!: NameRequestStates

  // Pass click events to parent.
  @Emit() exit () {}
  @Emit() retry () {}
}
</script>
