const db = require('./db');

// In-memory objects, kept for live reads exactly like before.
// quizzes is hydrated from the database on startup and kept
// in sync on every write. sessions stays purely in-memory since
// it holds live socket connections and timers.
const quizzes = {};
const sessions = {};

function loadQuizzesFromDb() {
  const rows = db.prepare('SELECT data FROM quizzes').all();
  for (const row of rows) {
    const quiz = JSON.parse(row.data);
    quizzes[quiz.id] = quiz;
  }
  console.log(`Loaded ${rows.length} quiz(zes) from database`);
}

function saveQuiz(quiz) {
  db.prepare(
    'INSERT INTO quizzes (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ' +
    'ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP'
  ).run(quiz.id, JSON.stringify(quiz));
}

function removeQuiz(quizId) {
  db.prepare('DELETE FROM quizzes WHERE id = ?').run(quizId);
}

function saveResults(quizId, sessionId, results) {
  db.prepare(
    'INSERT INTO results (quiz_id, session_id, data) VALUES (?, ?, ?)'
  ).run(quizId, sessionId, JSON.stringify(results));
}

function getResultsForQuiz(quizId) {
  return db.prepare(
    'SELECT session_id, data, created_at FROM results WHERE quiz_id = ? ORDER BY id DESC'
  ).all(quizId).map((row) => ({
    sessionId: row.session_id,
    createdAt: row.created_at,
    results: JSON.parse(row.data)
  }));
}

loadQuizzesFromDb();

module.exports = { quizzes, sessions, saveQuiz, removeQuiz, saveResults, getResultsForQuiz };
