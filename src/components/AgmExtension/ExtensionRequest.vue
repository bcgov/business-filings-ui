<template>
  <VcardTemplate id="extension-request">
    <template #icon>
      mdi-calendar-range
    </template>

    <template #title>
      Extension Request
    </template>

    <template #content>
      <div class="px-6 py-7">
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Is this the first AGM?</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <v-radio-group
              v-model="data.isFirstAgm"
              class="mt-0 pt-0"
            >
              <v-radio
                label="Yes"
                :value="true"
              />
              <v-radio
                label="No - Specify AGM Year below"
                :value="false"
              />
            </v-radio-group>
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>AGM Year</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <v-text-field
              class="agm-year-textfield"
              filled
              hide-details="auto"
              label="AGM Year"
              :value="agmYear"
              @change="agmYear = $event"
            />
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div class="px-6 py-7">
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Previous AGM date or a reference date</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <DatePicker />
          </v-col>
        </v-row>

        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Has an extension been requested for this AGM year already?</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            (future)
          </v-col>
        </v-row>
      </div>

      <v-divider class="mx-4" />

      <div class="px-6 py-7">
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="3"
          >
            <strong>Intended date this AGM will be held</strong>
          </v-col>
          <v-col
            cols="12"
            sm="9"
          >
            <DatePicker />
          </v-col>
        </v-row>
      </div>
    </template>
  </VcardTemplate>
</template>

<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator'
import { VcardTemplate } from '@/components/common'
import { AgmExtEvalIF } from '@/interfaces'
import { DatePicker } from '@bcrs-shared-components/date-picker'

@Component({
  components: {
    DatePicker,
    VcardTemplate
  }
})
export default class ExtensionRequest extends Vue {
  @Prop({ required: true }) readonly data!: AgmExtEvalIF

  @Emit('update:data')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private emitData (data: AgmExtEvalIF): void {}

  get agmYear (): string {
    return this.data.agmYear
  }

  set agmYear (value: string) {
    const data = { ...this.data, agmYear: value }
    this.emitData(data)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.col-12 {
  font-size: $px-16;
}

.agm-year-textfield {
  max-width: 50%;
}
</style>
