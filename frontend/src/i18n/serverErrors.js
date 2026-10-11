const KEYS = {
  'Invalid join code or quiz already started': 'error.invalidJoin',
  'Quiz not found': 'error.quizNotFound',
  'Quiz has no questions': 'error.noQuestions',
  'Unauthorized or session not found': 'error.unauthorized',
  'Only the quiz host can start a session': 'error.notHost'
}

export function serverError(t, message) {
  const key = KEYS[message]
  return key ? t(key) : message
}
