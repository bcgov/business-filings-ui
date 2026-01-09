import { validatePostalCode } from '@/validators'

describe('validatePostalCode', () => {
  const mockVm = (country: string) => ({
    addressCountry: country
  })

  it('returns true for valid Canadian postal codes', () => {
    expect(validatePostalCode('H0H0H0', mockVm('CA'))).toBe(true)
    expect(validatePostalCode('H0H 0H0', mockVm('CA'))).toBe(true)
  })

  it('returns false for invalid Canadian postal codes', () => {
    expect(validatePostalCode('H0H0H0H0', mockVm('CA'))).toBe(false)
    expect(validatePostalCode('123456', mockVm('CA'))).toBe(false)
  })

  it('returns true for blank postal codes if country is exempt', () => {
    expect(validatePostalCode('', mockVm('HK'))).toBe(true)
    expect(validatePostalCode('', mockVm('BS'))).toBe(true)
  })

  it('returns false for blank postal codes if country is Canada', () => {
    expect(validatePostalCode('', mockVm('CA'))).toBe(false)
  })

  it('handles lowercase postal codes', () => {
    expect(validatePostalCode('v1v1v1', mockVm('CA'))).toBe(true)
  })
})
