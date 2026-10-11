const { csvSafeText, formatTaken, HEADERS } = require('../controllers/exportController');

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

describe('csv export languages', () => {
  test('russian files show the time unit in russian', () => {
    expect(formatTaken('30s', 'ru')).toBe('30 с');
  });

  test('english files keep the time as stored', () => {
    expect(formatTaken('30s', 'en')).toBe('30s');
  });

  test('both languages have the same number of columns', () => {
    expect(HEADERS.ru.length).toBe(HEADERS.en.length);
  });
});
