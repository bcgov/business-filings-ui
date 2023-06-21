<template>
  <div class="details-list">
    <div class="title-bar">
      <h4>
        <v-icon small>
          mdi-message-reply
        </v-icon>
        <span class="ml-1">Detail{{ filing.comments.length > 1 ? "s" : "" }} ({{ filing.comments.length }})</span>
      </h4>
      <v-btn
        v-if="isRoleStaff"
        class="add-detail-btn"
        color="primary"
        :disabled="!filing.filingId"
        @click="showCommentDialog(filing)"
      >
        <span>Add Detail</span>
      </v-btn>
    </div>

    <!-- the detail comments list-->
    <v-list class="pb-0">
      <v-list-item
        v-for="(comment, index) in filing.comments"
        :key="index"
        class="pl-0 pr-0 detail-body"
      >
        <v-list-item-content>
          <v-list-item-title class="body-2">
            <strong v-if="!isRoleStaff">BC Registries Staff</strong>
            <strong v-else>{{ comment.submitterDisplayName || 'N/A' }}</strong>
            ({{ DateUtilities.apiToPacificDateTime(comment.timestamp) }})
          </v-list-item-title>
          <v-list-item-subtitle class="body-2">
            <div class="pre-line">
              {{ comment.comment }}
            </div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { ActionBindingIF, ApiFilingIF } from '@/interfaces'
import { DateUtilities } from '@/services'
import { useFilingHistoryListStore, useRootStore } from '@/stores'

@Component({})
export default class DetailsList extends Vue {
  readonly DateUtilities = DateUtilities

  /** The filing containing comments. */
  @Prop({ default: () =>
    ({
      comments: [],
      filingId: null
    })
  })
  readonly filing!: ApiFilingIF

  /** Whether current user has staff role. */
  @Getter(useRootStore) isRoleStaff!: boolean

  @Action(useFilingHistoryListStore) showCommentDialog!: ActionBindingIF
}
</script>

<style lang="scss" scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
