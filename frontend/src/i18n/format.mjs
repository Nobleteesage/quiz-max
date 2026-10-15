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

// Quiz creation times are stored as ISO text such as "2026-10-05T10:00:00.000Z". Show only the day.
export function formatDay(lang, value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB')
}
