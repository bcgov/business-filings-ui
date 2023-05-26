<template>
  <v-expansion-panels v-model="panel" id="not-in-good-standing-container">
    <v-expansion-panel class="mb-6">
      <v-expansion-panel-header hide-actions class="d-flex justify-space-between px-6 py-5">
        <h3>
          <v-icon left color="orange darken-2">mdi-alert</v-icon>
          <span>This business is not in good standing</span>
        </h3>
        <v-btn text color="primary" class="details-btn my-n1" @click.stop="togglePanel()">
          <span color="primary">{{ panel === 0 ? "Hide Details" : "View Details" }}</span>
          <v-icon right color="primary">
            {{ panel === 0 ? "mdi-chevron-up" : "mdi-chevron-down" }}
          </v-icon>
        </v-btn>
      </v-expansion-panel-header>

      <v-expansion-panel-content>
        <p class="mb-0">
          The most common reason a business is not in good standing is an overdue annual report.
          Any outstanding annual reports must be filed to bring the business back into good
          standing.
        </p>
        <p class="mb-0 pt-5">
          If further action is required, please contact BC Registries staff:
        </p>
        <ContactInfo class="pt-5" />
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ContactInfo } from '@/components/common'

@Component({
  components: { ContactInfo }
})
export default class NotInGoodStanding extends Vue {
  panel = 1

  togglePanel (): void {
    this.panel = (this.panel === 1 ? 0 : 1)
  }
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
