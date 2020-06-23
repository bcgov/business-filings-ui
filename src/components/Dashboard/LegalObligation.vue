<template>
  <div v-if="showLegalObligation && isBusinessWithNoMaintenanceFilings && !tempRegNumber"
    class="legal-obligation-container"
  >
    <v-card flat class="legal-obligation-section">
      <v-icon color="blue darken-2" class="info-icon">mdi-information-outline</v-icon>
      <div class="share-structure-check-text">
        <span class="bold-text">Legal Obligations:</span>
        You are required by the <i>Business Corporations Act</i> to keep the information about your corporation up
        to date with the Registrar: For example, you must file annual reports, director changes and address changes.
        <span class="read-more-btn" @click="readMoreFlag = true">
          <span v-if="!readMoreFlag">Read more about your legal obligations...</span>
        </span>

        <div v-if="readMoreFlag">
          <div class="read-more-line">
            The most common updates you are legally responsible to file include:
          </div>
          <div class="read-more-line">
            <ul>
              <li>
                <span class="bold-text">Annual Reports</span> - file an annual report each year within two months after
                each anniversary of the date on which the company was recognized. This ensures your company remains in
                good standing with the Registrar.
              </li>
              <li>
                <span class="bold-text">Director changes</span> - update director information within 15 days of any
                change (appointing, ceasing or updating an existing director's name or address)
              </li>
              <li>
                <span class="bold-text">Company address changes</span> - update any changes to a company's registered or
                records office addresses as they occur.
              </li>
            </ul>
          </div>
          <div class="read-more-line">
            <span>Find more detailed information <a :href="detailInfoURL" target="_blank">here</a></span>
          </div>
          <div class="read-more-line">
            <span class="read-more-btn" @click="readMoreFlag = false">Read less...</span>
          </div>
        </div>

        <div class="legal-obligation-btn-panel">
          <v-btn id="dismiss-btn" color="primary" @click="showLegalObligation = false" height="25" width="90">
            Dismiss
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

@Component({
  computed: {
    ...mapGetters(['isBusinessWithNoMaintenanceFilings'])
  }
})
export default class LegalObligation extends Vue {
  readonly isBusinessWithNoMaintenanceFilings!: boolean
  private readMoreFlag: boolean = false
  private showLegalObligation: boolean = true

  private get detailInfoURL () {
    return 'https://www2.gov.bc.ca/gov/content/employment-business/business/' +
    'managing-a-business/permits-licences/businesses-incorporated-companies/' +
    'incorporated-companies/make-changes'
  }

  private get tempRegNumber (): string {
    return sessionStorage.getItem('TEMP_REG_NUMBER')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.legal-obligation-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.legal-obligation-section {
    display: flex;
    align-items: flex-start;
    padding: 1.2rem;
    font-size: 0.9rem;
    width: 75%;
}

ul {
  list-style-type: disc;
}

li {
  padding-top:0.25rem
}

.read-more-line {
  padding-top: 1rem
}

.read-more-btn {
  cursor: pointer;
  color: $primary-blue;
}

.bold-text {
  font-weight: bold;
}

.legal-obligation-btn-panel {
  float: right;
  margin-top: 1.5rem;
}

.info-icon {
  margin-right: 0.5rem;
}
</style>
