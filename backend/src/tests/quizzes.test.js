const db = require('../models/db');
const { quizzes, saveQuiz } = require('../models/quizStore');
const { getAllQuizzes, deleteQuestion } = require('../controllers/quizController');
const { closeWaitingSessionsOfQuiz, closeWaitingSessionsOfHost } = require('../models/sessionCleanup');

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

describe('several saved quizzes per host', () => {
  const hostId = 7001;
  const otherHostId = 7002;

  const older = { id: 'multi-old', title: 'Older', questions: [], hostUserId: hostId, createdAt: '2026-10-01T10:00:00.000Z' };
  const newer = { id: 'multi-new', title: 'Newer', questions: [], hostUserId: hostId, createdAt: '2026-10-05T10:00:00.000Z' };
  const foreign = { id: 'multi-foreign', title: 'Not mine', questions: [], hostUserId: otherHostId, createdAt: '2026-10-06T10:00:00.000Z' };

  beforeAll(() => {
    for (const quiz of [older, newer, foreign]) {
      quizzes[quiz.id] = quiz;
      saveQuiz(quiz);
    }
  });

  afterAll(() => {
    for (const quiz of [older, newer, foreign]) {
      delete quizzes[quiz.id];
      db.prepare('DELETE FROM quizzes WHERE id = ?').run(quiz.id);
    }
  });

  test('a host sees all of their own quizzes, newest first', () => {
    const res = fakeRes();
    getAllQuizzes({ user: { userId: hostId } }, res);

    expect(res.body.quizzes.map((q) => q.id)).toEqual(['multi-new', 'multi-old']);
  });

  test('a host never sees the quizzes of another host', () => {
    const res = fakeRes();
    getAllQuizzes({ user: { userId: hostId } }, res);

    expect(res.body.quizzes.find((q) => q.id === 'multi-foreign')).toBeUndefined();
  });
});

describe('deleting a question', () => {
  const hostId = 7101;
  const quiz = {
    id: 'delete-question-quiz',
    title: 'Delete me',
    hostUserId: hostId,
    questions: [{ id: 'q1', text: 'One' }, { id: 'q2', text: 'Two' }]
  };

  beforeEach(() => {
    quiz.questions = [{ id: 'q1', text: 'One' }, { id: 'q2', text: 'Two' }];
    quizzes[quiz.id] = quiz;
    saveQuiz(quiz);
  });

  afterAll(() => {
    delete quizzes[quiz.id];
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(quiz.id);
  });

  test('the owner can remove a question and the change is saved', () => {
    const res = fakeRes();
    deleteQuestion({ params: { quizId: quiz.id, questionId: 'q1' }, user: { userId: hostId } }, res);

    expect(res.statusCode).toBe(200);
    expect(quizzes[quiz.id].questions.map((q) => q.id)).toEqual(['q2']);

    const saved = JSON.parse(db.prepare('SELECT data FROM quizzes WHERE id = ?').get(quiz.id).data);
    expect(saved.questions.map((q) => q.id)).toEqual(['q2']);
  });

  test('another host cannot remove a question', () => {
    const res = fakeRes();
    deleteQuestion({ params: { quizId: quiz.id, questionId: 'q1' }, user: { userId: 9999 } }, res);

    expect(res.statusCode).toBe(403);
    expect(quizzes[quiz.id].questions).toHaveLength(2);
  });

  test('an unknown question gives a 404', () => {
    const res = fakeRes();
    deleteQuestion({ params: { quizId: quiz.id, questionId: 'nope' }, user: { userId: hostId } }, res);

    expect(res.statusCode).toBe(404);
  });
});

describe('closing stale waiting sessions', () => {
  test('a new session of a quiz closes the older waiting one but not a running one', () => {
    const sessions = {
      a: { id: 'a', quizId: 'q1', hostId: 'h1', status: 'waiting' },
      b: { id: 'b', quizId: 'q1', hostId: 'h2', status: 'active' },
      c: { id: 'c', quizId: 'q2', hostId: 'h3', status: 'waiting' }
    };

    const closed = closeWaitingSessionsOfQuiz(sessions, 'q1');

    expect(closed).toEqual(['a']);
    expect(Object.keys(sessions).sort()).toEqual(['b', 'c']);
  });

  test('a host who leaves closes only their own waiting sessions', () => {
    const sessions = {
      a: { id: 'a', quizId: 'q1', hostId: 'h1', status: 'waiting' },
      b: { id: 'b', quizId: 'q2', hostId: 'h1', status: 'active' },
      c: { id: 'c', quizId: 'q3', hostId: 'h2', status: 'waiting' }
    };

    closeWaitingSessionsOfHost(sessions, 'h1');

    expect(Object.keys(sessions).sort()).toEqual(['b', 'c']);
  });
});
