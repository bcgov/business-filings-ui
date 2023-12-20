<template>
  <div id="amalgamation-selection">
    <!-- Main Body -->
    <v-container class="view-container">
      <v-row>
        <v-col
          cols="12"
          lg="9"
        >
          <article id="main-article">
            <!-- Page Title -->
            <header>
              <h1>
                Choose the type of amalgamation to be filed.
              </h1>
              <p>
                There are two types of amalgamation filings. Choose the appropriate one for your filing.
              </p>
            </header>
          </article>
        </v-col>
      </v-row>

      <v-row>
        <!-- First Choice -->
        <v-col>
          <v-card
            id="start-horizontal-short-form-card"
            flat
            class="pt-6 pb-8 px-4"
          >
            <h2>
              Horizontal short-form amalgamation
            </h2>
            <br>
            <p>
              A <strong>horizontal short-form amalgamation</strong> can be used if the amalgamating
              corporations are all wholly owned subsidiaries of the same holding body corporate.
            </p>
            <p>To complete a short-form amalgamation, the directors of each amalgamating corporation need to:</p>
            <ul>
              <li>Approve the amalgamation</li>
              <li>File articles of amalgamation</li>
            </ul>
            <br>
            <p>Shareholders of the amalgamating corporations do not need to approve the amalgamation.</p>
            <div class="btn-div">
              <!-- TODO: Remove disabled when doing short form amalgamations -->
              <v-btn
                id="horizontal-short-form-btn"
                disabled
                color="primary"
                large
              >
                <strong>Start Horizontal Short-form</strong>
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Second Choice -->
        <v-col>
          <v-card
            id="start-vertical-short-form-card"
            flat
            class="pt-6 pb-8 px-4"
          >
            <h2>
              Vertical short-form amalgamation
            </h2>
            <br>
            <p>
              A <strong>vertical short-form amalgamation</strong> can be used if the subsidiary
              corporations are wholly owned by the corporation they are amalgamating with.
            </p>
            <p>To complete a short-form amalgamation, the directors of each amalgamating corporation need to:</p>
            <ul>
              <li>Approve the amalgamation</li>
              <li>File articles of amalgamation</li>
            </ul>
            <br>
            <p>Shareholders of the amalgamating corporations do not need to approve the amalgamation.</p>
            <div class="btn-div">
              <!-- TODO: Remove disabled when doing short form amalgamations -->
              <v-btn
                id="vertical-short-form-btn"
                disabled
                color="primary"
                large
              >
                <strong>Start Vertical Short-form</strong>
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Third Choice -->
        <v-col>
          <v-card
            id="start-regular-long-form-card"
            flat
            class="pt-6 pb-8 px-4"
          >
            <h2>
              Regular long-form amalgamation
            </h2>
            <br>
            <p>
              If amalgamating corporations don't meet criteria for a short-form amalgamation, they
              need to complete the following steps to amalgamate:
            </p>
            <ul>
              <li>The shareholders of each amalgamating corporation must approve the amalgamation</li>
              <li>The amalgamating corporations must enter into an amalgamation agreement</li>
              <li>
                The amalgamating corporations then file articles of amalgamation along with the
                amalgamation agreement to obtain a certificate of amalgamation
              </li>
            </ul>
            <br>
            <p>
              When the amalgamation is complete, your company will be a
              <strong>{{ getRegularAmalgamationText() }}.</strong>
            </p>
            <div class="btn-div">
              <v-btn
                id="regular-long-form-btn"
                color="primary"
                large
                @click="startRegularAmalgamation()"
              >
                <strong>Start Regular Long-form</strong>
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { useBusinessStore, useConfigurationStore, useRootStore } from '@/stores'
import { Action, Getter } from 'pinia-class'
import { Component, Vue } from 'vue-property-decorator'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { AmalgamationTypes, FilingTypes } from '@bcrs-shared-components/enums'
import { Routes } from '@/enums'
import { LegalServices } from '@/services'
import { navigate } from '@/utils'

@Component({})
export default class AmalgamationSelection extends Vue {
  @Getter(useConfigurationStore) getCreateUrl!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useBusinessStore) getLegalType!: string
  @Getter(useBusinessStore) isBComp!: boolean
  @Getter(useBusinessStore) isBcCompany!: boolean
  @Getter(useBusinessStore) isCcc!: boolean
  @Getter(useBusinessStore) isUlc!: boolean

  @Action(useRootStore) setStartingAmalgamationSpinner!: (x: boolean) => void

  /** Called when component is created. */
  created (): void {
    const filingId = +this.$route.params.filingId // id param of this selection panel route, must be 0

    // if required data isn't set, go back to dashboard
    if (!this.getIdentifier || filingId !== 0) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }

  /** Get the amalmagated company result name depending on the type. */
  getRegularAmalgamationText (): string {
    if (this.isBComp || this.isBcCompany) return 'BC limited company'
    if (this.isCcc) return 'BC community contribution company'
    if (this.isUlc) return 'BC unlimited liability company'
    return 'Unknown'
  }

  /** Start Regular Long-form button pressed. */
  async startRegularAmalgamation (): Promise<any> {
    const legalType = this.getLegalType as CorpTypeCd

    // Create a draft amalgamation and redirect to Create UI
    try {
      // show spinner since this is a network call
      this.setStartingAmalgamationSpinner(true)
      const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
      const businessId = await this.createBusinessAA(accountId, legalType, AmalgamationTypes.REGULAR)
      const amalgamationUrl = `${this.getCreateUrl}?id=${businessId}`
      navigate(amalgamationUrl)
      return
    } catch (error) {
      this.setStartingAmalgamationSpinner(false)
      throw new Error('Unable to Amalgamate Now ' + error)
    }
  }

  /**
   * Create a draft amalgamation application based on selected business type.
   * @param accountId Account ID of logged in user.
   * @param legalType The legal type of the amalgamated business
   */
  async createBusinessAA (accountId: number, legalType: CorpTypeCd, type: AmalgamationTypes): Promise<string> {
    const businessRequest = {
      filing: {
        header: {
          name: FilingTypes.AMALGAMATION_APPLICATION,
          accountId: accountId
        },
        business: {
          legalType: legalType
        },
        amalgamationApplication: {
          nameRequest: {
            legalType: legalType
          },
          type: type
        }
      }
    } as any

    const createBusinessResponse =
      await LegalServices.createBusiness(businessRequest).catch(error => {
        throw new Error('Unable to create new Amalgamation Draft ' + error)
      })

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

header p,
section p,
ul {
  color: $gray7;
}

h1 {
  margin-bottom: 1.25rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
}

// Have all the 3 options (cards) with same height.
.v-card {
  height: 100%;
  margin-bottom: 8rem;
  position: relative;
}

// Center and push the buttons to the botton of the cards.
// Keep them centered in the cards regardless of screen size.
.btn-div {
  position: absolute;
  bottom: 2rem;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  text-align: center;
}

// TODO: Remove disabled styling when short form amalgamations are implemented.
.theme--light.v-btn.v-btn--disabled:not(.v-btn--flat):not(.v-btn--text):not(.v-btn--outlined) {
  color: white !important;
  background-color: $app-blue !important;
  opacity: 0.4;
}
</style>
