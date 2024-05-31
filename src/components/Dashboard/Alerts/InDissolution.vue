<template>
  <v-expansion-panel id="in-dissolution-panel">
    <v-expansion-panel-header
      hide-actions
      class="d-flex justify-space-between px-6 py-5"
    >
      <h3>
        <v-icon
          left
          color="error"
        >
          mdi-alert
        </v-icon>
        <span>Urgent - this business is in the process of being dissolved</span>
      </h3>
      <v-btn
        text
        color="primary"
        class="details-btn my-n1"
        @click.stop="togglePanel()"
      >
        <span color="primary">{{ showPanel ? "Hide Details" : "View Details" }}</span>
        <v-icon
          right
          color="primary"
        >
          {{ showPanel ? "mdi-chevron-up" : "mdi-chevron-down" }}
        </v-icon>
      </v-btn>
    </v-expansion-panel-header>

    <v-expansion-panel-content eager>
      <p class="mb-0">
        This means that the business will be struck from the Corporate Registry in
        <strong>{{ daysLeft }} days</strong> due to overdue annual reports.
        Please file the annual reports immediately to bring this business back into good standing
        or request a delay of dissolution if more time is needed.
      </p>
      <p class="mb-0 pt-5">
        For assistance, please contact BC Registries staff:
      </p>
      <ContactInfo class="pt-5" />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { BusinessWarningIF } from '@/interfaces'
import { ContactInfo } from '@/components/common'
import { Getter } from 'pinia-class'
import { useBusinessStore, useRootStore } from '@/stores'
import { DateUtilities } from '@/services'
import { WarningTypes } from '@/enums'

@Component({
  components: { ContactInfo }
})
export default class InDissolution extends Vue {
  @Prop({ required: true }) readonly showPanel!: boolean

  @Getter(useRootStore) getCurrentDate!: string
  @Getter(useBusinessStore) getBusinessWarnings!: BusinessWarningIF[]

  /** Return the number of days left for the business until it is dissolved. */
  get daysLeft (): number {
    const warning = this.getBusinessWarnings.find(item =>
      item.warningType?.includes(WarningTypes.INVOLUNTARY_DISSOLUTION)
    )
    const targetDissolutionDate = warning?.data?.targetDissolutionDate

    return DateUtilities.daysBetweenTwoDates(new Date(this.getCurrentDate), new Date(targetDissolutionDate)) || -1
  }

  @Emit('togglePanel')
  togglePanel (): void {}
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.v-expansion-panel-header {
  pointer-events: none; // disable whole-row expansion
}

h3 {
  .v-icon {
    margin-top: -2px;
    font-size: $px-20;
  }

  span {
    font-size: $px-14;
  }
}

.details-btn {
  pointer-events: auto; // enable detail button only
  max-width: fit-content;
  color: $app-blue;

  span {
    font-size: $px-13;
  }

  .v-icon {
    font-size: $px-24 !important;
  }
}

// override default expansion panel padding
:deep(.v-expansion-panel-content__wrap) {
  padding: 0 1.5rem 1.25rem 1.5rem;
}

p {
  font-size: $px-14;
}

// override contact info sizes
:deep(.contact-info .contact-container) {
  .v-icon {
    font-size: $px-16 !important;
  }
  span {
    font-size: $px-14 !important;
  }
}
</style>
