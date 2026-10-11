const fs = require('fs');
const path = require('path');

// Remove any leftover test database before each test file run,
// so tests always start from a clean, predictable state.
const testDbPath = path.join(__dirname, '../../quizmax.test.db');
if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);

const { quizzes, saveQuiz, removeQuiz } = require('./quizStore');

describe('quizStore persistence', () => {
  test('saveQuiz writes a quiz that can be reloaded from the database', () => {
    const quiz = {
      id: 'test-quiz-1',
      title: 'Sample Quiz',
      description: '',
      timeLimit: 30,
      penaltyPoints: 0,
      joinCode: 'ABC123',
      questions: [],
      createdAt: new Date().toISOString(),
      status: 'waiting',
      hostUserId: 1
    };

    saveQuiz(quiz);
    quizzes[quiz.id] = quiz;

    const db = require('./db');
    const row = db.prepare('SELECT data FROM quizzes WHERE id = ?').get(quiz.id);

    expect(row).toBeDefined();
    const saved = JSON.parse(row.data);
    expect(saved.title).toBe('Sample Quiz');
    expect(saved.hostUserId).toBe(1);
  });

  test('removeQuiz deletes the quiz from the database', () => {
    const quiz = {
      id: 'test-quiz-2',
      title: 'Temporary Quiz',
      joinCode: 'XYZ789',
      questions: [],
      hostUserId: 1
    };

    saveQuiz(quiz);
    removeQuiz(quiz.id);

    const db = require('./db');
    const row = db.prepare('SELECT data FROM quizzes WHERE id = ?').get(quiz.id);

    expect(row).toBeUndefined();
  });
});
