export default {
  /**
   * Method that "sleeps" for specified timeout. Must be called from async method.
   * @param ms Delay to sleep, in milliseconds.
   * @returns A promise to await upon.
   */
  sleep (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
