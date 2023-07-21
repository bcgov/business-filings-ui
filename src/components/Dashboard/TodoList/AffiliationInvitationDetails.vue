<template>
  <div
    class="affiliation-invite"
  >
    <p>
      The following account is requesting authorization to manage Registries activities for
      {{ getEntityName || 'Unknown name' }}:
    </p>
    <p><strong>{{ affiliationInvitationTodo.affiliationInvitationDetails.fromOrgName }}</strong></p>
    <p>
      Only authorize this account if you recognize it.
    </p>
    <p>
      Allowing {{ affiliationInvitationTodo.affiliationInvitationDetails.fromOrgName }} to manage all Registries
      activities for {{ getEntityName || 'Unknown name' }}, will
      allow it to do the following (including but not limited to):
    </p>
    <ul>
      <li>Authorization of accounts to manage the business,</li>
      <li>Appointment and cessation of directors,</li>
      <li>Dissolution of the business,</li>
      <li>Filing of Annual Reports, and</li>
      <li>Changing the records office of the business.</li>
    </ul>
    <div class="mt-4">
      <p>
        Requestor message:
      </p>
      <p>{{ affiliationInvitationTodo.affiliationInvitationDetails.additionalMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { TodoItemIF } from '@/interfaces'
import { Getter } from 'pinia-class'
import { useBusinessStore } from '@/stores'

@Component({})
export default class AffiliationInvitation extends Vue {
  @Prop({ required: true }) readonly affiliationInvitationTodo!: TodoItemIF

  @Getter(useBusinessStore) getEntityName!: string
}
</script>
