<template>
  <ul class="contact-info pl-0">
    <li
      v-if="!hidePhoneTollFree"
      class="contact-container"
    >
      <v-icon
        class="contact-icon"
        size="18px"
      >
        mdi-phone
      </v-icon>
      <span class="px-2 font-weight-bold">Canada and U.S. Toll Free:</span>
      <a
        href="tel:+1-877-526-1526"
        class="contact-value"
      >1-877-526-1526</a>
    </li>
    <li
      v-if="!hidePhoneVictoria"
      class="contact-container"
    >
      <v-icon
        class="contact-icon"
        size="18px"
      >
        mdi-phone
      </v-icon>
      <span class="px-2 font-weight-bold">Victoria Office:</span>
      <a
        href="tel:+1-250-387-7848"
        class="contact-value"
      >250-387-7848</a>
    </li>
    <li
      v-if="!hideEmail"
      class="contact-container"
    >
      <v-icon
        class="contact-icon"
        size="18px"
      >
        mdi-email
      </v-icon>
      <span class="px-2 font-weight-bold">Email:</span>
      <a
        href="mailto:BCRegistries@gov.bc.ca"
        class="contact-value"
      >BCRegistries@gov.bc.ca</a>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class ContactInfo extends Vue {
  /** Whether to hide the toll free phone number. */
  @Prop({ default: false }) readonly hidePhoneTollFree!: boolean

  /** Whether to hide the Victoria phone number. */
  @Prop({ default: false }) readonly hidePhoneVictoria!: boolean

  /** Whether to hide the email address. */
  @Prop({ default: false }) readonly hideEmail!: boolean
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.contact-container {
  font-size: $px-15;
  color: $gray7;
  display: flex;

  .contact-icon {
    flex: 0 0 1.375rem;
    justify-content: flex-start;
    color: $app-dk-blue;
  }

  .contact-value {
    flex: 1 1;
  }
}
</style>
