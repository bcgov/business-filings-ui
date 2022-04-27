<template>
  <div id="directors">

    <!-- delete new director - confirmation popup -->
    <v-dialog content-class="delete-confirm-dialog" v-model="showPopup" width="30rem" attach="#directors">
      <v-card>
        <v-card-text>
          Are you sure you want to remove
          <span v-if="activeDirectorToDelete" class="font-weight-bold">
            <span>{{activeDirectorToDelete.officer.firstName}} </span>
            <span>{{activeDirectorToDelete.officer.middleInitial}} </span>
            <span>{{activeDirectorToDelete.officer.lastName}}</span>
          </span>
          from your Directors list?
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="deleteDirector(activeDirectorToDelete.id)">Remove</v-btn>
          <v-btn color="default" @click="showPopup = false; activeDirectorToDelete = null">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-expand-transition>
      <div id="wrapper-add-director" v-if="componentEnabled" v-show="!showNewDirectorForm" >
        <v-container>
          <v-row class="msg-director-compliance">
            <v-col cols="3">
              <v-btn class="new-director-btn" outlined color="primary"
                :disabled="directorEditInProgress"
                @click="addNewDirector()"
              >
                <v-icon>mdi-plus</v-icon>
                <span>Appoint New Director</span>
              </v-btn>
            </v-col>
            <v-col cols="5">
              <warning-popover :dialogObj="complianceMsg" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-expand-transition>

    <v-card flat>
      <!-- New Director Form -->
      <v-expand-transition>
        <ul class="list new-director" v-show="showNewDirectorForm">
          <li class="new-director-container">
            <div class="meta-container">
              <label class="appoint-header">Appoint New Director</label>
              <div class="meta-container__inner">
                <v-form ref="newDirectorForm"
                  name="new-director-form"
                  v-model="directorFormValid"
                  v-on:submit.prevent="addNewDirector"
                  lazy-validation
                >
                  <div class="form__row three-column">
                    <v-text-field filled class="item"
                      label="First Name"
                      id="new-director__first-name"
                      v-model="newDirector.officer.firstName"
                      :rules="directorFirstNameRules"
                    />
                    <v-text-field filled class="item"
                      label="Initial"
                      id="new-director__middle-initial"
                      v-model="newDirector.officer.middleInitial"
                      :rules="directorMiddleInitialRules"
                    />
                    <v-text-field filled class="item"
                      label="Last Name"
                      id="new-director__last-name"
                      v-model="newDirector.officer.lastName"
                      :rules="directorLastNameRules"
                    />
                  </div>

                  <label class="address-sub-header">Delivery Address</label>
                  <div class="address-wrapper">
                    <base-address ref="baseAddressNew"
                      :editing="true"
                      :schema="addressSchema"
                      @update:address="updateDeliveryAddress"
                    />
                  </div>

                  <div class="form__row" v-if="isBComp">
                    <v-checkbox
                      class="inherit-checkbox"
                      label="Mailing Address same as Delivery Address"
                      v-model="inheritDeliveryAddress"
                    />
                    <div v-if="!inheritDeliveryAddress">
                      <label class="address-sub-header">Mailing Address</label>
                      <div class="address-wrapper">
                        <base-address ref="mailAddressNew"
                          :editing="true"
                          :schema="addressSchema"
                          @update:address="updateMailingAddress"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- removed until release 2 -->
                  <!--
                  <div class="form__row three-column new-director__dates">
                    <v-menu
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="18rem">
                      <template v-slot:activator="{ on }">
                        <v-text-field box class="item"
                          id="new-director__appointment-date"
                          v-model.trim="newDirector.appointmentDate"
                          label="Appointment / Election Date"
                          hint="YYYY/MM/DD"
                          append-icon="event"
                          v-on="on"
                          :rules="directorAppointmentDateRules"
                        />
                      </template>
                      <v-date-picker
                        id="new-director__appointment-date__datepicker"
                        v-model="newDirector.appointmentDate"
                        :min="earliestDateToSet"
                        :max="getCurrentDate"
                        no-title
                      />
                    </v-menu>

                    <v-menu
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="18rem">
                      <template v-slot:activator="{ on }">
                        <v-text-field box class="item"
                          id="new-director__cessation-date"
                          v-model.trim="newDirector.cessationDate"
                          label="Cessation Date"
                          hint="YYYY/MM/DD"
                          append-icon="event"
                          v-on="on"
                          :rules="directorCessationDateRules"
                        />
                      </template>
                      <v-date-picker
                        id="new-director__cessation-date__datepicker"
                        v-model="newDirector.cessationDate"
                        :min="earliestDateToSet"
                        :max="getCurrentDate"
                        no-title
                      />
                    </v-menu>
                  </div>
                  -->

                  <div class="form__row form__btns">
                    <!-- Remove button is disabled on this New Director form -->
                    <v-btn color="error" disabled>Remove</v-btn>
                    <v-btn class="form-primary-btn" @click="validateNewDirectorForm()" color="primary">Done</v-btn>
                    <v-btn class="form-cancel-btn" @click="cancelNewDirector()">Cancel</v-btn>
                  </div>
                </v-form>
              </div>
            </div>
          </li>
        </ul>
      </v-expand-transition>

      <!-- Current Director List -->
      <ul class="list director-list">
        <v-subheader v-if="allDirectors.length && !directorEditInProgress" class="director-header">
          <span>Names</span>
          <span>Delivery Address</span>
          <span v-if="isBComp">Mailing Address</span>
          <span>Appointed/Elected</span>
        </v-subheader>

        <!-- START FOR LOOP -->
        <li class="director-list-item"
          v-for="(dir, index) in allDirectors"
          :id="`director-${dir.id}`"
          :class="{ 'remove' : !isActive(dir) || !isActionable(dir)}"
          :key="index"
        >
          <div class="meta-container">
            <label>
              <span class="director-list__first-name">{{dir.officer.firstName}} </span>
              <span>{{dir.officer.middleInitial}} </span>
              <span>{{dir.officer.lastName}}</span>
              <div class="director-status">
                <v-scale-transition>
                  <v-chip x-small label color="blue" text-color="white"
                    v-show="isNew(dir) && !dir.cessationDate"
                  >
                    New
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip x-small label text-color="rgba(0,0,0,.38)"
                    v-show="!isActive(dir) || !isActionable(dir)"
                  >
                    Ceased
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip x-small label color="blue lighten-2" text-color="white"
                    v-show="isNew(dir) && dir.cessationDate"
                  >
                    Appointed and Ceased
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip x-small label color="blue" text-color="white"
                    v-if="isNameChanged(dir)"
                  >
                    Name Changed
                  </v-chip>
                </v-scale-transition>
                <v-scale-transition>
                  <v-chip x-small label color="blue" text-color="white"
                    v-if="isAddressChanged(dir)"
                  >
                    Address Changed
                  </v-chip>
                </v-scale-transition>
              </div>
            </label>

            <div class="meta-container__inner">
              <v-expand-transition>
                <div class="director-info" v-show="activeIndex !== index">
                  <div class="address">
                    <base-address :address="dir.deliveryAddress" />
                  </div>

                  <div class="address same-address" v-if="isBComp">
                    <span v-if="isSame(dir.deliveryAddress, dir.mailingAddress)">
                      Same as Delivery Address
                    </span>
                    <base-address v-else :address="dir.mailingAddress" />
                  </div>

                  <div class="director_dates">
                    <div class="director_dates__date">{{ dir.appointmentDate }}</div>
                    <div v-if="dir.cessationDate">Ceased</div>
                    <div class="director_dates__date">{{ dir.cessationDate }}</div>
                  </div>

                  <div class="actions" v-show="isActionable(dir)">
                    <!-- Edit menu -->
                    <span v-show="isNew(dir)">
                      <v-btn small text color="primary" :disabled="!componentEnabled || directorEditInProgress"
                        :id="`director-${dir.id}-change-btn`"
                        @click="editDirector(index)"
                      >
                        <v-icon small>mdi-pencil</v-icon>
                        <span>Edit</span>
                      </v-btn>

                      <!-- more actions menu -->
                      <!-- removed until release 2 -->
                      <!--
                      <v-menu offset-y>
                        <template v-slot:activator="{ on }">
                          <v-btn text small class="actions__more-actions__btn" v-on="on">
                            <v-icon>arrow_drop_down</v-icon>
                          </v-btn>
                        </template>
                        <v-list class="actions__more-actions">
                          <v-list-tile @click="showDeleteDirectorConfirmation(dir)">
                            <v-list-tile-title>Remove</v-list-tile-title>
                          </v-list-tile>
                        </v-list>
                      </v-menu>
                      -->
                    </span>

                    <!-- Cease menu -->
                    <span v-show="!isNew(dir) && componentEnabled">
                      <v-btn small text color="primary" class="cease-btn"
                        :disabled="!componentEnabled || directorEditInProgress"
                        :id="`director-${dir.id}-cease-btn`"
                        @click="ceaseDirector(dir, index)"
                      >
                        <v-icon small>{{isActive(dir) ? 'mdi-close':'mdi-undo'}}</v-icon>
                        <span>{{isActive(dir) ? 'Cease':'Undo'}}</span>
                      </v-btn>

                      <!-- more actions menu -->
                      <span v-show="isActive(dir)">
                        <v-menu offset-y :disabled="!componentEnabled || directorEditInProgress">
                          <template v-slot:activator="{ on }">
                            <v-btn text small class="actions__more-actions__btn" v-on="on">
                              <v-icon>mdi-menu-down</v-icon>
                            </v-btn>
                          </template>
                          <v-list class="actions__more-actions">
                            <!-- removed until release 2 -->
                            <!--
                            <v-list-tile @click="cessationDateTemp = asOfDate; activeIndexCustomCease = index;">
                              <v-list-tile-title>Set custom cessation date</v-list-tile-title>
                            </v-list-tile>
                            -->
                            <v-list-item @click="editDirectorAddress(index)">
                              <v-list-item-title>Change address</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="editDirectorName(index)">
                              <v-list-item-title>Change legal name</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </span>
                    </span>
                  </div>

                  <!-- standalone Cease date picker -->
                  <v-date-picker
                    class="standalone__cessation-date__datepicker"
                    v-model="cessationDateTemp"
                    v-show="activeIndexCustomCease === index"
                    no-title
                    :min="earliestStandaloneCeaseDateToSet(dir)"
                    :max="getCurrentDate"
                  >
                    <v-btn text color="primary" @click="activeIndexCustomCease = null">Cancel</v-btn>
                    <v-btn text color="primary" @click="ceaseDirector(dir, index)">OK</v-btn>
                  </v-date-picker>
                </div>
              </v-expand-transition>

              <!-- Edit director form -->
              <v-expand-transition>
                <!-- only render the form for the active director -->
                <v-form ref="editDirectorForm"
                  name="edit-director-form"
                  v-if="activeIndex === index"
                  v-model="directorFormValid"
                  lazy-validation
                >
                  <div class="form__row three-column" v-show="editFormShowHide.showName">
                    <v-text-field filled class="item edit-director__first-name"
                      label="First Name"
                      v-model="dir.officer.firstName"
                      :rules="directorFirstNameRules"
                    />
                    <v-text-field filled class="item edit-director__middle-initial"
                      label="Initial"
                      v-model="dir.officer.middleInitial"
                      :rules="directorMiddleInitialRules"
                    />
                    <v-text-field filled class="item edit-director__last-name"
                      label="Last Name"
                      v-model="dir.officer.lastName"
                      :rules="directorLastNameRules"
                    />
                  </div>

                  <!-- v-show doesn't support <template> so use a <div> instead -->
                  <div v-show="editFormShowHide.showAddress">
                    <label class="address-sub-header">Delivery Address</label>
                    <div class="address-wrapper">
                      <base-address ref="baseAddressEdit"
                        :address="dir.deliveryAddress"
                        :editing="true"
                        :schema="addressSchema"
                        @update:address="updateDeliveryAddress"
                        :key="activeIndex"
                      />
                    </div>

                    <div class="form__row" v-if="isBComp">
                      <v-checkbox
                        class="inherit-checkbox"
                        label="Mailing Address same as Delivery Address"
                        v-model="inheritDeliveryAddress"
                      />
                      <div v-if="!inheritDeliveryAddress">
                        <label class="address-sub-header">Mailing Address</label>
                        <div class="address-wrapper">
                          <base-address ref="mailAddressEdit"
                            :address="dir.mailingAddress"
                            :editing="true"
                            :schema="addressSchema"
                            @update:address="updateMailingAddress"
                            :key="activeIndex"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- REMOVED UNTIL FUTURE RELEASE -->
                  <!--
                  <div class="form__row three-column edit-director__dates" v-show="editFormShowHide.showDates">
                    <v-menu
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="18rem">
                      <template v-slot:activator="{ on }">
                        <v-text-field
                          class="item edit-director__appointment-date"
                          v-model.trim="dir.appointmentDate"
                          label="Apointment / Election Date"
                          hint="YYYY/MM/DD"
                          append-icon="event"
                          v-on="on"
                          :rules="directorAppointmentDateRules"
                          box
                        />
                      </template>
                      <v-date-picker
                        class="edit-director__appointment-date__datepicker"
                        v-model="dir.appointmentDate"
                        :min="earliestDateToSet"
                        :max="getCurrentDate"
                        no-title
                      />
                    </v-menu>

                    <v-menu
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      min-width="18rem">
                      <template v-slot:activator="{ on }">
                        <v-text-field class="item edit-director__cessation-date"
                          v-model.trim="dir.cessationDate"
                          label="Cessation Date"
                          hint="YYYY/MM/DD"
                          append-icon="event"
                          v-on="on"
                          :rules="directorCessationDateRules"
                          box
                        />
                      </template>
                      <v-date-picker
                        class="edit-director__cessation-date__datepicker"
                        v-model="dir.cessationDate"
                        :min="earliestDateToSet"
                        :max="getCurrentDate"
                        no-title
                      />
                    </v-menu>
                  </div>
                  -->

                  <div class="form__row form__btns">
                    <!-- v-show doesn't support <template> so use a <div> instead -->
                    <div v-show="isNew(dir)">
                      <v-btn color="error" outlined
                        class="remove-edit-btn"
                        @click="deleteDirector(dir.id)"
                      >
                        <span>Remove</span>
                      </v-btn>
                    </div>

                    <!-- v-show doesn't support <template> so use a <div> instead -->
                    <div v-show="!isNew(dir)">
                      <!-- FUTURE: implement this -->
                      <v-btn color="error" outlined
                        class="reset-address-btn"
                        v-show="editFormShowHide.showAddress"
                        :disabled="true"
                      >
                        <span>Reset</span>
                      </v-btn>

                      <v-btn color="error" outlined
                        class="reset-name-btn"
                        v-show="editFormShowHide.showName"
                        @click="restoreDirName(dir.id, true)"
                        :disabled="!isNameChanged(dir)"
                      >
                        <span>Reset</span>
                      </v-btn>
                    </div>

                    <v-btn color="primary"
                      class="form-primary-btn done-edit-btn"
                      @click="saveEditDirector(index, dir.id)"
                    >
                      <span>Done</span>
                    </v-btn>

                    <v-btn class="form-cancel-btn cancel-edit-btn"
                      @click="cancelEditDirector(dir.id)"
                    >
                      <span>Cancel</span>
                    </v-btn>
                  </div>
                </v-form>
              </v-expand-transition>
              <!-- END edit director form -->

            </div>
          </div>
          <v-alert
            close-text="Close Alert"
            dismissible
            icon="mdi-information-outline"
            class="white-background icon-blue"
            :id="`director-${dir.id}-alert`"
            v-if="complianceMsg && index === messageIndex"
            v-once
          >
            <div class="compliance-section">
              <h3>{{ complianceMsg.title }}</h3>
              <p>{{ complianceMsg.msg }}</p>
            </div>
          </v-alert>
        </li>
        <!-- END FOR LOOP -->
      </ul>
    </v-card>
  </div>
</template>

<script lang="ts">
// Libraries
import { Component, Emit, Mixins, Prop, Watch } from 'vue-property-decorator'
import axios from '@/axios-auth'
import { Getter, State } from 'vuex-class'
import { required, maxLength } from 'vuelidate/lib/validators'
import { cloneDeep, isEqual } from 'lodash'

// Components
import BaseAddress from 'sbc-common-components/src/components/BaseAddress.vue'
import { WarningPopover } from '@/components/dialogs'

// Mixins
import { CommonMixin, DateMixin, DirectorMixin, ResourceLookupMixin } from '@/mixins'

// Enums
import { Actions } from '@/enums'

// Interfaces
import { FormIF, AddressIF, DirectorIF, EmptyDirector, ComponentIF, AlertMessageIF } from '@/interfaces'

@Component({
  components: {
    BaseAddress,
    WarningPopover
  }
})
export default class Directors extends Mixins(
  CommonMixin, DateMixin, DirectorMixin, ResourceLookupMixin
) {
  // To fix "property X does not exist on type Y" errors, annotate types for referenced components.
  // ref: https://github.com/vuejs/vetur/issues/1414
  // ref: https://github.com/vuejs/vue-class-component/issues/94
  $refs!: Vue['$refs'] & {
    // form and components to appoint a new director:
    newDirectorForm: FormIF,
    baseAddressNew: ComponentIF,
    mailAddressNew: ComponentIF,
    // form and components to edit an existing director:
    // (there is only 1 at a time but it's still an array)
    editDirectorForm: FormIF[],
    baseAddressEdit: ComponentIF[],
    mailAddressEdit: ComponentIF[]
  }

  /** Indicates whether this component should be enabled or not. */
  @Prop({ default: true })
  readonly componentEnabled: boolean

  /**
   * Directors list from parent page, used to set our working directors list (allDirectors).
   * As needed, we emit this back to parent (ie, update/sync).
   */
  @Prop({ default: () => [] })
  readonly directors: DirectorIF[]

  @Getter getIdentifier!: string
  @Getter getCurrentDate!: string
  @State lastAnnualReportDate!: string
  @State entityFoundingDate!: Date
  @State lastDirectorChangeDate!: string

  /** Effective date for fetching and appointing/ceasing directors. */
  private asOfDate: string

  /** Original directors from Legal API. */
  private original: DirectorIF[] = []

  /** Working directors data (also used as v-model for the HTML list). */
  private allDirectors: DirectorIF[] = []

  private directorEditInProgress = false
  private directorPreEdit = null // officer before edit
  private showNewDirectorForm = false
  private showPopup = false
  private activeIndex = -1
  private activeIndexCustomCease = -1
  private activeDirectorToDelete: DirectorIF = null
  private cessationDateTemp: string = null
  private isEditingDirector = false
  private messageIndex = -1

  /** V-model for new director form. */
  private newDirector = cloneDeep(EmptyDirector)

  private inProgressDelivAddress: AddressIF = null
  private inProgressMailAddress: AddressIF = null
  private editFormShowHide = {
    showAddress: true,
    showName: true,
    showDates: true
  }
  private directorFormValid = true // used for New and Edit forms

  /**
   * State of the form checkbox for determining whether or not the mailing address
   * is the same as the delivery address.
   */
  private inheritDeliveryAddress: boolean = false

  /**
   * The Address schema containing Vuelidate rules.
   * NB: This should match the subject JSON schema.
   */
  private addressSchema = {
    streetAddress: {
      required,
      maxLength: maxLength(50)
    },
    streetAddressAdditional: {
      maxLength: maxLength(50)
    },
    addressCity: {
      required,
      maxLength: maxLength(40)
    },
    addressCountry: {
      required
    },
    addressRegion: {
      maxLength: maxLength(2)
    },
    postalCode: {
      required,
      maxLength: maxLength(15)
    },
    deliveryInstructions: {
      maxLength: maxLength(80)
    }
  }

  /** The relevant alert if a director change causes the business to be out of compliance. */
  private get complianceMsg (): AlertMessageIF {
    return this.directorWarning(this.allDirectors)
  }

  /**
   * The array of validations rules for a director's first name.
   * NB: Do not validate inter word spacing because the Legal db needs to support
   *     such records in order to correctly update COLIN.
   */
  private readonly directorFirstNameRules: Function[] = [
    v => !!v || 'A first name is required',
    v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
    v => !/\s$/g.test(v) || 'Invalid spaces' // trailing spaces
  ]

  /**
   * The array of validations rules for a director's middle initial.
   * NB: Do not validate inter word spacing because the Legal db needs to support
   *     such records in order to correctly update COLIN.
   */
  private readonly directorMiddleInitialRules: Function[] = [
    v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
    v => !/\s$/g.test(v) || 'Invalid spaces' // trailing spaces
  ]

  /**
   * The array of validations rules for a director's last name.
   * NB: Do not validate inter word spacing because the Legal db needs to support
   *     such records in order to correctly update COLIN.
   */
  private readonly directorLastNameRules: Function[] = [
    v => !!v || 'A last name is required',
    v => !/^\s/g.test(v) || 'Invalid spaces', // leading spaces
    v => !/\s$/g.test(v) || 'Invalid spaces' // trailing spaces
  ]

  /** Returns true if at least one director has a paid change. */
  private isDirectorsPaidChange (): boolean {
    return this.allDirectors.some(dir => dir.isFeeApplied)
  }

  /** Returns true if least one director has a free change. */
  private isDirectorsFreeChange (): boolean {
    return this.allDirectors.some(dir => this.isNameChanged(dir) || this.isAddressChanged(dir))
  }

  /** The array of validation rules for director appointment date. */
  private get directorAppointmentDateRules (): Function[] {
    const rules: Function[] = []
    let cessationDate: string = null

    rules.push(v => !!v || 'Appointment Date is required')

    // set cessation date for comparison based on which form we're in
    if (this.activeIndex >= 0) {
      cessationDate = document
        .getElementsByClassName('edit-director__cessation-date')[this.activeIndex]
        .getElementsByTagName('input')[0].value
    } else if (this.showNewDirectorForm) {
      cessationDate = this.newDirector.cessationDate
    }

    // appointment date must be before cessation date
    rules.push(v => this.compareYyyyMmDd(v, cessationDate, '<') || 'Appointment Date must be before Cessation Date')

    // appointment date must be in the past (or today)
    rules.push(v => this.dateIsNotFuture(v) || 'Appointment Date cannot be in the future')

    return rules
  }

  /** The array of validation rules for director cessation date. */
  private get directorCessationDateRules (): Function[] {
    const rules: Function[] = []
    let appointmentDate: string = null

    // set appointment date for comparison based on which form we're in
    if (this.activeIndex >= 0) {
      appointmentDate = document
        .getElementsByClassName('edit-director__appointment-date')[this.activeIndex]
        .getElementsByTagName('input')[0].value
    } else if (this.showNewDirectorForm) {
      appointmentDate = this.newDirector.appointmentDate
    }

    // cessation date must be after appointment date
    rules.push(v => this.compareYyyyMmDd(v, appointmentDate, '>') || 'Cessation Date must be after Appointment Date')

    // cessation date must be in the past (or today)
    rules.push(v => this.dateIsNotFuture(v) || 'Cessation Date cannot be in the future')

    return rules
  }

  /**
   * The latest of the following dates:
   * - the last COD filing in filing history
   * - the last AR filing in filing history
   * If the entity has no filing history then the founding date will be used.
   */
  private get earliestDateToSet (): string {
    let date: string = null

    if (this.lastDirectorChangeDate || this.lastAnnualReportDate) {
      date = this.latestYyyyMmDd(this.lastDirectorChangeDate, this.lastAnnualReportDate)
    } else {
      date = this.dateToYyyyMmDd(this.entityFoundingDate)
    }

    // when earliest date is calculated, inform parent component
    this.emitEarliestDateToSet(date)
    return date
  }

  /**
   * Local helper to provide a complete address object including missing/blank fields.
   * @returns a complete address object
   */
  private formatAddress (address: any): AddressIF {
    return {
      addressCity: address.addressCity || '',
      addressCountry: address.addressCountry || '',
      addressRegion: address.addressRegion || '',
      deliveryInstructions: address.deliveryInstructions || '',
      postalCode: address.postalCode || '',
      streetAddress: address.streetAddress || '',
      streetAddressAdditional: address.streetAddressAdditional || ''
    }
  }

  /**
   * Fetches the list of directors on As Of Date from the Legal API.
   * See also LegalApiMixin.fetchParties().
   */
  // FUTURE: this API call should be in the parent component or some mixin/service
  private async fetchDirectors (): Promise<void> {
    if (this.getIdentifier && this.asOfDate) {
      const url = `businesses/${this.getIdentifier}/directors?date=${this.asOfDate}`
      await axios.get(url).then(response => {
        if (response?.data?.directors) {
          const directors = response.data.directors as DirectorIF[]

          this.original = directors.sort(this.fieldSorter(['lastName', 'firstName', 'middleName']))

          this.original.forEach((director, i) => {
            director.id = i + 1
            director.isFeeApplied = (director.isFeeApplied !== undefined) ? director.isFeeApplied : false
            director.isDirectorActionable = !director.cessationDate
            director.actions = []

            // if there is no officer middle initial field, add it with blank data
            if (!director.officer.hasOwnProperty('middleInitial')) director.officer.middleInitial = ''

            // save previous officer name data for COLIN to use when updating record
            director.officer.prevFirstName = director.officer.firstName
            director.officer.prevLastName = director.officer.lastName
            director.officer.prevMiddleInitial = director.officer.middleInitial

            // save complete address data including missing/blank fields
            director.deliveryAddress = this.formatAddress(director.deliveryAddress)
            if (director.mailingAddress) {
              director.mailingAddress = this.formatAddress(director.mailingAddress)
            }
          })
        } else {
          throw new Error('Invalid directors list')
        }
      }).catch(error => {
        // eslint-disable-next-line no-console
        console.log('fetchDirectors() error =', error)
        // re-throw error
        throw error
      })
    }
  }

  /** Called externally to _asynchronously_ get the original directors on As Of Date. */
  // FUTURE: this logic should be in the parent component
  public async getOrigDirectors (asOfDate: string, updateWorkingDirectors: boolean): Promise<void> {
    this.asOfDate = asOfDate

    try {
      // fetch original directors
      await this.fetchDirectors()
      this.emitOriginalDirectors()

      if (updateWorkingDirectors) {
        // fill working directors from original and sync them with parent
        // NB: must deep copy here to avoid object reference issues
        this.allDirectors = cloneDeep(this.original)
        this.emitWorkingDirectors()
      }
    } catch {
      // emit event to parent to display Fetch Error Dialog
      this.$root.$emit('fetch-error-event')
    }
  }

  /**
   * Called when Directors prop changes - this is how we get our working directors, eg:
   * - after we emit our working directors (ie, sync)
   * - when a draft filing is loaded
   **/
  @Watch('directors', { deep: true })
  private onDirectorsChanged (): void {
    // fill working addresses from parent
    // NB: object assignment is OK here
    this.allDirectors = this.directors
  }

  /** Local helper to add a new director. */
  private addNewDirector (): void {
    this.showNewDirectorForm = true
    this.activeIndex = null
    this.directorEditInProgress = true
  }

  /** Local helper to cancel adding a new director. */
  private cancelNewDirector (): void {
    this.showNewDirectorForm = false
    this.$refs.newDirectorForm.reset()
    this.$refs.baseAddressNew.$refs.addressForm.reset()
    if (this.$refs.mailAddressNew) {
      this.$refs.mailAddressNew.$refs.addressForm.reset()
    }

    // set form to initial director data again
    this.newDirector = cloneDeep(EmptyDirector)
    this.newDirector.appointmentDate = this.asOfDate
    this.directorEditInProgress = false
  }

  // REMOVED UNTIL FUTURE RELEASE
  // /**
  //  * Local helper to show the Delete Director confirmation popup.
  //  * @param director The director object to delete.
  //  */
  // private showDeleteDirectorConfirmation (director): void {
  //   this.showPopup = true
  //   this.activeDirectorToDelete = director
  // }

  /**
   * Local helper to delete a director.
   * @param id The id of the director to delete
   */
  private deleteDirector (id: number): void {
    const newList = this.directors.filter(dir => dir.id !== id)
    this.allDirectors = newList

    this.activeIndex = null
    this.showPopup = false
    this.activeDirectorToDelete = null
    this.directorEditInProgress = false
  }

  /** Local helper to validate the new director form. */
  private validateNewDirectorForm (): void {
    var mainFormIsValid = this.$refs.newDirectorForm.validate()
    var addressFormIsValid = this.$refs.baseAddressNew.$refs.addressForm.validate()
    if (this.$refs.mailAddressNew) {
      var mailAddressFormIsValid = this.$refs.mailAddressNew.$refs.addressForm.validate()
      if (mainFormIsValid && addressFormIsValid && mailAddressFormIsValid) {
        this.pushNewDirectorData()
        this.cancelNewDirector()
      }
    } else {
      if (mainFormIsValid && addressFormIsValid) {
        this.pushNewDirectorData()
        this.cancelNewDirector()
      }
    }
    // else do nothing - validator handles validation messaging
  }

  /** Local helper push the current (new) director data into the list. */
  private pushNewDirectorData (): void {
    if (this.inheritDeliveryAddress) {
      this.inProgressMailAddress = { ...this.inProgressDelivAddress }
    }

    const director: DirectorIF = {
      actions: [Actions.APPOINTED],
      id: this.allDirectors.length + 1,
      isDirectorActionable: true,
      isFeeApplied: true,
      officer: {
        firstName: this.newDirector.officer.firstName,
        middleInitial: this.newDirector.officer.middleInitial,
        lastName: this.newDirector.officer.lastName,
        prevFirstName: this.newDirector.officer.firstName,
        prevMiddleInitial: this.newDirector.officer.middleInitial,
        prevLastName: this.newDirector.officer.lastName
      },
      deliveryAddress: { ...this.inProgressDelivAddress },
      appointmentDate: this.asOfDate, // when implemented: this.newDirector.appointmentDate,
      cessationDate: null // when implemented: this.newDirector.cessationDate
    }

    // Add the mailing address property if the entity is a BCOMP
    if (this.isBComp) {
      director.mailingAddress = { ...this.inProgressMailAddress }
    }

    // if there is also a cease date on this new director, add the ceased action
    if (this.newDirector.cessationDate !== null && this.newDirector.cessationDate !== undefined) {
      this.addAction(director, Actions.CEASED)
    }
    this.allDirectors.unshift(director)
  }

  /**
   * Local helper to cease a director.
   * @param director The director object to cease.
   */
  private ceaseDirector (director: DirectorIF, index: number): void {
    // if this is a Cease, apply a fee
    // otherwise it's just undoing a cease or undoing a new director, so remove fee
    this.messageIndex = index
    director.isFeeApplied = this.isActive(director)

    // reverse "ceased" action
    this.toggleAction(director, Actions.CEASED)

    // either set or undo cessation date
    if (!director.cessationDate) {
      director.cessationDate = this.cessationDateTemp || this.asOfDate
    } else {
      director.cessationDate = null
    }

    // close standalone cessation date picker and reset date
    this.cessationDateTemp = null
    this.activeIndexCustomCease = null
  }

  /**
   * Local helper to edit a director.
   * @param index The index of the director to edit.
   */
  private editDirector (index: number): void {
    // clear in-progress director data from form in BaseAddress component - ie: start fresh
    this.inProgressDelivAddress = null
    this.inProgressMailAddress = null
    this.directorEditInProgress = true
    this.activeIndex = index
    this.messageIndex = index
    this.cancelNewDirector()
  }

  /**
   * Local helper to edit a director's dates.
   * @param index The index of the director to edit.
   */
  private editDirectorDates (index: number): void {
    this.editFormShowHide = {
      showAddress: false,
      showName: false,
      showDates: true
    }

    this.editDirector(index)
  }

  /**
   * Local helper to edit a director's name.
   * @param index The index of the director to edit.
   */
  private editDirectorName (index: number): void {
    this.directorPreEdit = { ...this.allDirectors[index].officer }
    this.editFormShowHide = {
      showAddress: false,
      showName: true,
      showDates: false
    }

    this.editDirector(index)
  }

  /**
   * Local helper to edit a director's address.
   * @param index The index of the director to edit.
   */
  private editDirectorAddress (index: number): void {
    this.directorPreEdit = null
    this.editFormShowHide = {
      showAddress: true,
      showName: false,
      showDates: false
    }

    this.editDirector(index)
  }

  /**
   * Local helper to save into the list a director that was edited.
   * @param index The index of the director to save.
   * @param id The id of the director to save.
   */
  private saveEditDirector (index: number, id: number): void {
    // get current director (object reference)
    const director = this.allDirectors[index]

    let mainFormIsValid = this.$refs.editDirectorForm[0].validate()
    let addressFormIsValid = this.$refs.baseAddressEdit[0].$refs.addressForm.validate() as boolean

    if (this.$refs.mailAddressEdit && this.$refs.mailAddressEdit[0]) {
      let mailAddressFormIsValid = this.$refs.mailAddressEdit[0].$refs.addressForm.validate()
      if (!mailAddressFormIsValid) {
        addressFormIsValid = mailAddressFormIsValid
      }
    }

    if (mainFormIsValid && addressFormIsValid) {
      // save data from BaseAddress component
      // - only save address if a change was made, ie there is an in-progress address from the component
      if (!Object.values(this.inProgressDelivAddress).every(el => el === undefined)) {
        director.deliveryAddress = this.inProgressDelivAddress
      }

      if (this.isBComp) {
        if (!Object.values(this.inProgressMailAddress).every(el => el === undefined)) {
          director.mailingAddress = this.inProgressMailAddress
        }

        if (this.inheritDeliveryAddress) {
          director.mailingAddress = director.deliveryAddress
        }
      }

      /* COMPARE changes to original director data, for existing directors */
      if (director.actions.indexOf(Actions.APPOINTED) < 0) {
        const origDirector = this.original.find(director => director.id === id)

        // safety check
        if (!origDirector) {
          // eslint-disable-next-line no-console
          console.log('saveEditDirector() could not find original director with id =', id)
        } else {
          // check whether either address has changed
          if (!isEqual(origDirector.deliveryAddress, director.deliveryAddress) ||
            !isEqual(origDirector.mailingAddress, director.mailingAddress)) {
            this.addAction(director, Actions.ADDRESSCHANGED)
          } else {
            this.removeAction(director, Actions.ADDRESSCHANGED)
          }

          // check whether name has changed
          if (!isEqual(origDirector.officer, director.officer)) {
            this.addAction(director, Actions.NAMECHANGED)
          } else {
            this.removeAction(director, Actions.NAMECHANGED)
          }
        }
      }

      this.cancelEditDirector()
    } else {
      // do nothing - validator handles error messages
    }
  }

  /**
   * Local helper to cancel a director that was edited.
   * @param id Id of the director being edited.
   */
  private cancelEditDirector (id: number = null): void {
    if (id) this.restoreDirName(id, false)
    this.activeIndex = -1
    this.directorEditInProgress = false

    // reset form show/hide flags
    this.editFormShowHide = {
      showAddress: true,
      showName: true,
      showDates: true
    }
  }

  /**
   * Restores the director's name after resetting or cancelling a name change.
   * @param id ID of the director currently being edited.
   * @param isRestore Boolean indicating a hard or soft name reset.
   */
  private restoreDirName (id: number, isRestore: boolean): void {
    const index = this.allDirectors.findIndex(director => director.id === id)
    const director = this.allDirectors[index]

    if (isRestore && id >= 0) {
      this.removeAction(director, Actions.NAMECHANGED)

      if (director.officer.prevFirstName && director.officer.prevLastName) {
        director.officer.firstName = director.officer.prevFirstName
        director.officer.middleInitial = director.officer.prevMiddleInitial
        director.officer.lastName = director.officer.prevLastName
      }
      this.cancelEditDirector()
    } else {
      if (this.directorPreEdit && !this.isNew(director)) {
        director.officer = { ...this.directorPreEdit }
        this.directorPreEdit = null
      }
    }
  }

  /**
   * Called when BaseAddress component has an updated delivery address.
   * To be used when we want to save the data.
   * @param val The new value.
   */
  private updateDeliveryAddress (val: AddressIF): void {
    this.inProgressDelivAddress = val
  }

  /**
   * called when BaseAddress component has an updated mailing address.
   * To be used when we want to save the data.
   * @param val The new value.
   */
  private updateMailingAddress (val: AddressIF): void {
    this.inProgressMailAddress = val
  }

  /**
   * Local helper to check whether a date is not in the future.
   * @param thedate The date to check.
   * @returns Whether the date is not in the future.
   */
  private dateIsNotFuture (thedate: string): boolean {
    return this.compareYyyyMmDd(thedate, this.getCurrentDate, '<=')
  }

  /**
   * Local helper to get the earliest standalone cease data for the specified director.
   * @param director The director to check.
   * @returns The date.
   */
  private earliestStandaloneCeaseDateToSet (director: DirectorIF): string {
    if (this.compareYyyyMmDd(director.appointmentDate, this.earliestDateToSet, '>')) {
      return director.appointmentDate
    } else {
      return this.earliestDateToSet
    }
  }

  /**
   * Local helper to add or remove an action from a director's actions list.
   * @param director The director to change.
   * @param val The action value to add or remove.
   */
  private toggleAction (director: DirectorIF, val: Actions): void {
    // if director has specified action (eg, CEASED) then remove it, otherwise add it
    const index = director.actions.indexOf(val)
    if (index >= 0) director.actions.splice(index)
    else director.actions.push(val)
  }

  /**
   * Adds an action value to a director's actions list, if it doesn't already exist.
   * @param director The director to change.
   * @param val The action value to add.
   */
  private addAction (director: DirectorIF, val: Actions): void {
    if (director.actions.indexOf(val) < 0) director.actions.push(val)
  }

  /**
   * Removes an action value from a director's actions list, if it already exists.
   * @param director The director to change.
   * @param val The action value to remove.
   */
  private removeAction (director: DirectorIF, val: Actions): void {
    director.actions = director.actions.filter(action => action !== val)
  }

  /**
   * Local helper to check if a director was added in this filing.
   * @param director The director to check.
   * @returns Whether the director was appointed.
   */
  private isNew (director: DirectorIF): boolean {
    // helper function - was the director added in this filing?
    return (director.actions.indexOf(Actions.APPOINTED) >= 0)
  }

  /**
   * Local helper to check if a director has the name changed.
   * @param director The director to check.
   * @returns Whether the director has had the name changed.
   */
  private isNameChanged (director: DirectorIF): boolean {
    return (director.actions.indexOf(Actions.NAMECHANGED) >= 0)
  }

  /**
   * Local helper to check if a director has the address changed.
   * @param director The director to check.
   * @returns Whether the director has had the address changed.
   */
  private isAddressChanged (director: DirectorIF): boolean {
    return (director.actions.indexOf(Actions.ADDRESSCHANGED) >= 0)
  }

  /**
   * Local helper to check if a director is active in this filing.
   * @param director The director to check.
   * @returns Whether the director is active (ie, not ceased).
   */
  private isActive (director: DirectorIF): boolean {
    // helper function - is the director active, ie: not ceased?
    return (director.actions.indexOf(Actions.CEASED) < 0)
  }

  /**
   * Local helper to check if a director is actionable.
   * @param director The director to check.
   * @returns Whether the director is actionable.
   */
  private isActionable (director: DirectorIF): boolean {
    return (director.isDirectorActionable !== undefined) ? director.isDirectorActionable : true
  }

  /** Called when a director form's validity changes. */
  @Watch('directorFormValid')
  private onDirectorFormValidChanged (): void {
    // emit event back up to parent
    this.emitDirectorFormValid()
  }

  /** Called when the directors list changes for any reason. */
  @Watch('allDirectors', { deep: true })
  private onAllDirectorsChanged (): void {
    // emit events back up to parent
    this.emitWorkingDirectors()
    this.emitDirectorsPaidChange()
    this.emitDirectorsFreeChange()
  }

  @Watch('directorEditInProgress')
  private onDirectorEditActionChanged (): void {
    // emit event back up to parent
    this.emitDirectorEditInProgress()
  }

  @Watch('complianceMsg')
  private onComplianceMsgChanged (): void {
    // emit event back up to parent
    this.emitcomplianceDialogMsg()
  }

  /** Emits an event containing the earliest director change date. */
  @Emit('earliestDateToSet')
  private emitEarliestDateToSet (val: string): void { }

  /** Emits an event containing this component's paid change state. */
  @Emit('directorsPaidChange')
  private emitDirectorsPaidChange (): boolean {
    return this.isDirectorsPaidChange()
  }

  /** Emits an event containing this component's free change state. */
  @Emit('directorsFreeChange')
  private emitDirectorsFreeChange (): boolean {
    return this.isDirectorsFreeChange()
  }

  /** Emits an event containing the director form's validity. */
  @Emit('directorFormValid')
  private emitDirectorFormValid (): boolean {
    return this.directorFormValid
  }

  /** Emits an event that indicates whether a director edit is in progress. */
  @Emit('directorEditAction')
  private emitDirectorEditInProgress (): boolean {
    return this.directorEditInProgress
  }

  /** Emits an event that indicates a director compliance warning has been triggered. */
  @Emit('complianceDialogMsg')
  private emitcomplianceDialogMsg (): AlertMessageIF {
    return this.complianceMsg
  }

  /** Emits original addresses object to the parent page. */
  @Emit('original')
  private emitOriginalDirectors (): DirectorIF[] {
    return this.original
  }

  /** Emits updated addresses object to the parent page (ie, sync). */
  @Emit('update:directors')
  private emitWorkingDirectors (): DirectorIF[] {
    return this.allDirectors
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/styles/theme.scss";

.msg-director-compliance {
  display:flex;
  align-items: center;
  margin-bottom:1.5rem !important;

  .col-3 {
    min-width:176px;
  }
}
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

  .actions {
    position: absolute;
    top: 0;
    right: 0;

    .v-btn {
      min-width: 4rem;
    }

    .v-btn + .v-btn {
      margin-left: 0.5rem;
    }
  }
}

.appoint-header {
  font-size: $px-16;
  font-weight: bold;
  line-height: 1.5rem;
}

.address-sub-header {
  padding-bottom: 1.5rem;
  font-size: $px-16;
  font-weight: 700;
  line-height: 1.5rem;
}

.address-wrapper {
  margin-top: 1.5rem;
}

@media (min-width: 768px) {
  .meta-container {
    flex-flow: row nowrap;

    > label:first-child {
      flex: 0 0 auto;
      margin-right: 1rem;
      width: 12rem;
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
  width: 12rem;
  padding-left: .5rem;
  margin-right: 1.35rem;
}

.same-address {
  width: 11.65rem;
}

.address__row {
  flex: 1 1 auto;
}

// Director Display
.director-info {
  display: flex;
  color: $gray6;

  .status {
    flex: 1 1 auto;
  }

  .actions {
    flex: 0 0 auto;
  }
}

#new-director__middle-initial,
.edit-director__middle-initial {
  max-width: 6rem;
}

.new-director-btn {
  min-width: 176px !important;
  .v-icon {
    margin-left: -0.5rem;
  }
}

// V-chip customization
.v-size--x-small {
  display: table;
  margin-top: 0.5rem;
  text-transform: uppercase;
  font-weight: 700;
}

.remove, .remove .director-info {
  color: $gray5 !important;
}

.new-director {
  .new-director-container {
    padding: 1.25rem;

    .meta-container {
      > label:first-child {
        margin-bottom: 1.5rem;
      }
    }
  }
}

.director_dates {
  font-size: $px-13;
  padding-left: 0.75rem;
}

.actions .v-btn.actions__more-actions__btn {
  min-width: 25px;
  border-left: 1px solid $gray3;
  border-radius: 0;
  margin-left: 1px !important;
  padding: 0 5px;
  color: $gray6;
}

.actions__more-actions {
  padding: 0;

  .v-list-item {
    min-width: 160px;
  }

  .v-list-item__title {
    font-size: $px-14;
  }
}

.standalone__cessation-date__datepicker {
  margin-top: 25px;
  right: 0;
  position: absolute;
  z-index: 99;
}

.director-header {
  width: 100%;
  padding: 1.25rem;
  display: inline-flex;
  height: 3rem;
  background-color: rgba(77, 112, 147, 0.15);

  span {
    width: 13.5rem;
    color: $app-almost-black;
    font-size: $px-14;
    font-weight: 600;
    line-height: 1.1875rem;
  }
}

.director-list-item {
  padding: 1.25rem;
}

.compliance-section {
  font-size: $px-15;
  color: rgba(0,0,0,0.87);
}

::v-deep .v-alert.icon-blue {
  .v-icon {
    color: $BCgovIconBlue !important;
  }
}

.mdi-information-outline::before {
  color: $BCgovIconBlue !important;
}

</style>
