<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="technical-error-dialog"
  >
    <v-card>
      <v-card-title>Error</v-card-title>

      <v-card-text>
        <p class="font-15">
          We could not process your action due to a technical issue. Try again in a few minutes.
        </p>

        <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
          <p class="font-15">
            If this error persists, please contact BC Registries staff:
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-close-button"
          color="primary"
          text
          @click="close()"
        >
          Close
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
export default class TechnicalErrorDialog extends Vue {
  /** For Template Contact Info message */
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() close () {}
}
</script>
