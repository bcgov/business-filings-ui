<template>
  <v-expansion-panel
    class="pending-template align-items-top py-5 px-6"
    :disabled="true"
  >
    <v-expansion-panel-header>
      <div class="item-header d-flex justify-space-between">
        <div>
          <h3 class="item-header-title">
            <slot name="title">
              <span>{{ item.displayName }}</span>
              <v-btn
                class="expand-btn ml-1"
                outlined
                color="primary"
                :ripple="false"
                @click.stop="$emit('toggle-panel')"
              >
                <v-icon>mdi-information-outline</v-icon>
                <span>{{ (0 === index) ? "Hide Details" : "View Details" }}</span>
              </v-btn>
            </slot>
          </h3>

          <slot name="subtitle">
            <div class="item-header-subtitle">
              <span>PENDING STAFF REVIEW</span>
              <span class="vert-pipe" />
              <span>Submitted by {{ item.header.submitter }} on <DateTooltip :date="submittedDate" />)</span>
            </div>
          </slot>
        </div>

        <slot name="actions">
          <!-- no default actions at this time -->
        </slot>
      </div>
    </v-expansion-panel-header>

    <v-expansion-panel-content
      eager
      class="pt-5"
    >
      <slot name="body">
        <!-- no default body at this time -->
      </slot>

      <slot name="documents">
        <!-- no default documents at this time -->
      </slot>

      <slot name="detail-comments">
        <!-- no default detail-comments at this time -->
      </slot>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { DateTooltip } from '@/components/common'

@Component({
  components: { DateTooltip }
})
export default class PendingTemplate extends Vue {
  @Prop({ required: true }) readonly item!: any
  @Prop({ required: true }) readonly index!: number

  get submitter (): Date {
    return this.item.header.submitter
  }

  get submittedDate (): Date {
    return new Date(this.item.header.date)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.item-header {
  line-height: 1.25rem;

  .item-header-title {
    font-weight: bold;

    .expand-btn {
      margin-top: -1px;
      padding-top: 1px;
      border: none;

      // specifically enable button on this disabled expansion panel
      pointer-events: auto;
    }
  }

  .item-header-subtitle {
    color: $gray7;
  }
}

// specifically enable tooltips for this page
:deep() {
  .v-tooltip + div {
    pointer-events: auto;
  }
}

p {
  color: $gray7;
  font-size: $px-15;
  margin-top: 1rem !important;
  margin-bottom: 0 !important;
}

.vert-pipe {
  margin-top: 0.1rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  height: 1rem;
  border-left: 1px solid $gray6;
}
</style>
