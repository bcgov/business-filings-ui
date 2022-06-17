import { Component, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { isDate } from 'lodash'
import { ApiDateTimeUtc, IsoDatePacific } from '@bcrs-shared-components/interfaces'

const MS_IN_A_DAY = (1000 * 60 * 60 * 24)

/** Mixin that provides some useful date utilities. */
@Component({})
export default class DateMixin extends Vue {
  @Getter getCurrentJsDate!: Date

  /**
   * Fetches and returns the web server's current date (in UTC).
   * Used to bypass the user's local clock/timezone.
   * Ref: https://www.npmjs.com/package/serverdate
   * @returns a promise to return a Date object
   */
  async getServerDate (): Promise<Date> {
    const input = `${window.location.origin}/${process.env.VUE_APP_PATH}/`
    const init: RequestInit = { cache: 'no-store', method: 'HEAD' }

    try {
      const { headers, ok, statusText } = await fetch(input, init)
      if (!ok) throw new Error(statusText)
      // NB: this `new Date()` is safe because the header date string is in GMT (ie, UTC)
      //     so the conversion to JS Date ignores the browser's local timezone
      return new Date(headers.get('Date'))
    } catch {
      // eslint-disable-next-line no-console
      console.warn('Unable to get server date - using browser date instead')
      // fall back to local date (which depends on user's PC/browser config)
      // NB: new filings may contain invalid date/time
      return new Date()
    }
  }

  /**
   * Creates and returns a new Date object in UTC, given parameters in Pacific timezone.
   * (This works regardless of user's local clock/timezone.)
   * @example "2021, 0, 1, 0, 0" -> "2021-01-01T08:00:00.000Z"
   * @example "2021, 6, 1, 0, 0" -> "2021-07-01T07:00:00.000Z"
   */
  createUtcDate (year: number, month: number, day: number, hours: number = 0, minutes: number = 0): Date {
    // 1. create the new date in UTC
    // 2. compute the offset between UTC and Pacific timezone
    // 3. add the offset to convert the date to Pacific timezone
    // Ref: https://stackoverflow.com/questions/15141762/
    const date = new Date(Date.UTC(year, month, day, hours, minutes))
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Vancouver' }))
    const offset = utcDate.getTime() - tzDate.getTime()
    date.setTime(date.getTime() + offset)

    return date
  }

  /**
   * Converts a date string (YYYY-MM-DD) to a Date object at 12:00:00 am Pacific time.
   * @example 2021-11-22 -> 2021-11-22T08:00:00.00Z
   */
  yyyyMmDdToDate (dateStr: IsoDatePacific): Date {
    // safety checks
    if (!dateStr) return null
    if (dateStr.length !== 10) return null

    const split = dateStr.split('-')
    const year = +split[0]
    const month = +split[1]
    const day = +split[2]

    return this.createUtcDate(year, (month - 1), day)
  }

  /**
   * Converts a Date object to a date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "2020-12-31"
   * @example "2021-01-01 08:00:00 GMT" -> "2021-01-01"
   */
  dateToYyyyMmDd (date: Date): IsoDatePacific {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    // NB: some versions of Node have only en-US locale
    // so use that and convert results accordingly
    const dateStr = date.toLocaleDateString('en-US', {
      timeZone: 'America/Vancouver',
      month: 'numeric', // 12
      day: 'numeric', // 31
      year: 'numeric' // 2020
    })

    // convert mm/dd/yyyy to yyyy-mm-dd
    // and make sure month and day are 2 digits (eg, 03)
    const [mm, dd, yyyy] = dateStr.split('/')
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }

  /**
   * Converts a date string (YYYY-MM-DD) to a formatted date string (Month Day, Year).
   * @example "2020-01-01" -> "Jan 1, 2020"
   */
  formatYyyyMmDd (dateStr: IsoDatePacific): string {
    // safety checks
    if (!dateStr) return null
    if (dateStr.length !== 10) return null

    // create a Date object
    // then split into its components (in "absolute" time)
    // eg, "2020-01-01" -> "Wed, 01 Jan 2020 00:00:00 GMT"
    const date = this.yyyyMmDdToDate(dateStr)
    const [weekday, day, month, year, time, tz] = date.toUTCString().split(' ')

    // convert day to number so that "01" -> "1"
    return `${month} ${+day}, ${year}`
  }

  /**
   * Converts a Date object to a date string (Month Day, Year) in Pacific timezone.
   * @param longMonth whether to show long month name (eg, December vs Dec)
   * @param showWeekday whether to show the weekday name (eg, Thursday)
   * @example "2021-01-01 07:00:00 GMT" -> "Dec 31, 2020"
   * @example "2021-01-01 08:00:00 GMT" -> "Jan 1, 2021"
   */
  dateToPacificDate (date: Date, longMonth = false, showWeekday = false): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    // NB: some versions of Node have only en-US locale
    // so use that and convert results accordingly
    let dateStr = date.toLocaleDateString('en-US', {
      timeZone: 'America/Vancouver',
      weekday: showWeekday ? 'long' : undefined, // Thursday or nothing
      month: longMonth ? 'long' : 'short', // December or Dec
      day: 'numeric', // 31
      year: 'numeric' // 2020
    })

    // remove period after month
    dateStr = dateStr.replace('.', '')

    return dateStr
  }

  /**
   * Converts a Date object to a time string (HH:MM am/pm) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "11:00 pm"
   * @example "2021-01-01 08:00:00 GMT" -> "12:00 am"
   */
  dateToPacificTime (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    // NB: some versions of Node have only en-US locale
    // so use that and convert results accordingly
    let timeStr = date.toLocaleTimeString('en-US', {
      timeZone: 'America/Vancouver',
      hour: 'numeric', // 11
      minute: '2-digit', // 00
      hour12: true // AM/PM
    })

    // replace AM with am and PM with pm
    timeStr = timeStr.replace('AM', 'am').replace('PM', 'pm')

    return timeStr
  }

  /**
   * Converts a Date object to a date and time string (Month Day, Year at HH:MM am/pm
   * Pacific time).
   * @example "2021-01-01 07:00:00 GMT" -> "Dec 31, 2020 at 11:00 pm Pacific time"
   * @example "2021-01-01 08:00:00 GMT" -> "Jan 1, 2021 at 12:00 pm Pacific time"
   */
  dateToPacificDateTime (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    const dateStr = this.dateToPacificDate(date, true)
    const timeStr = this.dateToPacificTime(date)

    return `${dateStr} at ${timeStr} Pacific time`
  }

  /**
   * Converts a Date object to an API datetime string.
   * @example 2021-08-05T16:56:50Z -> 2021-08-05T16:56:50+00:00
   */
  dateToApi (date: Date): ApiDateTimeUtc {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    // replace "Zulu" timezone abbreviation with UTC offset
    return date.toISOString().replace('Z', '+00:00')
  }

  /**
   * Converts an API datetime string (in UTC) to a Date object.
   * @example 2021-08-05T16:56:50.783101+00:00 -> 2021-08-05T16:56:50Z
   */
  apiToDate (dateTimeString: ApiDateTimeUtc): Date {
    if (!dateTimeString) return null // safety check

    // chop off the milliseconds and UTC offset and append "Zulu" timezone abbreviation
    // eg, 2020-08-28T21:53:58Z
    dateTimeString = dateTimeString.slice(0, 19) + 'Z'

    // NB: this `new Date()` is safe because the string is already UTC format
    //     so the conversion to JS Date ignores the browser's local timezone
    return new Date(dateTimeString)
  }

  /**
   * Converts an API datetime string (in UTC) to a date string (Month Day, Year).
   * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020" (PST example)
   * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021" (PDT example)
   */
  apiToPacificDate (dateTimeString: ApiDateTimeUtc): string {
    if (!dateTimeString) return null // safety check

    const date = this.apiToDate(dateTimeString)

    return this.dateToPacificDate(date)
  }

  /**
   * Converts an API datetime string (in UTC) to a date and time string (Month Day, Year at HH:MM am/pm
   * Pacific time).
   * @example "2021-01-01T00:00:00.000000+00:00" -> "Dec 31, 2020 at 04:00 pm Pacific time" (PST example)
   * @example "2021-07-01T00:00:00.000000+00:00" -> "Jun 30, 2021 at 05:00 pm Pacific time" (PDT example)
   */
  apiToPacificDateTime (dateTimeString: ApiDateTimeUtc, longMonth = false): string {
    if (!dateTimeString) return null // safety check

    const date = this.apiToDate(dateTimeString)
    const dateStr = this.dateToPacificDate(date, longMonth)
    const timeStr = this.dateToPacificTime(date)

    return `${dateStr} at ${timeStr} Pacific time`
  }

  /**
   * Converts an API datetime string (in UTC) to a UTC string.
   * @example "2021-10-01T19:26:24.530803+00:00" -> "Fri, 01 Oct 2021 19:26:24 GMT"
   */
  apiToUtcString (dateTimeString: ApiDateTimeUtc): string {
    if (!dateTimeString) return null // safety check

    const date = this.apiToDate(dateTimeString)
    return date.toUTCString()
  }

  /**
   * Converts an API datetime string (in UTC) to a date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-11-17T08:00:00+00:00" -> "2021-11-17"
   */
  apiToYyyyMmDd (dateTimeString: ApiDateTimeUtc): IsoDatePacific {
    const date = this.apiToDate(dateTimeString)
    return this.dateToYyyyMmDd(date)
  }

  /**
   * Converts a date string (YYYY-MM-DD) to an API datetime string (in UTC).
   * @example "2021-01-01" -> 2021-01-01T08:00:00+00:00" // PST
   * @example "2021-07-01" -> 2021-07-01T07:00:00+00:00" // PDT
   */
  yyyyMmDdToApi (date: IsoDatePacific): ApiDateTimeUtc {
    // safety check
    if (date?.length !== 10) return null

    // make sure the date is in correct format
    if (date.indexOf('/') >= 0) {
      date = date.replace('/', '-')
    }

    // first convert string to a JS Date
    // eg, "2020-08-26" ->  "2020-08-26T07:00:00.000Z"
    const jsDate = this.yyyyMmDdToDate(date)

    // then convert JS Date to API
    // eg "2020-08-26T07:00:00.000Z" -> "2020-08-26T07:00:00+00:00"
    return this.dateToApi(jsDate)
  }

  /**
   * Compares two date strings (YYYY-MM-DD).
   * @param date1 the first date to compare
   * @param date2 the second date to compare
   * @param operator the operator to use for comparison
   * @returns the result of the comparison (true or false)
   */
  compareYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc, operator: string): boolean {
    // safety check
    if (!date1 || !date2 || !operator) return true

    // convert dates to numbers (YYYYMMDD)
    date1 = date1.split('-').join('')
    date2 = date2.split('-').join('')

    return eval(date1 + operator + date2) // eslint-disable-line no-eval
  }

  /**
   * Returns the earliest of two date strings (YYYY-MM-DD).
   * @param date1 first date
   * @param date2 second date
   */
  earliestYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc): string {
    // safety check
    if (!date1 && !date2) return null

    // edge cases
    if (!date1) return date2
    if (!date2) return date1

    return (this.compareYyyyMmDd(date1, date2, '<') ? date1 : date2)
  }

  /**
   * Returns the latest of two date strings (YYYY-MM-DD).
   * @param date1 first date
   * @param date2 second date
   */
  latestYyyyMmDd (date1: ApiDateTimeUtc, date2: ApiDateTimeUtc): string {
    // safety check
    if (!date1 && !date2) return null

    // edge cases
    if (!date1) return date2
    if (!date2) return date1

    return (this.compareYyyyMmDd(date1, date2, '>') ? date1 : date2)
  }

  /**
   * Returns the number of days that 'date' is from today in Pacific timezone.
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: Date): number {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return NaN

    // set "date" to 12:00 am Pacific
    date.setHours(0, 0, 0, 0)

    // compute "today" at 12:00 am Pacific
    const today = this.getCurrentJsDate
    today.setHours(0, 0, 0, 0)

    // calculate difference between "date" and "today"
    // (result should be a whole number)
    const diff = (date.valueOf() - today.valueOf()) / MS_IN_A_DAY
    return Math.round(diff)
  }
}
