import flushPromises from 'flush-promises'

/** Dispatches click event on specified element. */
export async function click (vm: any, id: string) {
  const button = vm.$el.querySelector(id)
  const window = button.ownerDocument.defaultView
  const event = new window.Event('click')
  button.dispatchEvent(event)
  await flushPromises() // wait for DOM to settle
}
