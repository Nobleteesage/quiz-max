const { v4: uuidv4 } = require('uuid');
const { quizzes } = require('../models/quizStore');

// Create a new quiz
const createQuiz = (req, res) => {
  const { title, description, timeLimit, penaltyPoints } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Quiz title is required' });
  }

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
    status: 'waiting'
  };

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

  res.json({ quiz });
};

// Get all quizzes
const getAllQuizzes = (req, res) => {
  const allQuizzes = Object.values(quizzes);
  res.json({ quizzes: allQuizzes });
};

// Add a question to a quiz
const addQuestion = (req, res) => {
  const { quizId } = req.params;
  const { text, options, correctAnswer, points } = req.body;

  if (!quizzes[quizId]) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  if (!text || !options || correctAnswer === undefined) {
    return res.status(400).json({ error: 'Question text, options and correctAnswer are required' });
  }

  if (options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options are required' });
  }

  const question = {
    id: uuidv4(),
    text,
    options,
    correctAnswer,
    points: points || 10
  };

  quizzes[quizId].questions.push(question);

  res.status(201).json({
    message: 'Question added successfully',
    question
  });
};

// Delete a quiz
const deleteQuiz = (req, res) => {
  const { quizId } = req.params;

  if (!quizzes[quizId]) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  delete quizzes[quizId];
  res.json({ message: 'Quiz deleted successfully' });
};

module.exports = { createQuiz, getQuiz, addQuestion, getAllQuizzes, deleteQuiz };
