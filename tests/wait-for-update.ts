import Vue from 'vue'
import flushPromises from 'flush-promises'

/**
 * Utility method to get around timing issues.
 */
export async function waitForUpdate (numTimesToFlushPromises = 1) {
  await Vue.nextTick()
  for (let i = 0; i < numTimesToFlushPromises; i++) {
    await flushPromises()
  }
  await Vue.nextTick()
}
