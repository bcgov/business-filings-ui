<template>
  <v-dialog v-model="dialog" width="45rem" persistent :attach="attach" content-class="payment-error-dialog">
    <v-card>
      <v-card-title>Payment Incomplete - {{title}}</v-card-title>

      <v-card-text>
        <p class="genErr">This {{filingType}} could not be filed for the following reason:</p>
        <p class="genErr">{{errMsg}}</p>

        <template v-if="!isRoleStaff">
          <p class="genErr">Your {{filingType}} has been saved as a draft and you
                    can retry your payment from the dashboard once the issue has been resolved.</p>
        </template>
      </v-card-text>

      <v-divider class="my-0"></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn id="dialog-exit-button" color="primary" text @click="exit()">Back to My Dashboard</v-btn>
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
export default class BcolErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  // Prop to display the dialog.
  @Prop() private dialog: boolean

  @Prop() private filingType: string

  @Prop() private errMsg: string

  @Prop() title: string

  // Prop to provide attachment selector.
  @Prop() private attach: string

  // Pass click event to parent.
  @Emit() private exit () { }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';
</style>
