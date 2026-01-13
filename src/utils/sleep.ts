/**
 * "Sleeps" for specified timeout. Must be awaited.
 * @param ms Delay to sleep, in milliseconds.
 * @returns A promise to await upon.
 */
export function Sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
