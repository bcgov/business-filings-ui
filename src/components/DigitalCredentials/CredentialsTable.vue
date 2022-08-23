<template>
  <div id="credentials-table" class="mt-8">
    <header class="review-header">
      <label class="font-weight-bold pl-2">Your Digital Credentials</label>
    </header>

    <v-card flat>
      <v-data-table
        id="credential-records-table"
        fixed
        disable-sort
        hide-default-footer
        :items="credentialRecords"
        :headers="!!credentialRecords ? credentialsTableHeaders : []"
        no-data-text="All digital credentials associated with this business will appear here."
      >
      </v-data-table>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { TableHeaderIF } from '@/interfaces'

@Component({})
export default class CredentialsTable extends Vue {
  get credentialsTableHeaders (): Array<TableHeaderIF> {
    // Do not display headers if there is table data
    if (this.credentialRecords.length === 0) return []
    return [
      {
        class: 'column-md',
        text: 'Business Name',
        value: 'name'
      },
      {
        class: 'column-md',
        text: 'Type',
        value: 'type'
      },
      {
        class: 'column-md',
        text: 'Status',
        value: 'status'
      },
      {
        class: 'column-md',
        text: 'Date of Issue',
        value: 'date'
      },
      {
        class: 'column-md',
        text: 'Credential ID',
        value: 'credId'
      }
    ]
  }

  // Mocked Data: To be retrieved from LEAR business record once created
  get credentialRecords (): Array<any> {
    return [
      {
        name: '08123123 B.C. LTD',
        type: 'Business Credential',
        status: 'Issued',
        date: 'August 15, 2022',
        credId: '1234-5678-9809'
      },
      {
        name: '08123123 B.C. LTD',
        type: 'Business Relationship Credential',
        status: 'Issued',
        date: 'August 15, 2022',
        credId: '1234-5678-9809'
      }
    ]
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';
.review-header {
  background-color: $BCgovBlue5O;
  padding: 1.25rem;
  color: $gray9;
}
::v-deep {
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th, td {
    color: $gray7;
    padding: 1.25rem;
    font-size: .875rem;
  }
}
</style>
