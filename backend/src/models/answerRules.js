// How many choices a player sees: the written options, plus one more
// when the host switched on "None of the above" for the question.
function choiceCount(question) {
  return question.options.length + (question.noneOption ? 1 : 0);
}

// An answer must be one of the choices that were really shown.
function isValidAnswerIndex(question, answerIndex) {
  return Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < choiceCount(question);
}

module.exports = { choiceCount, isValidAnswerIndex };
