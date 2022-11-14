import flushPromises from 'flush-promises'

/** Dispatches input event with specified value on specified element. */
export async function setValue (vm: any, id: string, value: string) {
  const input = vm.$el.querySelector(id)
  input.value = value
  const window = input.ownerDocument.defaultView
  const event = new window.Event('input')
  input.dispatchEvent(event)
  await flushPromises() // wait for DOM to settle
}
