<template>
  <div id="entity-info" :class="{ 'staff': isRoleStaff }">
    <v-container>

      <!-- Entity Name, Entity Status -->
      <div class="title-container">
        <div class="mb-1" id="entity-legal-name">
          <span>{{ entityName || 'Not Available' }}</span>
        </div>
        <v-chip v-if="isGoodStanding" class="blue" id="entity-status" small label text-color="white">
          <span>In Good Standing</span>
        </v-chip>
        <v-chip v-else-if="isPendingDissolution" class="red" id="entity-status" small label text-color="white">
          <span>Pending Dissolution</span>
        </v-chip>
        <v-chip v-else-if="isNotInCompliance" class="red" id="entity-status" small label text-color="white">
          <span>Not in Compliance</span>
        </v-chip>
      </div>

      <!-- Business Numbers, Contact Info -->
      <div class="business-info" v-if="businessId">
        <div class="business-info__meta">
          <dl>
            <dt>Business No:</dt>
            <dd class="ml-2" id="entity-business-number">
              <span>{{ entityBusinessNo || 'Not Available' }}</span>
            </dd>
            <dt>Incorporation No:</dt>
            <dd class="ml-2" id="entity-incorporation-number">
              <span>{{ entityIncNo || 'Not Available' }}</span>
            </dd>
          </dl>
        </div>

        <div class="business-info__contact">
          <dl>
            <dt></dt>
            <dd id="entity-business-email" aria-label="Business Email">
              <span>{{businessEmail || 'Unknown Email'}}</span>
            </dd>
            <template v-if="fullPhoneNumber">
              <dt></dt>
              <dd id="entity-business-phone" aria-label="Business Phone">
                <span>{{fullPhoneNumber}}</span>
              </dd>
            </template>
          </dl>
          <v-menu bottom left offset-y content-class="v-menu">
            <template v-slot:activator="{ on }">
              <v-btn id="entity-settings-button" small icon color="primary" v-on="on">
                <v-icon small>mdi-cog</v-icon>
              </v-btn>
            </template>
            <v-list class="pt-0 pb-0">
              <v-list-item id="update-business-profile-menuitem" @click="editBusinessProfile()">
                <v-list-item-title>Update business profile</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- NR Subtitle, NR Number -->
      <div class="nr-info" v-if="nrNumber">
        <div class="nr-info__meta">
          <dl>
            <dt></dt>
            <dd id="nr-subtitle">
              <span>{{ nrSubtitle }}</span>
            </dd>
            <dt>Name Request No:</dt>
            <dd class="ml-2" id="nr-number">
              <span>{{ nrNumber }}</span>
            </dd>
          </dl>
        </div>
      </div>

    </v-container>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Mixins, Vue } from 'vue-property-decorator'
import { mapState, mapGetters } from 'vuex'

// Mixins
import { EnumMixin } from '@/mixins'

// Enums
import { EntityStatus, EntityTypes } from '@/enums'

@Component({
  mixins: [EnumMixin],
  computed: {
    // Property definitions for runtime environment.
    ...mapState(['entityName', 'entityType', 'entityStatus', 'entityBusinessNo', 'entityIncNo',
      'businessEmail', 'businessPhone', 'businessPhoneExtension']),
    ...mapGetters(['isRoleStaff'])
  }
})
export default class EntityInfo extends Mixins(EnumMixin) {
  // Local definitions of computed properties for static type checking.
  // Use non-null assertion operator to allow use before assignment.
  readonly entityName!: string
  readonly entityType!: EntityTypes
  readonly entityStatus!: EntityStatus
  readonly entityBusinessNo!: string
  readonly entityIncNo!: number
  readonly businessEmail!: string
  readonly businessPhone!: string
  readonly businessPhoneExtension!: string
  readonly isRoleStaff!: boolean

  /** The Business ID string. */
  private get businessId (): string {
    return sessionStorage.getItem('BUSINESS_ID')
  }

  /** The NR Number string. */
  private get nrNumber (): string {
    return sessionStorage.getItem('NR_NUMBER')
  }

  /** The NR Subtitle string. */
  private get nrSubtitle (): string {
    switch (this.entityStatus) {
      case EntityStatus.NAME_REQUEST:
        return `${this.entityTypeToName(this.entityType)} Name Request`
      case EntityStatus.INCORPORATION_APPLICATION:
        return `${this.entityTypeToName(this.entityType)} Incorporation Application`
    }
    return '' // should never happen
  }

  /** The business phone number and optional extension. */
  private get fullPhoneNumber (): string {
    if (this.businessPhone) {
      return `${this.businessPhone}${this.businessPhoneExtension ? (' x' + this.businessPhoneExtension) : ''}`
    }
    return ''
  }

  /** True if the entity has the subject status. */
  private get isGoodStanding (): boolean {
    return (this.entityStatus === EntityStatus.GOOD_STANDING)
  }

  /** True if the entity has the subject status. */
  private get isPendingDissolution (): boolean {
    return (this.entityStatus === EntityStatus.PENDING_DISSOLUTION)
  }

  /** True if the entity has the subject status. */
  private get isNotInCompliance (): boolean {
    return (this.entityStatus === EntityStatus.NOT_IN_COMPLIANCE)
  }

  /** Redirects the user to the Auth UI to update their business profile. */
  private editBusinessProfile (): void {
    const authUrl = sessionStorage.getItem('AUTH_URL')
    const businessProfileUrl = authUrl + 'businessprofile'

    // assume Business Profile URL is always reachable
    window.location.assign(businessProfileUrl)
  }
}
</script>

<!-- eslint-disable max-len -->
<style lang="scss" scoped>
// FUTURE: Explore how to expose this globally without having to include in each module
// see https://cli.vuejs.org/guide/css.html#automatic-imports
// see https://vue-loader-v14.vuejs.org/en/features/postcss.html
@import '@/assets/styles/theme.scss';

#entity-info {
  background: $BCgovInputBG;
}

// #entity-info.staff {
//   background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='105' height='100'><text x='0' y='105' font-size='30' transform='rotate(-45 10,40)' opacity='0.1'>STAFF</text></svg>");
//   background-repeat: repeat-x;
// }

.container {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

#entity-legal-name {
  display: inline-block;
  color: $gray9;
  letter-spacing: -0.01rem;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
}

#entity-status {
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  vertical-align: top;
}

.nr-info,
.business-info {
  display: flex;
  direction: row;
  justify-content: space-between;
}

dl {
  display: inline-block;
  overflow: hidden;
  color: $gray6;
}

dd, dt {
  float: left;
}

dt {
  position: relative;
}

dd + dt:before {
  content: "•";
    display: inline-block;
    margin-right: 0.75rem;
    margin-left: 0.75rem;
}

.business-info__contact {
  display: flex;
  align-items: center;
}

#entity-settings-button {
  margin-top: 0.1rem;
  margin-left: 0.25rem;
}

#update-business-profile-menuitem {
  min-width: 220px;
}
</style>
