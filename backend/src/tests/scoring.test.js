// Mirrors the scoring formula used in socketController.js:
// const pointsEarned = isCorrect ? currentQ.points : -quiz.penaltyPoints;
function calculatePoints(isCorrect, questionPoints, penaltyPoints) {
  return isCorrect ? questionPoints : -penaltyPoints;
}

describe('quiz scoring logic', () => {
  test('awards full points for a correct answer', () => {
    expect(calculatePoints(true, 10, 5)).toBe(10);
  });

  test('deducts penalty points for a wrong answer', () => {
    expect(calculatePoints(false, 10, 5)).toBe(-5);
  });

  test('deducts nothing when penalty points are zero', () => {
    expect(calculatePoints(false, 10, 0)).toBe(-0);
  });

  test('handles a question worth zero points correctly', () => {
    expect(calculatePoints(true, 0, 5)).toBe(0);
  });
});
