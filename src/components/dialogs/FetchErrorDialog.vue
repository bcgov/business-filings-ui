<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="fetch-error-dialog">
    <v-card>
      <v-card-title id="dialog-title">Unable to Fetch Data</v-card-title>

      <v-card-text id="dialog-text">
        <p class="genErr">
          We were unable to fetch some data needed for your filing.
          You can return to the Business Dashboard and try again.
        </p>

        <template v-if="!isRoleStaff">
          <p class="genErr">If this error persists, please contact us.</p>
          <contact-info id="dialog-contact" />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions id="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Return to dashboard</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import { ContactInfo } from '@/components/common'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  components: { ContactInfo }
})
export default class FetchErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Prop to display the dialog.
  @Prop({ default: false }) readonly dialog: boolean

  // Prop to provide attachment selector.
  @Prop({ default: null }) readonly attach: string

  // Pass click event to parent.
  @Emit() private exit () { }
}
</script>
