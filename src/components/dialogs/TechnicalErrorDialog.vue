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

        <template v-if="!isRoleStaff">
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
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { useAuthenticationStore } from '@/stores'

@Component({
  components: { ContactInfo }
})
export default class TechnicalErrorDialog extends Vue {
  // Getter to check if logged in user is Staff.
  @Getter(useAuthenticationStore) isRoleStaff!: boolean

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() close () {}
}
</script>
