<template>
  <v-container
    id="credentials-footer"
    class="list-item px-0 pb-1"
  >
    <div class="buttons-right">
      <v-btn
        v-if="currentStepIndex > 0"
        id="back-btn"
        color="primary"
        large
        outlined
        @click="back()"
      >
        <v-icon>mdi-chevron-left</v-icon>
        <span>Back</span>
      </v-btn>

      <v-btn
        id="next-btn"
        class="font-weight-bold"
        color="primary"
        large
        @click="next()"
      >
        <span>{{ nextStepName }}</span>
        <v-icon v-if="currentStepIndex !== lastStepIndex">
          mdi-chevron-right
        </v-icon>
      </v-btn>

      <v-btn
        id="cancel-btn"
        large
        outlined
        color="primary"
        @click="cancel()"
      >
        <span>Cancel</span>
      </v-btn>
    </div>
  </v-container>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class CredentialsFooter extends Vue {
  @Prop({ default: 0 }) readonly currentStepIndex!: number

  @Prop({ default: null }) readonly lastStepIndex!: number

  @Prop({ default: 'Next' }) readonly nextStepName!: string

  @Emit() back (): void {}
  @Emit() next (): void {}
  @Emit() cancel (): void {}
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#credentials-footer {
  border-top: 1px solid $gray3;

  .buttons-right {
    margin-left: auto;
  }

  .v-btn {
    min-width: 100px;
  }

  .v-btn + .v-btn {
    margin-left: 0.5rem;
  }

  #cancel-btn {
    margin-left: 0.5rem;
  }
}
</style>
