<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="delete-error-dialog"
  >
    <v-card>
      <v-card-title
        v-if="errors.length > 0 || warnings.length < 1"
        id="dialog-title"
      >
        Unable to Delete Filing
      </v-card-title>
      <v-card-title
        v-else
        id="dialog-title"
      >
        Filing Deleted with Warnings
      </v-card-title>

      <v-card-text id="dialog-text">
        <p
          v-if="errors.length + warnings.length < 1"
          class="font-15"
        >
          We were unable to delete your filing.
        </p>
        <p
          v-else-if="errors.length > 0"
          class="font-15"
        >
          We were unable to delete your filing due to the following errors:
        </p>
        <p
          v-else
          class="font-15"
        >
          Please note the following:
        </p>
        <p
          v-for="(error, index) in errors"
          :key="index"
          class="font-15"
        >
          {{ error.error || error.message }}
        </p>
        <p
          v-for="(warning, index) in warnings"
          :key="index"
          class="font-15"
        >
          {{ warning.warning || warning.message }}
        </p>

        <template v-if="!isRoleStaff">
          <p class="font-15">
            If you need help, please contact us.
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0" />

      <v-card-actions>
        <v-spacer />
        <v-btn
          id="dialog-ok-btn"
          color="primary"
          text
          @click="okay()"
        >
          OK
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
export default class DeleteErrorDialog extends Vue {
  // Getter to check if logged in user is Staff.
  @Getter(useAuthenticationStore) isRoleStaff!: boolean

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Prop containing error messages.
  @Prop({ default: () => [] }) readonly errors!: any[]

  // Prop containing warning messages.
  @Prop({ default: () => [] }) readonly warnings!: any[]

  // Pass click event to parent.
  @Emit() okay () {}
}
</script>
