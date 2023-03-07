<template>
  <dl id="tombstone">
    <!-- Registration Date -->
    <template v-if="!!registrationDate">
      <dt class="mr-2">Registration Date:</dt>
      <dd id="registration-date">{{ registrationDate }}</dd>
    </template>

    <!-- Registration Number -->
    <template v-if="!!registrationNumber">
      <dt class="mr-2">Registration Number:</dt>
      <dd id="registration-number">{{ registrationNumber }}</dd>
    </template>

    <!-- Business Number -->
    <template v-if="!!businessNumber">
      <dt class="mr-2">Business Number:</dt>
      <dd id="business-number">{{ businessNumber }}</dd>
    </template>

    <!-- Incorporation Number -->
    <template v-if="!!incorporationNumber">
      <dt class="mr-2">Incorporation Number:</dt>
      <dd id="incorporation-number">{{ incorporationNumber }}</dd>
    </template>

    <!-- NR Number -->
    <template v-if="!!nameRequestNumber">
      <dt class="mr-2">Name Request Number:</dt>
      <dd id="name-request-number">{{ nameRequestNumber }}</dd>
    </template>

    <!-- Email -->
    <template v-if="!!email">
      <dt class="mr-2">Email:</dt>
      <dd id="email" class="cursor-pointer" @click="editBusinessProfile()">
        <span>{{ email }}</span>
        <v-btn id="change-email-button" small text color="primary">
          <v-icon small>mdi-pencil</v-icon>
          <span>Change</span>
        </v-btn>
      </dd>
    </template>

    <!-- Phone -->
    <template v-if="!!phone">
      <dt class="mr-2">Phone:</dt>
      <dd id="phone" class="cursor-pointer" @click="editBusinessProfile()">
        <span>{{ phone }}</span>
        <v-btn id="change-phone-button" small text color="primary">
          <v-icon small>mdi-pencil</v-icon>
          <span>Change</span>
        </v-btn>
      </dd>
    </template>
  </dl>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { navigate } from '@/utils'
import { DateUtilities } from '@/services'

@Component({})
export default class Tombstone extends Vue {
  @Getter getBusinessEmail!: string
  @Getter getBusinessProfileUrl!: string
  @Getter getBusinessNumber!: string
  @Getter getFoundingDate!: Date
  @Getter getFullPhoneNumber!: string
  @Getter getIdentifier!: number
  @Getter getNameRequest!: any
  @Getter isFirm!: boolean

  /** The Business ID string, if available. */
  get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The registration date, if applicable. */
  get registrationDate (): string {
    if (this.businessId && this.isFirm) {
      return (DateUtilities.dateToPacificDate(this.getFoundingDate, true) || 'Not Available')
    }
    return null
  }

  /** The registration number, if applicable. */
  get registrationNumber (): string {
    if (this.businessId && this.isFirm) {
      return (this.getIdentifier?.toString() || 'Not Available')
    }
    return null
  }

  /** The business number, if applicable. */
  get businessNumber (): string {
    if (this.businessId) {
      return (this.getBusinessNumber || 'Not Available')
    }
    return null
  }

  /** The incorporation number, if applicable. */
  get incorporationNumber (): string {
    if (this.businessId && !this.isFirm) {
      return (this.getIdentifier?.toString() || 'Not Available')
    }
    return null
  }

  /** The name request number, if applicable. */
  get nameRequestNumber (): string {
    return (this.getNameRequest?.nrNum || null)
  }

  /** The email, if applicable. */
  get email (): string {
    if (this.businessId) {
      return (this.getBusinessEmail || 'Not Available')
    }
    return null
  }

  /** The phone, if applicable. */
  get phone (): string {
    if (this.businessId) {
      return (this.getFullPhoneNumber || 'Not Available')
    }
    return null
  }

  /** Navigates to the Auth UI to update business profile. */
  editBusinessProfile (): void {
    navigate(this.getBusinessProfileUrl)
  }
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

dl {
  font-size: $px-14;
  line-height: 1.5rem;
}

dt {
  color: $gray9;
  font-weight: bold;
  float: left;
  clear: left;
  margin-right: 0.5rem;
}

// hide change buttons when not hovering on value:
dd:not(:hover) > button {
  display: none;
}

#change-email-button,
#change-phone-button {
  height: 1.125rem;
  padding: 0.25rem 0.5rem;
  margin-top: -0.125rem;
  margin-left: 0.125rem;
}
</style>
