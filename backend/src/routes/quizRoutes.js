const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');
const {
  createQuiz,
  getQuiz,
  addQuestion,
  getAllQuizzes,
  deleteQuiz
} = require('../controllers/quizController');
const { getHistory } = require('../controllers/historyController');

// Quiz CRUD
router.post('/create', requireAuth, createQuiz);
router.get('/all', getAllQuizzes);
router.get('/history', requireAuth, getHistory);
router.get('/:quizId', getQuiz);
router.post('/:quizId/question', requireAuth, addQuestion);
router.delete('/:quizId', requireAuth, deleteQuiz);

module.exports = router;
