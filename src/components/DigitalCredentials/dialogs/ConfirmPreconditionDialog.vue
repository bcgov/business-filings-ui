<template>
  <v-dialog
    id="confirm-precondition-dialog"
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="confirm-precondition-dialog"
  >
    <v-card class="py-10 px-16">
      <v-card-text>
        <p
          id="dialog-title"
          class="warning-title"
        >
          Are you {{ attestName }}, a {{ precondition }} with {{ attestBusiness }}?
        </p>
      </v-card-text>

      <v-card-actions>
        <v-row
          no-gutters
          justify="center"
        >
          <v-btn
            id="dialog-deny-button"
            class="mr-4 action-btn"
            color="primary"
            outlined
            @click="close()"
          >
            <span>No</span>
          </v-btn>
          <v-btn
            id="dialog-confirm-button"
            class="action-btn"
            color="primary"
            @click="proceed()"
          >
            Yes, it's me
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component({})
export default class ConfirmPreconditionDialog extends Vue {
  /** Prop to display the dialog. */
  @Prop({ default: false }) readonly dialog!: boolean

  /** Prop to provide attachment selector. */
  @Prop({ default: '' }) readonly attach!: string

  /** Prop to display the precondition */
  @Prop({ default: '' }) precondition!: string

  /** Prop to display the user name */
  @Prop({ default: '' }) attestName!: string

  /** Prop to display the business name */
  @Prop({ default: '' }) attestBusiness!: string

  // Pass click events to parent.
  @Emit() close (): void {
    return undefined
  }
  @Emit() proceed (): void {
    return undefined
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.action-btn {
  min-height: 44px;
}

.warning-title {
  font-size: $px-24;
  font-weight: bold;
  color: $gray9;
  text-align: center;
  line-height: $px-34;
}
</style>
