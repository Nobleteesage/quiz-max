const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuiz,
  addQuestion,
  getAllQuizzes,
  deleteQuiz
} = require('../controllers/quizController');

// Quiz CRUD
router.post('/create', createQuiz);
router.get('/all', getAllQuizzes);
router.get('/:quizId', getQuiz);
router.post('/:quizId/question', addQuestion);
router.delete('/:quizId', deleteQuiz);

module.exports = router;
