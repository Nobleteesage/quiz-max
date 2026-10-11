const db = require('./db');

function getResultBySession(sessionId) {
  const row = db.prepare(
    'SELECT quiz_id, session_id, data, created_at FROM results WHERE session_id = ?'
  ).get(sessionId);

  if (!row) return null;

  return {
    quizId: row.quiz_id,
    sessionId: row.session_id,
    createdAt: row.created_at,
    results: JSON.parse(row.data)
  };
}

module.exports = { getResultBySession };
