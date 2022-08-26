<template>
  <section id="choose-credentials" class="py-8">

    <article id="choose-credentials-header">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <h3>Choose Credentials</h3>
          <p class="mt-4 font-14">You can choose to generate two kinds of Digital Credentials. Select the ones you wish
            to generate and store on your digital wallet. Having both credentials will help with accessing services
            quicker.</p>
        </v-col>
      </v-row>
    </article>

    <article id="credential-selectors">
      <v-row no-gutters>
        <v-col cols="12" lg="11">
          <v-card flat rounded class="px-2 mt-3">
            <v-card-text>

              <v-checkbox
                label="Business Digital Credential"
                v-model="businessCredential"
              />
              <p class="font-14 pl-8">
                This digital credential is equivalent to the business registration or incorporation certificate.
              </p>

              <v-checkbox
                class="pt-4"
                label="Business Relationship Digital Credential"
                v-model="businessRelationshipCredential"
              />
              <p class="font-14 pl-8">
                This digital credential describes your association to the business. E.g. Director, partner, owner, etc.
              </p>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </article>
  </section>
</template>

<script lang="ts">
import { Component, Emit, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class ChooseCredentials extends Vue {
  private businessCredential = false
  private businessRelationshipCredential = false

  @Emit('addCredential')
  @Watch('businessCredential')
  private addCredential (val: boolean): boolean { return val }

  @Emit('addRelationshipCredential')
  @Watch('businessRelationshipCredential')
  private addRelationshipCredential (val: boolean): boolean { return val }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
#choose-credentials {
  p {
    color: $gray9;
  }
  ::v-deep {
    .v-input__control {
      height: 2rem;
    }
    .v-input--selection-controls__input .v-icon {
      color: $gray9;
    }
    .v-input--selection-controls .v-input__slot > .v-label {
      font-weight: bold;
      font-size: 1rem;
      color: $gray9;
    }
  }
}
</style>
