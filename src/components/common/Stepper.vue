<template>
  <v-card id="step-buttons-container">
    <div
      v-for="(step, index) in getSteps"
      class="step"
      :key="index"
      @click="goTo(step)"
      v-on:keyup.tab="goTo(step)"
      :class="{'active-step': isCurrentStep(step)}"
    >
      <div class="step__indicator">
        <div class="step__line"></div>
        <v-btn
          outlined fab
          color="primary"
          :id=step.id
          class="step__btn"
          tabindex="-1"
          :ripple="false"
          :class="{ 'selected-btn': isCurrentStep(step) }"
        >
          <v-icon class="step__icon" :class="{ 'selected-icon': isCurrentStep(step) }">{{ step.icon }}</v-icon>
        </v-btn>
      </div>
      <v-btn
        class="step__label pre-line px-3"
        text
        :ripple="false"
        :disabled=step.disabled
        :class="[{'active__btn__text': isCurrentStep(step)}, 'inactive__btn__text']"
      >
        {{ step.text }}
      </v-btn>
    </div>
  </v-card>
</template>

<script lang="ts">
// Libraries
import { Component, Prop, Vue } from 'vue-property-decorator'
import { StepsIF } from '@/interfaces'

@Component({})
export default class Stepper extends Vue {
  /** The required steps. */
  @Prop({ required: true }) readonly getSteps!: Array<StepsIF>

  goTo (step) {
    this.$router.push(step.to).catch(() => {})
  }

  isCurrentStep (step): boolean {
    return this.$route.fullPath === step.to
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

#step-buttons-container {
  display: flex;
  justify-content: space-evenly;
  margin: 0;
  padding: 0;
  background-color: $BCgovInputBG;
}

.v-btn:before {
  background-color: $BCgovInputBG !important;
}

.step {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 0;
  border-bottom: 3px solid transparent;
}

.active-step {
  border-bottom: 3px solid $app-blue;
  border-bottom-left-radius: initial !important;
  border-bottom-right-radius: initial !important;
}

.step:hover {
  cursor: pointer;

  .step__btn {
    background: linear-gradient(rgba(25,118,210, 1), rgba(25,118,210, 1)),
    linear-gradient(rgba(255, 255, 255, 1), rgba(255, 255, 255, 1)); // first bg is layered on top
    color: $BCgovInputBG;
  }

  .v-btn:before {
    background-color: $app-blue;
  }

  .step__icon {
    color: $BCgovInputBG;
    background-color: inherit;
  }
}

.selected-btn {
  background-color: $app-blue !important;
}

.selected-icon {
  color: $BCgovInputBG !important;
}

.step__indicator {
  position: relative;
  width: 100%;
  text-align: center;
}

.step__line {
  position: absolute;
  top: 50%;
  left: 0;
  height: 1px;
  width: 100%;
  background-color: $gray5;
  transform: translateX(-50%);
}

.step:first-child .step__line {
  display: none;
}

.step__btn {
  position: relative;
  background-color: $BCgovInputBG;
  z-index: 1; // on top of step line

  .step__icon {
    color: $app-blue;
    background-color: inherit;
  }
}

.step__btn2 {
  position: absolute;
  margin-top: -5px;
  margin-left: -16px;
  background-color: $BCgovInputBG;
  border-radius: 50%;
  z-index: 1; // on top of step line and step btn
}

.step__label {
  margin-top: 10px;
  text-align: center;
}

.active__btn__text {
  font-weight: bold;
  color: $gray9 !important;
}

.inactive__btn__text {
  color: $app-blue;
}

// Vuetify Overrides
:deep(.v-btn:not(.v-btn--round).v-size--default) {
  max-width: 64px;
}

:deep(.v-card > *:last-child:not(.v-btn):not(.v-chip)) {
  border-bottom: 3px solid red !important;
  border-bottom-left-radius: 2px !important;
}
</style>
