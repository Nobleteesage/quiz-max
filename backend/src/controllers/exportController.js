const { quizzes } = require('../models/quizStore');
const { getResultBySession } = require('../models/resultsStore');

// Quote a text cell. Names that start with = + - @ would be run as formulas
// by Excel, so they get a leading apostrophe.
function csvSafeText(value) {
  let text = String(value === undefined || value === null ? '' : value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}

const exportSession = (req, res) => {
  const session = getResultBySession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const quiz = quizzes[session.quizId];
  if (!quiz || quiz.hostUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Only the quiz host can export these results' });
  }

  const lines = [['Place', 'Name', 'Score', 'Time taken'].join(';')];
  session.results.forEach((p, i) => {
    lines.push([i + 1, csvSafeText(p.name), p.score, csvSafeText(p.timeTaken)].join(';'));
  });

  // The first character is a marker that makes Excel read the file as UTF-8
  const body = '\uFEFF' + lines.join('\r\n') + '\r\n';
  const fileName = 'quiz-results-' + session.sessionId.slice(0, 8) + '.csv';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
  res.send(body);
};

module.exports = { exportSession, csvSafeText };
