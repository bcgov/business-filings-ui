import { Component, Vue } from 'vue-property-decorator'

/**
 * Mixin that provides some useful date utilities.
 */
@Component({})
export default class DateMixin extends Vue {
  readonly MS_IN_A_DAY = (1000 * 60 * 60 * 24)

  /**
   * Converts a JavaScript date object to a simple date string.
   * @param date The date to convert.
   * @returns A simple date string formatted as YYYY-MM-DD.
   */
  dateToUsableString (date: Date): string {
    if (!date || date.toString() === 'Invalid Date') return null

    const yyyy = date.getFullYear().toString()
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const dd = date.getDate().toString().padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  /**
   * Converts a number (YYYYMMDD) to a simple date string.
   * @param n The number to convert.
   * @returns A simple date string formatted as YYYY-MM-DD.
   */
  numToUsableString (val: number | string): string {
    if (!val || val.toString().length !== 8) return null

    val = val.toString()

    const yyyy = val.substr(0, 4)
    const mm = val.substr(4, 2)
    const dd = val.substr(6, 2)
    return `${yyyy}-${mm}-${dd}`
  }

  /**
   * Compares simple date strings (YYYY-MM-DD).
   * @param date1 The first date to compare.
   * @param date2 The second date to compare.
   * @param operator The operator to use for comparison.
   * @returns The result of the comparison (true or false).
   */
  compareDates (date1: string, date2: string, operator: string): boolean {
    if (!date1 || !date2 || !operator) return true

    // convert dates to numbers YYYYMMDD
    date1 = date1.split('-').join('')
    date2 = date2.split('-').join('')

    return eval(date1 + operator + date2) // eslint-disable-line no-eval
  }

  /**
   * Formats a simple date string (YYYY-MM-DD) to (Month Day, Year) for readability.
   *
   * @param date The date string to format.
   * @returns The re-formatted date string without the day name.
   */
  toReadableDate (date: string): string {
    // Cast to a workable dateString
    // Split into an array.
    let formatDate = (new Date(date).toDateString()).split(' ')

    // Remove the 'weekday' from the array
    // Join the array
    // Add a comma to the date output.
    const regex = / (?!.* )/
    return formatDate.slice(1).join(' ').replace(regex, ', ')
  }

  /**
     * API always returns the UTC date time in ISO format. This needs to be
     * converted to local time zone. Consistently in API and UI, America/Vancouver
     * is the timezone to be used.
     */
  convertUTCTimeToLocalTime (date: string): string {
    if (!date) return null // safety check

    const UTCTime: string = date.slice(0, 19) + 'Z'
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Vancouver'
    }

    // locale 'en-CA' is the only one consistent between IE11 and other browsers
    // example output: "2019-12-31 04:00:00 PM"
    let localTime = new Intl.DateTimeFormat('en-CA', options).format(new Date(UTCTime))

    // misc cleanup
    localTime = localTime.replace(',', '')
    localTime = localTime.replace('a.m.', 'AM')
    localTime = localTime.replace('p.m.', 'PM')

    // fix for Jest (which outputs MM/DD/YYYY no matter which 'en' locale is used)
    if (localTime.indexOf('/') >= 0) {
      const date = localTime.substr(0, 10).split('/')
      const time = localTime.slice(11)
      // set as YYYY-MM-DD HH:MM:SS AM/PM
      localTime = `${date[2]}-${date[0]}-${date[1]} ${time}`
    }

    return localTime
  }

  /**
   * The number of days that 'date' is from today.
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: string): number {
    if (!date) return NaN
    // calculate difference between start of "today" and start of "date" (in local time)
    const todayLocalMs = new Date().setHours(0, 0, 0, 0)
    const dateLocalMs = new Date(date).setHours(0, 0, 0, 0)
    return Math.round((dateLocalMs - todayLocalMs) / this.MS_IN_A_DAY)
  }
}
