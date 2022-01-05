<template>
  <ul class="contact-info pl-0">
    <li class="contact-container">
      <v-icon class="contact-icon" size="18px">mdi-phone</v-icon>
      <span class="px-2">Canada and U.S. Toll Free:</span>
      <a href="tel:+1-877-526-1526" class="contact-value">1-877-526-1526</a>
    </li>
    <li class="contact-container">
      <v-icon class="contact-icon" size="18px">mdi-phone</v-icon>
      <span class="px-2">Victoria Office:</span>
      <a href="tel:+1-250-952-0568" class="contact-value">250-952-0568</a>
    </li>
    <li class="contact-container">
      <v-icon class="contact-icon" size="18px">mdi-email</v-icon>
      <span class="px-2">Email:</span>
      <a href="mailto:BCRegistries@gov.bc.ca" class="contact-value">BCRegistries@gov.bc.ca</a>
    </li>
  </ul>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ContactInfo extends Vue { }
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
