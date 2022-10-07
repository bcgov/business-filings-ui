<template>
  <div class="details-list">
    <div class="title-bar">
      <h4>
        <v-icon small>mdi-message-reply</v-icon>
        <span class="ml-1">Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})</span>
      </h4>
      <v-btn
        class="add-detail-btn"
        color="primary"
        v-if="isRoleStaff"
        :disabled ="!filing.filingId"
        @click.stop="showCommentDialog(filing)"
      >
        <span>Add Detail</span>
      </v-btn>
    </div>

    <!-- the detail comments list-->
    <v-list class="pb-0">
      <v-list-item class="pl-0 pr-0 detail-body" v-for="(comment, index) in filing.comments" :key="index">
        <v-list-item-content>
          <v-list-item-title class="body-2">
            <strong v-if="!isRoleStaff">BC Registries Staff</strong>
            <strong v-else>{{comment.submitterDisplayName || 'N/A'}}</strong>
            ({{apiToPacificDateTime(comment.timestamp)}})
          </v-list-item-title>
          <v-list-item-subtitle class="body-2">
            <div class="pre-line">{{comment.comment}}</div>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { HistoryItemIF } from '@/interfaces'

@Component({
  mixins: [DateMixin]
})
export default class DetailsList extends Vue {
  /** The filing containing comments. */
  @Prop({ default: () =>
    ({
      comments: [],
      filingId: null
    })
  })
  readonly filing!: HistoryItemIF

  /** Whether current user has staff role. */
  @Getter isRoleStaff!: boolean

  /** Emits an event to trigger the comment dialog. */
  @Emit('showCommentDialog')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected showCommentDialog (filing: HistoryItemIF): void {}
}
</script>

<style lang="scss" scoped>
.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
