// Returns 'one', 'few', 'many' or 'other' using the browser's built in language rules
export function pluralCategory(lang, count) {
  return new Intl.PluralRules(lang).select(count)
}
