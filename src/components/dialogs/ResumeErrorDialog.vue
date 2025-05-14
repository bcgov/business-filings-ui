<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="resume-error-dialog"
  >
    <v-card>
      <v-card-title>Unable to Resume Filing</v-card-title>

      <v-card-text>
        <p class="font-15">
          We were unable to resume your filing. You can return to
          the Business Dashboard and try again.
        </p>

        <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
          <p class="font-15">
            If this error persists, please contact us.
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-exit-button"
          color="primary"
          text
          @click="exit()"
        >
          Return to dashboard
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
export default class ResumeErrorDialog extends Vue {
  /** For Template Contact Info message */
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() exit () {}
}
</script>
