const { quizzes, getResultsForQuiz } = require('../models/quizStore');

// Past results for every quiz owned by the logged in host
const getHistory = (req, res) => {
  const myQuizzes = Object.values(quizzes).filter(
    (q) => q.hostUserId === req.user.userId
  );

  const history = myQuizzes
    .map((q) => {
      const sessions = getResultsForQuiz(q.id).map((s) => ({
        sessionId: s.sessionId,
        playedAt: s.createdAt,
        participantCount: s.results.length,
        topName: s.results[0] ? s.results[0].name : null,
        topScore: s.results[0] ? s.results[0].score : 0,
        results: s.results
      }));

      return {
        quizId: q.id,
        title: q.title,
        questionCount: q.questions.length,
        sessions
      };
    })
    .filter((h) => h.sessions.length > 0);

  res.json({ history });
};

module.exports = { getHistory };
