import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { ApiDateTimeUtc, IsoDatePacific } from '@bcrs-shared-components/interfaces'
import DateUtilities from '@/services/date-utilities'

/** Mixin that provides some useful date utilities. */
@Component({})
export default class DateMixin extends Vue {
  @Getter getCurrentJsDate!: Date

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Fetches and returns the web server's current date (in UTC).
   * Used to bypass the user's local clock/timezone.
   * Ref: https://www.npmjs.com/package/serverdate
   * @returns a promise to return a Date object
   */
  async getServerDate (): Promise<Date> {
    return DateUtilities.getServerDate()
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Creates and returns a new Date object in UTC, given parameters in Pacific timezone.
   * (This works regardless of user's local clock/timezone.)
   * @example "2021, 0, 1, 0, 0" -> "2021-01-01T08:00:00.000Z"
   * @example "2021, 6, 1, 0, 0" -> "2021-07-01T07:00:00.000Z"
   */
  createUtcDate (year: number, month: number, day: number, hours = 0, minutes = 0): Date {
    return DateUtilities.createUtcDate(year, month, day, hours, minutes)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a date string (YYYY-MM-DD) to a Date object at 12:00:00 am Pacific time.
   * @example 2021-11-22 -> 2021-11-22T08:00:00.00Z
   */
  yyyyMmDdToDate (dateStr: IsoDatePacific): Date {
    return DateUtilities.yyyyMmDdToDate(dateStr)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a Date object to a date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "2020-12-31"
   * @example "2021-01-01 08:00:00 GMT" -> "2021-01-01"
   */
  dateToYyyyMmDd (date: Date): IsoDatePacific {
    return DateUtilities.dateToYyyyMmDd(date)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a date string (YYYY-MM-DD) to a formatted date string (Month Day, Year).
   * @example "2020-01-01" -> "Jan 1, 2020"
   */
  formatYyyyMmDd (dateStr: IsoDatePacific): string {
    return DateUtilities.formatYyyyMmDd(dateStr)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a Date object to a date string (Month Day, Year) in Pacific timezone.
   * @param date
   * @param longMonth whether to show long month name (eg, December vs Dec)
   * @param showWeekday whether to show the weekday name (eg, Thursday)
   * @example "2021-01-01 07:00:00 GMT" -> "Dec 31, 2020"
   * @example "2021-01-01 08:00:00 GMT" -> "Jan 1, 2021"
   */
  dateToPacificDate (date: Date, longMonth = false, showWeekday = false): string {
    return DateUtilities.dateToPacificDate(date, longMonth, showWeekday)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a Date object to a time string (HH:MM am/pm) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "11:00 pm"
   * @example "2021-01-01 08:00:00 GMT" -> "12:00 am"
   */
  dateToPacificTime (date: Date): string {
    return DateUtilities.dateToPacificTime(date)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a Date object to a date and time string (Month Day, Year at HH:MM am/pm
   * Pacific time).
   * @example "2021-01-01 07:00:00 GMT" -> "December 31, 2020 at 11:00 pm Pacific time"
   * @example "2021-01-01 08:00:00 GMT" -> "January 1, 2021 at 12:00 pm Pacific time"
   */
  dateToPacificDateTime (date: Date): string {
    return DateUtilities.dateToPacificDateTime(date)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a Date object to an API datetime string.
   * @example 2021-08-05T16:56:50Z -> 2021-08-05T16:56:50+00:00
   */
  dateToApi (date: Date): ApiDateTimeUtc {
    return DateUtilities.dateToApi(date)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts an API datetime string (in UTC) to a Date object.
   * @example 2021-08-05T16:56:50.783101+00:00 -> 2021-08-05T16:56:50Z
   */
  apiToDate (dateTimeString: ApiDateTimeUtc): Date {
    return DateUtilities.apiToDate(dateTimeString)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts an API datetime string (in UTC) to a date string (Month Day, Year).
   * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020" (PST example)
   * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021" (PDT example)
   */
  apiToPacificDate (dateTimeString: ApiDateTimeUtc): string {
    return DateUtilities.apiToPacificDate(dateTimeString)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts an API datetime string (in UTC) to a date and time string (Month Day, Year at HH:MM am/pm
   * Pacific time).
   * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020 at 04:00 pm Pacific time" (PST example)
   * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021 at 05:00 pm Pacific time" (PDT example)
   */
  apiToPacificDateTime (dateTimeString: ApiDateTimeUtc, longMonth = false): string {
    return DateUtilities.apiToPacificDateTime(dateTimeString, longMonth)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts an API datetime string (in UTC) to a UTC string.
   * @example "2021-10-01T19:26:24.530803+00:00" -> "Fri, 01 Oct 2021 19:26:24 GMT"
   */
  apiToUtcString (dateTimeString: ApiDateTimeUtc): string {
    return DateUtilities.apiToUtcString(dateTimeString)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts an API datetime string (in UTC) to a date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-11-17T08:00:00+00:00" -> "2021-11-17"
   */
  apiToYyyyMmDd (dateTimeString: ApiDateTimeUtc): IsoDatePacific {
    return DateUtilities.apiToYyyyMmDd(dateTimeString)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Converts a date string (YYYY-MM-DD) to an API datetime string (in UTC).
   * @example "2021-01-01" -> 2021-01-01T08:00:00+00:00" // PST
   * @example "2021-07-01" -> 2021-07-01T07:00:00+00:00" // PDT
   */
  yyyyMmDdToApi (date: IsoDatePacific): ApiDateTimeUtc {
    return DateUtilities.yyyyMmDdToApi(date)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Compares two date strings (YYYY-MM-DD).
   * @param date1 the first date to compare
   * @param date2 the second date to compare
   * @param operator the operator to use for comparison
   * @returns the result of the comparison (true or false)
   */
  compareYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc, operator: string): boolean {
    return DateUtilities.compareYyyyMmDd(date1, date2, operator)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Returns the earliest of two date strings (YYYY-MM-DD).
   * @param date1 first date
   * @param date2 second date
   */
  earliestYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc): string {
    return DateUtilities.earliestYyyyMmDd(date1, date2)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Returns the latest of two date strings (YYYY-MM-DD).
   * @param date1 first date
   * @param date2 second date
   */
  latestYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc): string {
    return DateUtilities.latestYyyyMmDd(date1, date2)
  }

  /**
   * DEPRECATED - call resources/date-utilities instead
   * Returns the number of days that 'date' is from today in Pacific timezone.
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: Date): number {
    return DateUtilities.daysFromToday(this.getCurrentJsDate, date)
  }
}
