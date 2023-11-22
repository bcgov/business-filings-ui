import { DateUtilities } from '@/services'

describe('Date Utilities', () => {
  it.skip('returns correct values for dateToYyyyMmDd()', () => {
    expect(DateUtilities.dateToYyyyMmDd(null)).toBeNull()
    expect(DateUtilities.dateToYyyyMmDd(new Date('not a date'))).toBeNull()
    // verify that GMT/UTC is correctly converted to Pacific
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 07:00:00 GMT')))
      .toBe('2020-12-31') // Standard Time
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 08:00:00 GMT')))
      .toBe('2021-01-01') // Standard Time
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 06:00:00 GMT')))
      .toBe('2021-06-30') // Daylight Time
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 07:00:00 GMT')))
      .toBe('2021-07-01') // Daylight Time
    // verify that Pacific is correctly converted to Pacific
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 00:00:00 PST')))
      .toBe('2021-01-01')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 23:59:59 PST')))
      .toBe('2021-01-01')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 00:00:00 PDT')))
      .toBe('2021-07-01')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 23:59:59 PDT')))
      .toBe('2021-07-01')
    // verify that Eastern is correctly converted to Pacific
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 02:00:00 EST')))
      .toBe('2020-12-31')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-01-01 03:00:00 EST')))
      .toBe('2021-01-01')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 02:00:00 EDT')))
      .toBe('2021-06-30')
    expect(DateUtilities.dateToYyyyMmDd(new Date('2021-07-01 03:00:00 EDT')))
      .toBe('2021-07-01')
  })

  it('returns correct values for compareYyyyMmDd()', () => {
    expect(DateUtilities.compareYyyyMmDd(null, '2020-01-01', '<')).toBe(true)
    expect(DateUtilities.compareYyyyMmDd('2019-12-31', null, '<')).toBe(true)
    expect(DateUtilities.compareYyyyMmDd('2019-12-31', '2020-01-01', null))
      .toBe(true)
    expect(DateUtilities.compareYyyyMmDd('2019-12-31', '2020-01-01', '<'))
      .toBe(true)
    expect(DateUtilities.compareYyyyMmDd('2020-01-01', '2019-12-31', '<'))
      .toBe(false)
    expect(DateUtilities.compareYyyyMmDd('2019-12-31', '2020-01-01', '>'))
      .toBe(false)
    expect(DateUtilities.compareYyyyMmDd('2020-01-01', '2019-12-31', '>'))
      .toBe(true)
    expect(DateUtilities.compareYyyyMmDd('2019-12-31', '2020-01-01', '=='))
      .toBe(false)
  })

  it('returns correct values for earliestYyyyMmDd()', () => {
    expect(DateUtilities.earliestYyyyMmDd(null, null)).toBeNull()
    expect(DateUtilities.earliestYyyyMmDd(null, '2020-01-01'))
      .toBe('2020-01-01')
    expect(DateUtilities.earliestYyyyMmDd('2019-12-31', null))
      .toBe('2019-12-31')
    expect(DateUtilities.earliestYyyyMmDd('2019-12-31', '2020-01-01'))
      .toBe('2019-12-31')
    expect(DateUtilities.earliestYyyyMmDd('2020-01-01', '2019-12-31'))
      .toBe('2019-12-31')
  })

  it('returns correct values for latestYyyyMmDd()', () => {
    expect(DateUtilities.latestYyyyMmDd(null, null)).toBeNull()
    expect(DateUtilities.latestYyyyMmDd(null, '2020-01-01')).toBe('2020-01-01')
    expect(DateUtilities.latestYyyyMmDd('2019-12-31', null)).toBe('2019-12-31')
    expect(DateUtilities.latestYyyyMmDd('2019-12-31', '2020-01-01'))
      .toBe('2020-01-01')
    expect(DateUtilities.latestYyyyMmDd('2020-01-01', '2019-12-31'))
      .toBe('2020-01-01')
  })

  it('returns correct values for formatYyyyMmDd()', () => {
    expect(DateUtilities.formatYyyyMmDd(null)).toBeNull()
    expect(DateUtilities.formatYyyyMmDd('123456789')).toBeNull()
    expect(DateUtilities.formatYyyyMmDd('2020-01-01')).toBe('Jan 1, 2020')
  })

  it('returns correct values for apiToPacificDateTime()', () => {
    expect(DateUtilities.apiToPacificDateTime('2021-01-01T00:00:00+00:00'))
      .toBe('Dec 31, 2020 at 4:00 pm Pacific time') // PST
    expect(DateUtilities.apiToPacificDateTime('2021-07-01T00:00:00+00:00'))
      .toBe('Jun 30, 2021 at 5:00 pm Pacific time') // PDT
  })

  // FUTURE: fix so this works in GH CI action
  it.skip('returns correct values for yyyyMmDdToApi()', () => {
    expect(DateUtilities.yyyyMmDdToApi('2021-01-01'))
      .toBe('2021-01-01T08:00:00.000+00:00') // PST
    expect(DateUtilities.yyyyMmDdToApi('2021-07-01'))
      .toBe('2021-07-01T07:00:00.000+00:00') // PDT
    expect(DateUtilities.yyyyMmDdToApi('2023/05/03'))
      .toBe('2023-05-03T07:00:00.000+00:00')
  })

  it('returns correct values for daysBetweenTwoDates()', () => {
    const currentJsDate = new Date('2021-11-23T12:00:00')

    expect(DateUtilities.daysBetweenTwoDates(null, null))
      .toBeNaN()
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2021, 10, 22))
    ).toBe(-1) // yesterday
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2021, 10, 23, 0, 0, 0, 0)
    )
    ).toBe(0) // today
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2021, 10, 23, 23, 59, 59, 999)
    )
    ).toBe(0) // today
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2021, 10, 24)
    )
    ).toBe(1) // tomorrow
  })

  it('returns correct values for DAYLIGHT SAVINGS spring forward daysBetweenTwoDates()', () => {
    const currentJsDate = new Date('2022-03-01T12:00:00')

    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2022, 3 - 1, 2)
    )
    ).toBe(1) // before time change
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2022, 3 - 1, 15)
    )
    ).toBe(14) // after time change
  })

  it('returns correct values for DAYLIGHT SAVINGS fall back daysBetweenTwoDates()', () => {
    const currentJsDate = new Date('2022-11-01T12:00:00')

    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2022, 11 - 1, 2)
    )
    ).toBe(1) // before time change
    expect(DateUtilities.daysBetweenTwoDates(
      currentJsDate,
      new Date(2022, 11 - 1, 8)
    )
    ).toBe(7) // after time change
  })

  it('returns correct values for yyyyMmDdToDate()', () => {
    expect(DateUtilities.yyyyMmDdToDate(null)).toBeNull()
    expect(DateUtilities.yyyyMmDdToDate('12345678901')).toBeNull()
    expect(DateUtilities.yyyyMmDdToDate('2021-01-01').toISOString())
      .toEqual('2021-01-01T08:00:00.000Z') // PST
    expect(DateUtilities.yyyyMmDdToDate('2021-07-01').toISOString())
      .toEqual('2021-07-01T07:00:00.000Z') // PDT
  })

  it('returns correct values for addMonthsToDate()', () => {
    expect(DateUtilities.addMonthsToDate(null, null)).toBeNull()
    expect(DateUtilities.addMonthsToDate(1, '12345678901')).toBeNull()
    expect(DateUtilities.addMonthsToDate(3, '2023-02-03')).toEqual('2023-05-03')
    expect(DateUtilities.addMonthsToDate(18, '2023-02-03'))
      .toEqual('2024-08-03')
    expect(DateUtilities.addMonthsToDate(0, '2023-02-03')).toEqual('2023-02-03')
    expect(DateUtilities.addMonthsToDate(-3, '2023-02-03'))
      .toEqual('2022-11-03')
    expect(DateUtilities.addMonthsToDate(-18, '2023-02-03'))
      .toEqual('2021-08-03')
  })

  it('returns correct values for subtractDates()', () => {
    expect(DateUtilities.subtractDates(null, null)).toBeNull()
    expect(DateUtilities.subtractDates('12345678901', '12345678901')).toBeNull()
    expect(DateUtilities.subtractDates('2023-02-03', '2023-04-04'))
      .toBe(2)
    expect(DateUtilities.subtractDates('2023-02-03', '2024-08-04'))
      .toBe(18)
    expect(DateUtilities.subtractDates('2023-02-03', '2023-02-03'))
      .toBe(0)
    expect(DateUtilities.subtractDates('2023-04-04', '2023-02-03'))
      .toBe(-2)
    expect(DateUtilities.subtractDates('2024-08-04', '2023-02-03'))
      .toBe(-18)
  })
})
