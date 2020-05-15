<template>
  <v-dialog :value="bcolDialog" width="45rem" persistent :attach="attach" content-class="bcol-error-dialog">
    <v-card v-if="bcolObject">
      <v-card-title id="dialog-title">Payment Incomplete - {{bcolObject.title}}</v-card-title>

      <v-card-text>
        <p class="genErr" id="dialog-header">
          This {{filingTypeToName(filingType)}} could not be filed for the following reason:
        </p>
        <p class="genErr" id="dialog-content" v-html="bcolObject.detail"></p>

        <template v-if="!isRoleStaff">
          <p class="genErr">
            Your {{filingTypeToName(filingType)}} has been saved as a draft and you
            can retry your payment from the dashboard once the issue has been resolved.
          </p>
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
import { EnumMixin } from '@/mixins'
import { FilingTypes } from '@/enums'

@Component({
  computed: {
    // Property definition for runtime environment.
    ...mapGetters(['isRoleStaff'])
  },
  mixins: [EnumMixin],
  components: { ErrorContact }
})
export default class BcolErrorDialog extends Vue {
  // Getter definition for static type checking.
  readonly isRoleStaff!: boolean

  @Prop() private filingType: FilingTypes

  @Prop({ default: () => { return null } }) private bcolObject: object

  // Prop to provide attachment selector.
  @Prop() private attach: string

  // Pass click event to parent.
  @Emit() private exit () { }

  private get bcolDialog (): boolean {
    return this.bcolObject != null
  }
}
</script>

<style lang="scss" scoped>
// @import '@/assets/styles/theme.scss';
</style>
