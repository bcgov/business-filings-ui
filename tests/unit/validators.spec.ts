import { validatePostalCode, noLeadingTrailingSpaces, requiredNoWhitespace } from '@/validators'

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

describe('whitespace validators', () => {
  describe('requiredNoWhitespace', () => {
    it('fails for whitespace only', () => {
      expect(requiredNoWhitespace('   ')).toBe(false)
    })

    it('fails for leading whitespace', () => {
      expect(requiredNoWhitespace(' test')).toBe(false)
    })

    it('fails for trailing whitespace', () => {
      expect(requiredNoWhitespace('test ')).toBe(false)
    })

    it('passes for trimmed non-empty value', () => {
      expect(requiredNoWhitespace('test')).toBe(true)
    })

    it('passes for empty value (required handles emptiness)', () => {
      expect(requiredNoWhitespace('')).toBe(true)
      expect(requiredNoWhitespace(null)).toBe(true)
    })
  })

  describe('noLeadingTrailingSpaces', () => {
    it('fails when value has leading spaces', () => {
      expect(noLeadingTrailingSpaces(' test')).toBe(false)
    })

    it('fails when value has trailing spaces', () => {
      expect(noLeadingTrailingSpaces('test ')).toBe(false)
    })

    it('passes for trimmed value', () => {
      expect(noLeadingTrailingSpaces('test')).toBe(true)
    })

    it('passes for empty value', () => {
      expect(noLeadingTrailingSpaces('')).toBe(true)
      expect(noLeadingTrailingSpaces(null)).toBe(true)
    })
  })
})
