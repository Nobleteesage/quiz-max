import test from 'node:test'
import assert from 'node:assert/strict'
import { pluralCategory } from '../src/i18n/plural.mjs'

test('russian plural forms', () => {
  const expected = {
    0: 'many', 1: 'one', 2: 'few', 3: 'few', 4: 'few', 5: 'many',
    11: 'many', 12: 'many', 14: 'many', 21: 'one', 22: 'few', 25: 'many',
    101: 'one', 111: 'many'
  }
  for (const [count, form] of Object.entries(expected)) {
    assert.equal(pluralCategory('ru', Number(count)), form, 'ru ' + count)
  }
})

test('english plural forms', () => {
  assert.equal(pluralCategory('en', 1), 'one')
  assert.equal(pluralCategory('en', 0), 'other')
  assert.equal(pluralCategory('en', 2), 'other')
  assert.equal(pluralCategory('en', 5), 'other')
})
