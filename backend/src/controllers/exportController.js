const { quizzes } = require('../models/quizStore');
const { getResultBySession } = require('../models/resultsStore');

const HEADERS = {
  en: ['Place', 'Name', 'Score', 'Time taken'],
  ru: ['Место', 'Имя', 'Очки', 'Затраченное время']
};

// Quote a text cell. Names that start with = + - @ would be run as formulas
// by Excel, so they get a leading apostrophe.
function csvSafeText(value) {
  let text = String(value === undefined || value === null ? '' : value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }
  return '"' + text.replace(/"/g, '""') + '"';
}

// The server stores times such as "30s". Russian files show "30 с".
function formatTaken(value, lang) {
  const text = String(value === undefined || value === null ? '' : value);
  return lang === 'ru' ? text.replace(/(\d+)s$/, '$1 с') : text;
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

  const lang = req.query.lang === 'ru' ? 'ru' : 'en';

  const lines = [HEADERS[lang].join(';')];
  session.results.forEach((p, i) => {
    lines.push([i + 1, csvSafeText(p.name), p.score, csvSafeText(formatTaken(p.timeTaken, lang))].join(';'));
  });

  // The first character is a marker that makes Excel read the file as UTF-8
  const body = '\uFEFF' + lines.join('\r\n') + '\r\n';
  const fileName = 'quiz-results-' + session.sessionId.slice(0, 8) + '.csv';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="' + fileName + '"');
  res.send(body);
};

module.exports = { exportSession, csvSafeText, formatTaken, HEADERS };
