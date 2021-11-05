<template>
  <v-dialog v-model="dialog" width="45rem" persistent>
    <v-card class="pa-5">
      <v-card-subtitle class="pt-5" align="center">
        <v-icon color="error" large>mdi-information-outline</v-icon>
        <v-btn small text color="primary" class="close-btn" @click="close()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-subtitle>

      <v-card-text>
        <p class="warning-title">
         Voluntary Dissolution
        </p>
        <p class="warning-text">You are about to voluntarily dissolve <strong>{{ getEntityName }}</strong>;
          once this process is completed and the required documents are filed, the {{ entityTitle }} will be
          struck from the register and dissolved, ceasing to be an incorporated {{ subEntityTitle }} under the
          {{ entityAct }} Act.
        </p>
      </v-card-text>

      <v-card-actions>
        <v-row no-gutters justify="center">
          <v-btn
            id="dialog-close-button"
            class="mr-4 action-btn"
            color="primary"
            outlined
            @click="close()"
          >
            Cancel
          </v-btn>
          <v-btn
            id="dialog-proceed-button"
            class="action-btn"
            color="primary"
            @click="proceed()"
          >
            Continue with Voluntary Dissolution
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({})
export default class ConfirmDissolution extends Vue {
  // Prop to display the dialog.
  @Prop() private dialog: boolean

  // Global getters
  @Getter getEntityName!: string
  @Getter isCoop!: boolean

  /** The entity title to display. */
  private get entityTitle (): string {
    return this.isCoop ? 'Cooperative Association' : 'Company'
  }

  /** The entity title to display. */
  private get subEntityTitle (): string {
    return this.isCoop ? 'cooperative' : 'company'
  }

  /** The entity title to display. */
  private get entityAct (): string {
    return this.isCoop ? 'Cooperative Association' : 'Business Corporations'
  }

  // Pass click event to parent.
  @Emit() private close () { }

  // Pass click event to parent.
  @Emit() private proceed () { }
}
</script>

<style lang="scss" scoped>
 @import '@/assets/styles/theme.scss';

.close-btn {
  position: absolute;
  right: 2rem;
}

.action-btn {
  min-height: 44px;
}

.warning-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: $gray9;
  text-align: center;
  line-height: 2.125rem;
}

.warning-text {
  font-weight: normal;
  font-size: $px-16;
  color: $gray7;
  line-height: 1.5rem;
}

// Vuetify overrides
::v-deep .v-dialog .v-card .v-card__text {
  padding-top: 0 !important;
}
</style>
