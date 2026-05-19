export const verifyAddressValidation = async (address: any) => {
  const inputPath = '.v-input__control > .v-input__slot > .v-text-field__slot > input'
  const textAreaPath = '.v-input__control > .v-input__slot > .v-text-field__slot > textarea'

  const street = address.find(`div.street-address > ${inputPath}`)
  const streetAdditional = address.find(`div.street-address-additional > ${textAreaPath}`)
  const city = address.find(`div.address-city > ${inputPath}`)
  const deliveryInstructions = address.find(`div.delivery-instructions > ${textAreaPath}`)

  await street.setValue('1'.repeat(50))
  await street.trigger('input')
  await streetAdditional.setValue('1'.repeat(105))
  await streetAdditional.trigger('input')
  await city.setValue('1'.repeat(40))
  await city.trigger('input')
  await deliveryInstructions.setValue('1'.repeat(80))
  await deliveryInstructions.trigger('input')

  const validMessages = address.findAll('.v-messages__message')
  expect(validMessages.length).toBe(0)

  // verify name lengths are invalid
  await street.setValue('1'.repeat(51))
  await street.trigger('input')
  await streetAdditional.setValue('1'.repeat(106))
  await streetAdditional.trigger('input')
  await city.setValue('1'.repeat(41))
  await city.trigger('input')
  await deliveryInstructions.setValue('1'.repeat(81))
  await deliveryInstructions.trigger('input')
  const errorMessages = address.findAll('.v-messages__message')
  expect(errorMessages.length).toBe(4)
  expect(errorMessages.at(0).text()).toBe('Maximum length is 50')
  expect(errorMessages.at(1).text()).toBe('Maximum length is 105')
  expect(errorMessages.at(2).text()).toBe('Maximum length is 40')
  expect(errorMessages.at(3).text()).toBe('Maximum length is 80')
}
