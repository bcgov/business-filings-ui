<template>
  <div class="details-list">
    <div class="title-bar pt-6">
      <h4>
        <v-icon small>mdi-message-reply</v-icon>
        Detail{{filing.comments.length > 1 ? "s" : ""}} ({{filing.comments.length}})
      </h4>
      <v-btn
        class="add-detail-btn"
        color="primary"
        v-if="isRoleStaff && !isTask"
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
            ({{convertUTCTimeToLocalTime(comment.timestamp)}})
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
// Libraries
import { Component, Mixins, Prop, Emit } from 'vue-property-decorator'
import { mapGetters } from 'vuex'

// Mixins
import { DateMixin } from '@/mixins'

@Component({
  computed: {
    ...mapGetters(['isRoleStaff'])
  }
})
export default class DetailsList extends Mixins(DateMixin) {
  /** Filing containing correction information. */
  @Prop({ default: () => { return { comments: [] } } })
  private filing: object

  /** Whether this filing is a task (and therefore whether to disallow new detail comments). */
  @Prop({ default: false })
  private isTask: boolean

  /** Emits an event to trigger the comment dialog */
  @Emit('showCommentDialog')
  private showCommentDialog (val: string): void { }
}
</script>

<style lang="scss" scoped>
// @import "@/assets/styles/theme.scss";

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
