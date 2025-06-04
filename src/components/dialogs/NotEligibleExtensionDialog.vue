<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="not-eligible-extension-dialog"
  >
    <v-card class="pa-10">
      <v-card-subtitle class="d-flex justify-space-between pa-0">
        <p id="dialog-title">
          Not Eligible for Extension
        </p>
        <v-btn
          id="dialog-close-btn"
          text
          color="primary"
          @click="okay()"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-subtitle>

      <v-card-text class="mx-n5">
        <p>
          Based on the information provided, this business is not eligible for an AGM extension.
        </p>

        <template v-if="!IsAuthorized(AuthorizedActions.NO_CONTACT_INFO)">
          <p>
            If you have any questions about the review, please contact us at:
          </p>
          <ContactInfo class="mt-5" />
        </template>
      </v-card-text>

      <v-card-actions class="d-flex justify-center pa-0">
        <v-btn
          id="dialog-ok-btn"
          color="primary"
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
import { AuthorizedActions } from '@/enums'
import { ContactInfo } from '@/components/common'
import { IsAuthorized } from '@/utils'

@Component({
  components: { ContactInfo }
})
export default class NotEligibleExtensionDialog extends Vue {
  // For Template Contact Info message
  readonly IsAuthorized = IsAuthorized
  readonly AuthorizedActions = AuthorizedActions

  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  // Pass click event to parent.
  @Emit() okay () {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#dialog-title {
  margin: 6px 0 0; // align vertically with close button
  font-size: $px-24;
  font-weight: bold;
  color: $gray9;
}

.v-card__text {
  font-weight: normal;
  font-size: $px-16;
  color: $gray7;
  line-height: $px-24;
}

#dialog-ok-btn {
  min-height: 40px;
  min-width: 100px;
}
</style>
