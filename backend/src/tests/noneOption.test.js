const db = require('../models/db');
const { quizzes, saveQuiz } = require('../models/quizStore');
const { addQuestion } = require('../controllers/quizController');
const { addQuestionSchema } = require('../validators/quizValidators');
const { choiceCount, isValidAnswerIndex } = require('../models/answerRules');

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

const base = { text: 'Which planet is closest to the sun?', options: ['Venus', 'Earth', 'Mars'], points: 10 };

describe('none of the above in the question rules', () => {
  test('a normal question is still accepted without the flag', () => {
    expect(addQuestionSchema.safeParse({ ...base, correctAnswer: 1 }).success).toBe(true);
  });

  test('the extra choice can be the correct answer when it is switched on', () => {
    const parsed = addQuestionSchema.safeParse({ ...base, noneOption: true, correctAnswer: 3 });
    expect(parsed.success).toBe(true);
  });

  test('the extra choice cannot be the correct answer when it is switched off', () => {
    expect(addQuestionSchema.safeParse({ ...base, correctAnswer: 3 }).success).toBe(false);
    expect(addQuestionSchema.safeParse({ ...base, noneOption: false, correctAnswer: 3 }).success).toBe(false);
  });

  test('a position past the extra choice is rejected', () => {
    expect(addQuestionSchema.safeParse({ ...base, noneOption: true, correctAnswer: 4 }).success).toBe(false);
  });

  test('a true or false question cannot have the extra choice', () => {
    const parsed = addQuestionSchema.safeParse({
      type: 'true_false',
      text: 'The sun is a star',
      options: ['True', 'False'],
      correctAnswer: 0,
      noneOption: true
    });
    expect(parsed.success).toBe(false);
  });
});

describe('answers that players may send', () => {
  const plain = { options: ['a', 'b', 'c'] };
  const withNone = { options: ['a', 'b', 'c'], noneOption: true };

  test('counts the shown choices', () => {
    expect(choiceCount(plain)).toBe(3);
    expect(choiceCount(withNone)).toBe(4);
  });

  test('only the shown choices are valid', () => {
    expect(isValidAnswerIndex(plain, 2)).toBe(true);
    expect(isValidAnswerIndex(plain, 3)).toBe(false);
    expect(isValidAnswerIndex(withNone, 3)).toBe(true);
    expect(isValidAnswerIndex(withNone, 4)).toBe(false);
  });

  test('odd values are refused', () => {
    for (const value of [-1, 1.5, '1', null, undefined, NaN]) {
      expect(isValidAnswerIndex(withNone, value)).toBe(false);
    }
  });
});

describe('saving a question with the extra choice', () => {
  const hostId = 7201;
  const quiz = { id: 'none-option-quiz', title: 'None option', hostUserId: hostId, questions: [] };

  beforeEach(() => {
    quiz.questions = [];
    quizzes[quiz.id] = quiz;
    saveQuiz(quiz);
  });

  afterAll(() => {
    delete quizzes[quiz.id];
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(quiz.id);
  });

  test('the flag is stored and survives in the database', () => {
    const res = fakeRes();
    addQuestion({ params: { quizId: quiz.id }, user: { userId: hostId }, body: { ...base, noneOption: true, correctAnswer: 3 } }, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.question.noneOption).toBe(true);
    expect(res.body.question.correctAnswer).toBe(3);

    const saved = JSON.parse(db.prepare('SELECT data FROM quizzes WHERE id = ?').get(quiz.id).data);
    expect(saved.questions[0].noneOption).toBe(true);
  });

  test('a question without the flag stays as it was', () => {
    const res = fakeRes();
    addQuestion({ params: { quizId: quiz.id }, user: { userId: hostId }, body: { ...base, correctAnswer: 0 } }, res);

    expect(res.statusCode).toBe(201);
    expect(res.body.question.noneOption).toBeUndefined();
  });
});
