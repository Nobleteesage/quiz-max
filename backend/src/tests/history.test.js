const db = require('../models/db');
const { quizzes, saveQuiz, saveResults, getResultsForQuiz } = require('../models/quizStore');
const { getHistory } = require('../controllers/historyController');

function fakeRes() {
  return {
    body: null,
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('results history', () => {
  const hostId = 9001;
  const otherHostId = 9002;

  const quizA = { id: 'history-quiz-a', title: 'History Quiz A', questions: [{ id: 'q1' }], hostUserId: hostId };
  const quizB = { id: 'history-quiz-b', title: 'History Quiz B', questions: [], hostUserId: otherHostId };
  const quizC = { id: 'history-quiz-c', title: 'Never Played', questions: [], hostUserId: hostId };

  beforeAll(() => {
    // Start clean so the test gives the same result on every run
    db.prepare('DELETE FROM results WHERE quiz_id IN (?, ?, ?)').run(quizA.id, quizB.id, quizC.id);

    for (const quiz of [quizA, quizB, quizC]) {
      quizzes[quiz.id] = quiz;
      saveQuiz(quiz);
    }

    saveResults(quizA.id, 'session-1', [
      { name: 'Alice', score: 20, timeTaken: '30s' },
      { name: 'Bob', score: 10, timeTaken: '30s' }
    ]);
    saveResults(quizB.id, 'session-2', [
      { name: 'Eve', score: 5, timeTaken: '12s' }
    ]);
  });

  test('getResultsForQuiz returns the saved leaderboard', () => {
    const rows = getResultsForQuiz(quizA.id);

    expect(rows).toHaveLength(1);
    expect(rows[0].sessionId).toBe('session-1');
    expect(rows[0].results[0].name).toBe('Alice');
    expect(rows[0].results[0].score).toBe(20);
  });

  test('getHistory summarises the host own quiz', () => {
    const res = fakeRes();
    getHistory({ user: { userId: hostId } }, res);

    expect(res.body.history).toHaveLength(1);
    const entry = res.body.history[0];
    expect(entry.quizId).toBe(quizA.id);
    expect(entry.questionCount).toBe(1);
    expect(entry.sessions[0].participantCount).toBe(2);
    expect(entry.sessions[0].topName).toBe('Alice');
    expect(entry.sessions[0].topScore).toBe(20);
  });

  test('getHistory never shows another host quizzes', () => {
    const res = fakeRes();
    getHistory({ user: { userId: otherHostId } }, res);

    const ids = res.body.history.map((h) => h.quizId);
    expect(ids).toContain(quizB.id);
    expect(ids).not.toContain(quizA.id);
  });

  test('getHistory leaves out quizzes that were never played', () => {
    const res = fakeRes();
    getHistory({ user: { userId: hostId } }, res);

    const ids = res.body.history.map((h) => h.quizId);
    expect(ids).not.toContain(quizC.id);
  });
});
