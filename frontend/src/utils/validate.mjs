// Form checks that run in the browser before anything is sent to the server.
// Each function returns text names from en.json for the fields that have a problem.
// An empty result means the form is fine.

function isWholeNumber(value, min, max) {
  const text = String(value).trim()
  if (!/^\d+$/.test(text)) return false
  const number = Number(text)
  return number >= min && number <= max
}

export function validateLogin({ username, password }) {
  const errors = {}
  if (!String(username).trim()) errors.username = 'login.errorUsername'
  if (!password) errors.password = 'login.errorPassword'
  return errors
}

export function validateJoin({ name, joinCode }) {
  const errors = {}
  if (!String(name).trim()) errors.name = 'join.errorName'
  const code = String(joinCode).trim()
  if (!code) errors.joinCode = 'join.errorCodeMissing'
  else if (code.length !== 6) errors.joinCode = 'join.errorCodeLength'
  return errors
}

export function validateQuizForm({ title, timeLimit, penaltyPoints }) {
  const errors = {}
  if (!String(title).trim()) errors.title = 'create.errorTitle'
  if (!isWholeNumber(timeLimit, 5, 300)) errors.timeLimit = 'create.errorTime'
  if (!isWholeNumber(penaltyPoints, 0, 1000)) errors.penaltyPoints = 'create.errorPenalty'
  return errors
}

export function validateQuestionForm({ type, text, options, points }) {
  const errors = {}
  if (!String(text).trim()) errors.text = 'create.errorQuestionText'

  if (type !== 'true_false') {
    const optionErrors = options.map((option) => (String(option).trim() ? '' : 'create.errorOption'))
    if (optionErrors.some(Boolean)) errors.options = optionErrors
  }

  if (!isWholeNumber(points, 1, 1000)) errors.points = 'create.errorPoints'
  return errors
}

export function hasErrors(errors) {
  return Object.values(errors).some((value) => (Array.isArray(value) ? value.some(Boolean) : Boolean(value)))
}
