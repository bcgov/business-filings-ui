/**
 * Capitalizes the first letter of each word in the given string.
 * @example "ABC DEF" -> "Abc Def"
 * @example "abc def" -> "Abc Def"
 */
export function Capitalize (s: string): string {
  if (!s) return ''
  const words = s.toLowerCase().split(' ')
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1)
  }
  return words.join(' ')
}
