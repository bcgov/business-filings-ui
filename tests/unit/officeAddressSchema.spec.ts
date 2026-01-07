import { requiredNoWhitespace, noLeadingTrailingSpaces } from '@/schemas'

describe('office-address-schema whitespace validators', () => {
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
