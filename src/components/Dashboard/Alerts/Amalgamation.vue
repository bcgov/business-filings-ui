<template>
  <v-expansion-panel id="amalgamation-panel">
    <v-expansion-panel-header
      hide-actions
      class="d-flex justify-space-between px-6 py-5"
    >
      <h3>
        <v-icon
          left
          color="orange darken-2"
        >
          mdi-alert
        </v-icon>
        <span>This corporation is part of an amalgamation and is scheduled to become
          historical on {{ amalgamationDate || '[unknown]' }}.</span>
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
        If you have any questions, please contact BC Registries staff:
      </p>
      <ContactInfo class="pt-5" />
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { ContactInfo } from '@/components/common'
import { useBusinessStore } from '@/stores'
import { ApiDateTimeUtc, BusinessWarningIF } from '@/interfaces'
import { DateUtilities } from '@/services'

@Component({
  components: { ContactInfo }
})
export default class Amalgamation extends Vue {
  @Prop({ required: true }) readonly showPanel!: boolean

  @Getter(useBusinessStore) getBusinessWarnings!: BusinessWarningIF[]

  get amalgamationDate (): string {
    const warning = this.getBusinessWarnings.find(item =>
      item.warningType?.includes('FUTURE_EFFECTIVE_AMALGAMATION')
    )
    const date = warning?.data?.amalgamationDate as ApiDateTimeUtc
    return DateUtilities.apiToPacificDate(date, true)
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
