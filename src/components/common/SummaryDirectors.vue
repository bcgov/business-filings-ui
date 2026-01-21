<template>
  <div id="summary-directors">
    <v-card flat>
      <!-- Current Directors List -->
      <ul class="list director-list">
        <v-subheader class="director-header">
          <span>Names</span>
          <span>Delivery Address</span>
          <span v-if="isBaseCompany">Mailing Address</span>
          <span class="header-appointed">Appointed/Elected</span>
        </v-subheader>

        <li
          v-for="(director, index) in directorSummary"
          :id="'director-' + director.id"
          :key="index"
          class="director-list-item"
          :class="{ 'ceased' : isFutureCeased(director)}"
        >
          <div class="meta-container">
            <label>
              <span>{{ director.officer.firstName }} </span>
              <span>{{ director.officer.middleInitial }} </span>
              <span>{{ director.officer.lastName }}</span>
              <div class="director-status">
                <v-scale-transition>
                  <v-chip
                    v-show="isNew(director)"
                    x-small
                    label
                    color="blue"
                    text-color="white"
                  >
                    New
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip
                    v-show="isFutureCeased(director)"
                    x-small
                    label
                    text-color="rgba(0,0,0,.38)"
                  >
                    Ceased
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip
                    v-show="isNameChanged(director)"
                    x-small
                    label
                    color="blue"
                    text-color="white"
                  >
                    Name Changed
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip
                    v-show="isAddressChanged(director)"
                    x-small
                    label
                    color="blue"
                    text-color="white"
                  >
                    Address Changed
                  </v-chip>
                </v-scale-transition>
              </div>
            </label>

            <div class="meta-container__inner">
              <v-expand-transition>
                <div class="director-info">
                  <div class="address">
                    <BaseAddress
                      :address="director.deliveryAddress"
                      :isInactive="isFutureCeased(director)"
                    />
                  </div>

                  <div
                    v-if="isBaseCompany"
                    class="address same-address"
                  >
                    <span v-if="isSame(director.deliveryAddress, director.mailingAddress)">
                      Same as Delivery Address
                    </span>
                    <BaseAddress
                      v-else
                      :address="director.mailingAddress"
                      :isInactive="isFutureCeased(director)"
                    />
                  </div>

                  <div class="director_dates">
                    <div class="director_dates__date">
                      {{ director.appointmentDate }}
                    </div>
                    <template v-if="isFutureCeased(director)">
                      Ceased
                      <div class="director_dates__date">
                        {{ director.cessationDate }}
                      </div>
                    </template>
                  </div>
                </div>
              </v-expand-transition>
            </div>
          </div>
        </li>
      </ul>
    </v-card>

    <br>

    <!-- Ceased Directors List -->
    <v-btn
      v-if="directorsCeased.length > 0"
      text
      small
      class="cease-btn"
      @click="expand = !expand"
    >
      <v-icon>{{ dropdownIcon }}</v-icon>
      <span>Hide Ceased Directors</span>
    </v-btn>
    <v-card flat>
      <v-expand-transition>
        <ul
          v-show="expand"
          class="list director-list"
        >
          <li
            v-for="(director, index) in directorsCeased"
            :id="'director-' + director.id"
            :key="index"
            class="director-list-item"
            :class="{ 'ceased' : isCeased(director)}"
          >
            <div class="meta-container">
              <label>
                <span>{{ director.officer.firstName }} </span>
                <span>{{ director.officer.middleInitial }} </span>
                <span>{{ director.officer.lastName }}</span>
                <div class="director-status">
                  <v-scale-transition>
                    <v-chip
                      v-show="isNew(director)"
                      x-small
                      label
                      color="blue"
                      text-color="white"
                    >
                      New
                    </v-chip>
                  </v-scale-transition>
                  <v-scale-transition>
                    <v-chip
                      v-show="isCeased(director)"
                      x-small
                      label
                      text-color="rgba(0,0,0,.38)"
                    >
                      Ceased
                    </v-chip>
                  </v-scale-transition>
                  <v-scale-transition>
                    <v-chip
                      v-show="isNameChanged(director)"
                      x-small
                      label
                      color="blue"
                      text-color="white"
                    >
                      Name Changed
                    </v-chip>
                  </v-scale-transition>
                  <v-scale-transition>
                    <v-chip
                      v-show="isAddressChanged(director)"
                      x-small
                      label
                      color="blue"
                      text-color="white"
                    >
                      Address Changed
                    </v-chip>
                  </v-scale-transition>
                </div>
              </label>

              <div class="meta-container__inner">
                <v-expand-transition>
                  <div class="director-info">
                    <div class="address">
                      <BaseAddress
                        :address="director.deliveryAddress"
                        :isInactive="true"
                      />
                    </div>
                    <div
                      v-if="isBaseCompany"
                      class="address same-address"
                    >
                      <span v-if="isSame(director.deliveryAddress, director.mailingAddress)">
                        Same as Delivery Address
                      </span>
                      <BaseAddress
                        v-else
                        :address="director.mailingAddress"
                        :isInactive="true"
                      />
                    </div>
                    <div class="director_dates">
                      <div class="director_dates__date">
                        {{ director.appointmentDate }}
                      </div>
                      Ceased
                      <div class="director_dates__date">
                        {{ director.cessationDate }}
                      </div>
                    </div>
                  </div>
                </v-expand-transition>
              </div>
            </div>
          </li>
        </ul>
      </v-expand-transition>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Getter } from 'pinia-class'
import { BaseAddress } from '@bcrs-shared-components/base-address'
import { CommonMixin, DateMixin } from '@/mixins'
import { Actions } from '@/enums'
import { DirectorIF } from '@/interfaces'
import { useBusinessStore } from '@/stores/businessStore'

@Component({
  components: { BaseAddress }
})
export default class SummaryDirectors extends Mixins(CommonMixin, DateMixin) {
  // Directors array passed into this component.
  @Prop({ default: () => [] }) readonly directors!: Array<DirectorIF>

  @Getter(useBusinessStore) isBaseCompany!: boolean

  // Local properties
  directorSummary: Array<DirectorIF> = []
  directorsCeased: Array<DirectorIF> = []
  expand = true

  /**
    * Watcher to keep director lists up to date.
    * - "directorSummary" will contain current directors
    * - "directorsCeased" will contain ceased directors
    */
  @Watch('directors', { deep: true, immediate: true })
  onDirectorsChanged (): void {
    // NOTE: CEASED action only exists if director was ceased in this filing.
    // This means future-ceased directors will appear in current directors list.
    this.directorSummary = this.directors.filter(dir => !this.isCeased(dir))
    this.directorsCeased = this.directors.filter(dir => this.isCeased(dir))
  }

  /**
   * Getter to return the proper icon depending on dropdown state.
   * @returns The icon name.
   */
  get dropdownIcon (): string {
    return this.expand ? 'mdi-menu-up' : 'mdi-menu-down'
  }

  /**
   * Local helper to check whether a director was appointed in this filing.
   * @param director The director to check.
   * @returns True if director was appointed.
   */
  isNew (director: DirectorIF): boolean {
    return director.actions?.includes(Actions.APPOINTED) || false
  }

  /**
   * Local helper to check whether a director was ceased in this filing.
   * @param director The director to check.
   * @returns True if director was ceased.
   */
  isCeased (director: DirectorIF): boolean {
    return director.actions?.includes(Actions.CEASED) || false
  }

  /**
   * Local helper to check whether a director is future-ceased. In this case, they have
   * a cessation date but do not have the CEASED action (which is only assigned if they
   * were ceased in this filing).
   * @param director The director to check.
   * @returns True if director is future-ceased.
   */
  isFutureCeased (director: DirectorIF): boolean {
    return !!director.cessationDate
  }
  /**
   * Local helper to check whether a director had their address changed.
   * @param director The director to check.
   * @returns True if director had their address changed.
   */
  isAddressChanged (director: DirectorIF): boolean {
    return director.actions?.includes(Actions.ADDRESSCHANGED) || false
  }

  /**
   * Local helper to check whether a director had their name changed.
   * @param director The director to check.
   * @returns True if director had their name changed.
   */
  isNameChanged (director: DirectorIF): boolean {
    return director.actions?.includes(Actions.NAMECHANGED) || false
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.v-card {
  line-height: 1.2rem;
  font-size: $px-14;
}

.v-btn {
  margin: 0;
  text-transform: none;
}

ul {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.meta-container {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  > label:first-child {
    font-weight: 700;
  }

  &__inner {
    flex: 1 1 auto;
  }
}

@media (min-width: 768px) {
  .meta-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      width: 14rem;
    }
  }
}

// List Layout
.list {
  li {
    border-bottom: 1px solid $gray3;
  }
}

.form__row.three-column {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  margin-right: -0.5rem;
  margin-left: -0.5rem;

  .item {
    flex: 1 1 auto;
    flex-basis: 0;
    margin-right: 0.5rem;
    margin-left: 0.5rem;
  }
}

// Address Block Layout
.address {
  display: flex;
  width: 14rem;
}

.address__row {
  flex: 1 1 auto;
}

// Director Display
.director-info {
  display: flex;
  color: $gray7;

  .status {
    flex: 1 1 auto;
  }
}

// V-chip customization
.v-size--x-small {
  display: table;
  margin-top: 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
}

.ceased, .ceased .director-info {
  color: $gray5 !important;
}

.director_dates {
  font-size: px-13;
}

.director-header {
  width: 100%;
  padding: 1.25rem;
  display: inline-flex;
  height: 3rem;
  background-color: rgba(77, 112, 147, 0.15);

  span {
    width: 14rem;
    color: $app-almost-black;
    font-size: $px-14;
    font-weight: 600;
    line-height: 1.1875rem;
  }

  .header-appointed {
    width: 11.4rem;
  }
}

.director-list-item {
  padding: 1.25rem;
}

.cease-btn {
  color: $BCgovIconBlue;
}
</style>
