const { v4: uuidv4 } = require('uuid');
const { quizzes, saveQuiz, removeQuiz } = require('../models/quizStore');
const { createQuizSchema, addQuestionSchema } = require('../validators/quizValidators');

// Create a new quiz
const createQuiz = (req, res) => {
  const parsed = createQuizSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { title, description, timeLimit, penaltyPoints } = parsed.data;
  const quizId = uuidv4();
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  quizzes[quizId] = {
    id: quizId,
    title,
    description: description || '',
    timeLimit: timeLimit || 60,
    penaltyPoints: penaltyPoints || 0,
    joinCode,
    questions: [],
    createdAt: new Date().toISOString(),
    status: 'waiting',
    hostUserId: req.user.userId
  };

  saveQuiz(quizzes[quizId]);

  res.status(201).json({
    message: 'Quiz created successfully',
    quiz: quizzes[quizId]
  });
};

// Get a single quiz
const getQuiz = (req, res) => {
  const { quizId } = req.params;
  const quiz = quizzes[quizId];

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quiz.hostUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Only the quiz host can view this quiz' });
  }

  res.json({ quiz });
};

// Get all quizzes of the logged in host, newest first
const getAllQuizzes = (req, res) => {
  const allQuizzes = Object.values(quizzes)
    .filter((q) => q.hostUserId === req.user.userId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ quizzes: allQuizzes });
};

// Add a question to a quiz
const addQuestion = (req, res) => {
  const { quizId } = req.params;

  if (!quizzes[quizId]) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quizzes[quizId].hostUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Only the quiz host can add questions' });
  }

  const parsed = addQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { text, options, correctAnswer, points, type } = parsed.data;

  const question = {
    id: uuidv4(),
    text,
    options,
    correctAnswer,
    type: type || 'multiple_choice',
    points: points || 10
  };

  quizzes[quizId].questions.push(question);
  saveQuiz(quizzes[quizId]);

  res.status(201).json({
    message: 'Question added successfully',
    question
  });
};

// Remove one question from a quiz
const deleteQuestion = (req, res) => {
  const { quizId, questionId } = req.params;
  const quiz = quizzes[quizId];

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quiz.hostUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Only the quiz host can delete questions' });
  }

  const index = quiz.questions.findIndex((q) => q.id === questionId);
  if (index === -1) {
    return res.status(404).json({ error: 'Question not found' });
  }

  quiz.questions.splice(index, 1);
  saveQuiz(quiz);
  res.json({ message: 'Question deleted successfully' });
};

// Delete a quiz
const deleteQuiz = (req, res) => {
  const { quizId } = req.params;

  if (!quizzes[quizId]) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (quizzes[quizId].hostUserId !== req.user.userId) {
    return res.status(403).json({ error: 'Only the quiz host can delete this quiz' });
  }

  delete quizzes[quizId];
  removeQuiz(quizId);
  res.json({ message: 'Quiz deleted successfully' });
};

module.exports = { createQuiz, getQuiz, addQuestion, getAllQuizzes, deleteQuestion, deleteQuiz };
