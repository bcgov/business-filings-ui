<template>
  <div id="agm-location-chg">
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
            <div class="start-horizontal-short-form-btn-div">
              <!-- TODO: Remove disabled when doing short form amalgamations -->
              <v-btn
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
            <div class="start-horizontal-short-form-btn-div">
              <!-- TODO: Remove disabled when doing short form amalgamations -->
              <v-btn
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
            <div class="start-horizontal-short-form-btn-div">
              <v-btn
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
import { useBusinessStore } from '@/stores'
import { Getter } from 'pinia-class'
import { Component, Vue } from 'vue-property-decorator'
import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { AmalgamationTypes, FilingTypes } from '@bcrs-shared-components/enums'

@Component({})
export default class AmalgamationSelection extends Vue {
  @Getter(useBusinessStore) getLegalType!: string
  @Getter(useBusinessStore) isBComp!: boolean
  @Getter(useBusinessStore) isBcCompany!: boolean
  @Getter(useBusinessStore) isCcc!: boolean
  @Getter(useBusinessStore) isUlc!: boolean

  /** Get the amalmagated company result name depending on the type. */
  getRegularAmalgamationText (): string {
    if (this.isBComp || this.isBcCompany) return 'BC limited company'
    if (this.isCcc) return 'BC community contribution company'
    if (this.isUlc) return 'BC unlimited liability company'
    return 'Unknown'
  }

  /** Start Regular Long-form button pressed. */
  async startRegularAmalgamation (): Promise<any> {
    // let legalType = null
    // if (this.isBComp) legalType = CorpTypeCd.BC_COMPANY
    // else legalType = this.getLegalType

    try {
      // show spinner since this is a network call
      this.$root.$emit('showSpinner', true)
      // const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
      // const businessId = await this.createBusinessAA(accountId, legalType)
      return
    } catch (error) {
      this.$root.$emit('showSpinner', false)
      throw new Error('Unable to Amalgamate Now ' + error)
    }
  }

  /**
   * Creates (posts) a draft (temporary) business record.
   * Must be logged in to use this.
   * Throws an exception on error.
   */
  async createBusiness (businessRequest: any): Promise<any> {
    const axios = addAxiosInterceptors(Axios.create())
    const legalApiUrl = sessionStorage.getItem('LEGAL_API_URL')

    const url = `${legalApiUrl}/businesses?draft=true`
    return axios.post(url, businessRequest)
  }

  /**
   * Create a draft amalgamation application based on selected business type.
   * @param accountId Account ID of logged in user.
   * @param legalType The legal type of the amalgamated business
   */
  async createBusinessAA (accountId: number, legalType: CorpTypeCd): Promise<string> {
    const businessRequest = {
      filing: {
        header: {
          name: FilingTypes.AMALGAMATION_APPLICATION,
          accountId: accountId
        },
        business: {
          legalType: legalType
        },
        amalgamation: {
          nameRequest: {
            legalType: legalType
          },
          type: AmalgamationTypes.REGULAR
        }
      }
    } as any

    const createBusinessResponse =
      await this.createBusiness(businessRequest).catch(error => {
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
.start-horizontal-short-form-btn-div {
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
