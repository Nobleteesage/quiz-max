// The server sends times such as "30s". Show them with the unit of the chosen language.
export function formatDuration(t, value) {
  const seconds = parseInt(value, 10)
  return Number.isNaN(seconds) ? value : t('quiz.secondsShort', { count: seconds })
}

// The database stores UTC times such as "2026-10-11 07:58:30". Show them in the local time zone.
export function formatDate(lang, value) {
  const date = new Date(String(value).replace(' ', 'T') + 'Z')
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB')
}
