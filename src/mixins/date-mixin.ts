import { Component, Vue } from 'vue-property-decorator'
import { mapState } from 'vuex'
import { isDate } from 'lodash'

const MS_IN_A_DAY = (1000 * 60 * 60 * 24)

/**
 * Mixin that provides some useful date utilities.
 */
@Component({
  computed: {
    ...mapState(['currentDate'])
  }
})
export default class DateMixin extends Vue {
  readonly currentDate!: string

  /**
   * Converts a JavaScript date object to a simple date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "2020-12-31"
   * @example "2021-01-01 08:00:00 GMT" -> "2021-01-01"
   * @example "2021-01-01 00:00:00 PST" -> "2021-01-01"
   * @example "2021-01-01 23:59:59 PST" -> "2021-01-01"
   */
  dateToSimpleDate (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    const yyyy = date.getFullYear().toString()
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')

    return `${yyyy}-${mm}-${dd}`
  }

  /**
   * Converts a number (YYYYMMDD) to a simple date string (YYYY-MM-DD).
   * @example 20191231 -> "2019-12-31"
   */
  numToSimpleDate (num: number): string {
    // safety check
    if (num?.toString().length !== 8) return null

    const str = num.toString()

    // get date parts
    const yyyy = str.substr(0, 4)
    const mm = str.substr(4, 2)
    const dd = str.substr(6, 2)

    return `${yyyy}-${mm}-${dd}`
  }

  /**
   * Compares two simple date strings (YYYY-MM-DD).
   * @param date1 the first date to compare
   * @param date2 the second date to compare
   * @param operator the operator to use for comparison
   * @returns the result of the comparison (true or false)
   */
  compareDates (date1: string, date2: string, operator: string): boolean {
    // safety check
    if (!date1 || !date2 || !operator) return true

    // convert dates to numbers (YYYYMMDD)
    date1 = date1.split('-').join('')
    date2 = date2.split('-').join('')

    return eval(date1 + operator + date2) // eslint-disable-line no-eval
  }

  /**
   * Returns the earliest of two simple date strings.
   * @param date1 first date
   * @param date2 second date
   */
  earliestDate (date1: string, date2: string): string {
    // safety check
    if (!date1 && !date2) return null

    // edge cases
    if (!date1) return date2
    if (!date2) return date1

    return (this.compareDates(date1, date2, '<') ? date1 : date2)
  }

  /**
   * Returns the latest of two simple date strings.
   * @param date1 first date
   * @param date2 second date
   */
  latestDate (date1: string, date2: string): string {
    // safety check
    if (!date1 && !date2) return null

    // edge cases
    if (!date1) return date2
    if (!date2) return date1

    return (this.compareDates(date1, date2, '>') ? date1 : date2)
  }

  /**
   * Converts a simple date string (YYYY-MM-DD) to the preferred display format (mmm dd, yyyy).
   * @example "2020-01-01" -> "Jan 1, 2020"
   */
  simpleDateToDisplayDate (date: string): string {
    // safety check
    if (date?.length !== 10) return null

    // split into its components (in absolute/UTC time)
    // eg, "2020-01-01" -> "Wed, 01 Jan 2020 00:00:00 GMT"
    const [weekday, day, month, year, time, tz] = (new Date(date).toUTCString()).split(' ')

    // NB: convert day to number so that "01" -> "1"
    return `${month} ${+day}, ${year}`
  }

  /**
   * Converts an API datetime string (in UTC) to a simple date-time string (YYYY-MM-DD at HH:MM am/pm)
   * in Pacific timezone.
   * @example "2021-01-01T00:00:00.000000+00:00" -> "2020-12-31 at 04:00 PM" (PST example)
   * @example "2021-07-01T00:00:00.000000+00:00" -> "2021-06-30 at 05:00 PM" (PDT example)
   */
  apiToSimpleDateTime (dateString: string): string {
    if (!dateString) return null // safety check

    // chop off the milliseconds and append "Zulu" timezone abbreviation
    // eg, 2020-08-28T21:53:58Z
    dateString = dateString.slice(0, 19) + 'Z'
    const utc = new Date(dateString)

    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Vancouver'
    }

    // NB: locale 'en-CA' is the only one consistent between IE11 and other browsers
    // eg, "2019-12-31 04:00 PM"
    let pacific = new Intl.DateTimeFormat('en-CA', options).format(utc)

    // misc cleanup
    pacific = pacific.replace(', ', ' at ')
    pacific = pacific.replace('a.m.', 'am')
    pacific = pacific.replace('p.m.', 'pm')

    // fix for Jest (which outputs MM/DD/YYYY no matter which 'en' locale is used)
    if (pacific.indexOf('/') >= 0) {
      const date = pacific.substr(0, 10).split('/')
      const time = pacific.slice(11)
      // set as YYYY-MM-DD HH:MM am/pm
      pacific = `${date[2]}-${date[0]}-${date[1]} ${time}`
    }

    return pacific
  }

  /**
   * Converts a simple date string (YYYY-MM-DD) to an API datetime string (in UTC).
   * @example "2021-01-01" -> 2021-01-01T08:00:00+00:00" // PST
   * @example "2021-07-01" -> 2021-07-01T07:00:00+00:00" // PDT
   */
  simpleDateToApi (date: string): string {
    // safety check
    if (date?.length !== 10) return null

    // make sure the date is in correct format
    if (date.indexOf('/') >= 0) {
      date = date.replace('/', '-')
    }

    // create date using local timezone
    // eg, if `date` is "2020-08-26" and the local timezone is PDT
    // then `iso` will be "2020-08-26T07:00:00.000Z"
    const iso = new Date(date + 'T00:00:00').toISOString()

    // convert to API format
    // eg "2020-08-26T07:00:00.000Z" -> "2020-08-26T07:00:00+00:00"
    const api = iso.replace('.000Z', '+00:00')

    return api
  }

  /**
   * The number of days that 'date' is from today.
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: string): number {
    // safety check
    if (!date) return NaN

    // calculate difference between start of "today" and start of "date" (in local time)
    const todayLocalMs = new Date(this.currentDate).setHours(0, 0, 0, 0)
    const dateLocalMs = new Date(date).setHours(0, 0, 0, 0)
    return Math.round((dateLocalMs - todayLocalMs) / MS_IN_A_DAY)
  }
}
