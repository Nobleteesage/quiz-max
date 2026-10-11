const KEYS = {
  'Invalid join code or quiz already started': 'error.invalidJoin',
  'Quiz not found': 'error.quizNotFound',
  'Quiz has no questions': 'error.noQuestions',
  'Unauthorized or session not found': 'error.unauthorized',
  'Only the quiz host can start a session': 'error.notHost',
  'Username and password are required': 'error.credentialsRequired',
  'Username already taken': 'error.usernameTaken',
  'Invalid username or password': 'error.invalidCredentials',
  'Missing or invalid authorization header': 'error.authHeader',
  'Invalid or expired token': 'error.tokenExpired',
  'Too many login attempts, please try again later': 'error.tooManyLogin',
  'Too many requests, please try again later': 'error.tooManyRequests',
  'Quiz title is required': 'error.titleRequired',
  'Title is too long': 'error.titleTooLong',
  'Time limit must be at least 5 seconds': 'error.timeTooShort',
  'Time limit cannot exceed 300 seconds': 'error.timeTooLong',
  'Question text is required': 'error.questionRequired',
  'At least 2 options are required': 'error.minOptions',
  'Maximum 6 options allowed': 'error.maxOptions',
  'correctAnswer must point to one of the provided options': 'error.correctRange',
  'A true or false question must have exactly 2 options': 'error.trueFalseOptions',
  'Only the quiz host can add questions': 'error.notHostAdd',
  'Only the quiz host can view this quiz': 'error.notHostView',
  'Only the quiz host can export these results': 'error.notHostExport'
}

export function serverError(t, message) {
  const key = KEYS[message]
  return key ? t(key) : message
}
