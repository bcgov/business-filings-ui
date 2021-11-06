<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="load-correction-dialog">
    <v-card>
      <v-card-title>Unable to Load Correction</v-card-title>

      <v-card-text>
        <p class="font-15">We were unable to load your correction. You can return to
          the Business Dashboard and try again.</p>

        <template v-if="!isRoleStaff">
          <p class="font-15">If this error persists, please contact us.</p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions>
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
export default class LoadCorrectionDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Prop to display the dialog.
  @Prop() readonly dialog: boolean

  // Prop to provide attachment selector.
  @Prop() readonly attach: string

  // Pass click event to parent.
  @Emit() private exit () { }
}
</script>
