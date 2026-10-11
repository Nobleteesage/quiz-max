import test from 'node:test'
import assert from 'node:assert/strict'
import { formatDuration, formatDate } from '../src/i18n/format.mjs'

const fakeT = (key, params) => key + ':' + params.count

test('duration uses the translated unit', () => {
  assert.equal(formatDuration(fakeT, '30s'), 'quiz.secondsShort:30')
})

test('duration keeps unknown text as it is', () => {
  assert.equal(formatDuration(fakeT, 'abc'), 'abc')
})

test('dates are formatted for both languages', () => {
  assert.ok(formatDate('ru', '2026-10-11 07:58:30').includes('2026'))
  assert.ok(formatDate('en', '2026-10-11 07:58:30').includes('2026'))
})

test('a broken date is returned unchanged', () => {
  assert.equal(formatDate('en', 'not a date'), 'not a date')
})
