<template>
  <div class="details-list">
    <div class="title-bar">
      <h4>
        <v-icon small>mdi-message-reply</v-icon>
        Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})
      </h4>
      <v-btn
        class="add-detail-btn"
        color="primary"
        v-if="isRoleStaff && !isTask"
        :disabled ="!filing.filingId"
        @click.stop="showCommentDialog(filing.filingId)"
      >
        <span>Add Detail</span>
      </v-btn>
    </div>

    <!-- the detail comments list-->
    <v-list class="pb-0">
      <v-list-item class="pl-0 pr-0 detail-body" v-for="(comment, index) in filing.comments" :key="index">
        <v-list-item-content>
          <v-list-item-title class="body-2">
            <strong v-if="!isRoleStaff">Registry Staff</strong>
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
import { Component, Mixins, Prop, Emit } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { DateMixin } from '@/mixins'
import { HistoryItemIF, TodoItemIF } from '@/interfaces'

@Component({})
export default class DetailsList extends Mixins(DateMixin) {
  /** The filing containing comments. */
  @Prop({ default: () =>
    ({
      comments: [],
      filingId: null
    })
  })
  readonly filing: HistoryItemIF | TodoItemIF

  /** Whether this filing is a task (and therefore whether to disallow new detail comments). */
  @Prop({ default: false })
  readonly isTask: boolean

  /** Whether current user has staff role. */
  @Getter isRoleStaff!: boolean

  /** Emits an event to trigger the comment dialog. */
  @Emit('showCommentDialog')
  private showCommentDialog (val: string): void { }
}
</script>

<style lang="scss" scoped>
.title-bar h4 {
  letter-spacing: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

.title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
