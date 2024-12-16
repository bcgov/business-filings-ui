<template>
  <v-dialog
    v-model="dialog"
    width="45rem"
    persistent
    :attach="attach"
    content-class="staff-role-error-dialog"
  >
    <v-card>
      <v-card-title>{{ title }}</v-card-title>
      <v-card-text class="pre-wrap">
        <div
          v-show="!!text"
          class="font-15"
          v-html="text"
        />
      </v-card-text>

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
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import ContactInfo from '@/components/common/ContactInfo.vue'

@Component({
  components: {
    ContactInfo
  }
})
export default class StaffRoleErrorDialog extends Vue {
    @Prop({ default: '' }) readonly attach!: string
    @Prop({ default: false }) readonly dialog!: boolean
    @Prop({ default: '' }) readonly text!: string
    @Prop({ default: '' }) readonly title!: string

    @Emit() exit (): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-card__text {
color: $gray7 !important;
}
</style>
