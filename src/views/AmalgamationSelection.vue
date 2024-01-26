<template>
  <div id="amalgamation-selection">
    <TechnicalErrorDialog
      :dialog="showErrorDialog"
      attach="#amalgamation-selection"
      @close="showErrorDialog = false"
    />

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
                Choose the appropriate one for your filing.
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
            class="pa-8"
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
                color="primary"
                large
                @click="startHorizontalAmalgamation()"
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
            class="pa-8"
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
                color="primary"
                large
                @click="startVerticalAmalgamation()"
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
            class="pa-8"
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
import { AmlRoles, AmlTypes, Routes } from '@/enums'
import { LegalServices } from '@/services'
import { navigate } from '@/utils'
import { TechnicalErrorDialog } from '@/components/dialogs'

@Component({
  components: {
    TechnicalErrorDialog
  }
})
export default class AmalgamationSelection extends Vue {
  @Getter(useConfigurationStore) getCreateUrl!: string
  @Getter(useRootStore) getBusinessEmail!: string
  @Getter(useRootStore) getFullPhoneNumber!: string
  @Getter(useBusinessStore) getIdentifier!: string
  @Getter(useBusinessStore) getLegalType!: CorpTypeCd
  @Getter(useBusinessStore) isBComp!: boolean
  @Getter(useBusinessStore) isBcCompany!: boolean
  @Getter(useBusinessStore) isCcc!: boolean
  @Getter(useBusinessStore) isUlc!: boolean

  @Action(useRootStore) setStartingAmalgamationSpinner!: (x: boolean) => void

  showErrorDialog = false

  /** Called when component is created. */
  created (): void {
    const filingId = +this.$route.params.filingId // id param of this selection panel route, must be 0

    // if required data isn't set, go back to dashboard
    if (!this.getIdentifier || filingId !== 0) {
      this.$router.push({ name: Routes.DASHBOARD })
    }
  }

  /** The amalmagated company result name depending on the type. */
  getRegularAmalgamationText (): string {
    if (this.isBComp || this.isBcCompany) return 'BC limited company'
    if (this.isCcc) return 'BC community contribution company'
    if (this.isUlc) return 'BC unlimited liability company'
    return 'Unknown'
  }

  /** Called when Start Regular Long-form button is clicked. */
  async startRegularAmalgamation (): Promise<any> {
    // Create a draft amalgamation application then redirect to Create UI.
    try {
      // show spinner since this is a network call
      this.setStartingAmalgamationSpinner(true)
      const businessId = await this.createBusinessAA(AmalgamationTypes.REGULAR)
      const amalgamationUrl = `${this.getCreateUrl}?id=${businessId}`
      navigate(amalgamationUrl)
      return
    } catch (error) {
      console.log('Error: unable to amalgamate now =', error)
      this.setStartingAmalgamationSpinner(false)
      this.showErrorDialog = true
    }
  }

  /** Called when Start Short form Horizontal button is clicked. */
  async startHorizontalAmalgamation (): Promise<any> {
    // Create a draft amalgamation application then redirect to Create UI.
    try {
      // show spinner since this is a network call
      this.setStartingAmalgamationSpinner(true)
      const businessId = await this.createBusinessAA(AmalgamationTypes.HORIZONTAL)
      const amalgamationUrl = `${this.getCreateUrl}?id=${businessId}`
      navigate(amalgamationUrl)
      return
    } catch (error) {
      console.log('Error: unable to amalgamate now =', error)
      this.setStartingAmalgamationSpinner(false)
      this.showErrorDialog = true
    }
  }

  /** Called when Start Short form Vertical button is clicked. */
  async startVerticalAmalgamation (): Promise<any> {
    try {
      // show spinner since this is a network call
      this.setStartingAmalgamationSpinner(true)
      const businessId = await this.createBusinessAA(AmalgamationTypes.VERTICAL)
      const amalgamationUrl = `${this.getCreateUrl}?id=${businessId}`
      navigate(amalgamationUrl)
      return
    } catch (error) {
      console.log('Error: unable to amalgamate now =', error)
      this.setStartingAmalgamationSpinner(false)
      this.showErrorDialog = true
    }
  }

  /**
   * Creates a draft amalgamation application.
   * @param type the type of amalgamation to create
   * @returns the business identifier of the newly created amalgamation application
   */
  private async createBusinessAA (type: AmalgamationTypes): Promise<string> {
    const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
    const legalType = this.getLegalType

    const draftAmalgamationApplication = {
      filing: {
        header: {
          name: FilingTypes.AMALGAMATION_APPLICATION,
          accountId
        },
        business: {
          legalType
        },
        amalgamationApplication: {
          nameRequest: {
            legalType
          },
          type,
          contactPoint: {
            email: this.getBusinessEmail,
            phone: this.getFullPhoneNumber
          }
        }
      }
    } as any

    // if this is a regular amalgamation, pre-populate the current business as a TING
    if (type === AmalgamationTypes.REGULAR) {
      draftAmalgamationApplication.filing.amalgamationApplication.amalgamatingBusinesses = [
        {
          type: AmlTypes.LEAR,
          role: AmlRoles.AMALGAMATING,
          identifier: this.getIdentifier
        }
      ]
    }

    // For Horizontal and Vertical amalgamation, set current business as Holding company
    if (type === AmalgamationTypes.HORIZONTAL || type === AmalgamationTypes.VERTICAL) {
      draftAmalgamationApplication.filing.amalgamationApplication.amalgamatingBusinesses = [
        {
          type: AmlTypes.LEAR,
          role: AmlRoles.HOLDING,
          identifier: this.getIdentifier
        }
      ]
    }

    // create the draft business record
    // (throws an exception on error, which startRegularAmalgamation() will handle)
    const filing = await LegalServices.createDraftBusiness(draftAmalgamationApplication)

    // validate and return the identifier
    const identifier = filing?.business?.identifier as string
    if (!identifier) throw new Error('Invalid business identifier')
    return identifier
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

p, ul {
  color: $gray9;
}

h1 {
  margin-bottom: 1.25rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
}

// Have all the 3 options (cards) with same height.
.v-card {
  height: 100%;
  margin-bottom: 4rem;
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
