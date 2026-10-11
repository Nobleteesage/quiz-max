const { csvSafeText } = require('../controllers/exportController');

describe('csv export safety', () => {
  test('wraps a normal name in quotes', () => {
    expect(csvSafeText('Alice')).toBe('"Alice"');
  });

  test('neutralises a name that would run as a formula', () => {
    expect(csvSafeText('=SUM(A1)')).toBe('"\'=SUM(A1)"');
  });

  test('doubles quotes inside a name', () => {
    expect(csvSafeText('say "hi"')).toBe('"say ""hi"""');
  });

  test('keeps Cyrillic names intact', () => {
    expect(csvSafeText('Иван')).toBe('"Иван"');
  });
});
