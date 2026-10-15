import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  validateLogin,
  validateJoin,
  validateQuizForm,
  validateQuestionForm,
  hasErrors
} from '../src/utils/validate.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const en = JSON.parse(readFileSync(join(here, '..', 'src', 'i18n', 'en.json'), 'utf8'))
const ru = JSON.parse(readFileSync(join(here, '..', 'src', 'i18n', 'ru.json'), 'utf8'))

test('login asks for both fields', () => {
  assert.deepEqual(validateLogin({ username: '', password: '' }), {
    username: 'login.errorUsername',
    password: 'login.errorPassword'
  })
  assert.equal(hasErrors(validateLogin({ username: 'anna', password: 'secret' })), false)
})

test('a username of only spaces counts as empty', () => {
  assert.equal(validateLogin({ username: '   ', password: 'x' }).username, 'login.errorUsername')
})

test('join needs a name and a code of exactly 6 characters', () => {
  assert.equal(validateJoin({ name: '', joinCode: 'ABCDEF' }).name, 'join.errorName')
  assert.equal(validateJoin({ name: 'Ann', joinCode: '' }).joinCode, 'join.errorCodeMissing')
  assert.equal(validateJoin({ name: 'Ann', joinCode: 'ABC' }).joinCode, 'join.errorCodeLength')
  assert.equal(hasErrors(validateJoin({ name: 'Ann', joinCode: 'ABCDEF' })), false)
})

test('quiz form checks the title and both numbers', () => {
  const bad = validateQuizForm({ title: ' ', timeLimit: '', penaltyPoints: '-1' })
  assert.equal(bad.title, 'create.errorTitle')
  assert.equal(bad.timeLimit, 'create.errorTime')
  assert.equal(bad.penaltyPoints, 'create.errorPenalty')
  assert.equal(hasErrors(validateQuizForm({ title: 'Quiz', timeLimit: '30', penaltyPoints: '0' })), false)
})

test('time limit must be between 5 and 300', () => {
  assert.equal(validateQuizForm({ title: 'Q', timeLimit: '4', penaltyPoints: '0' }).timeLimit, 'create.errorTime')
  assert.equal(validateQuizForm({ title: 'Q', timeLimit: '301', penaltyPoints: '0' }).timeLimit, 'create.errorTime')
  assert.equal(validateQuizForm({ title: 'Q', timeLimit: '5', penaltyPoints: '0' }).timeLimit, undefined)
})

test('a multiple choice question marks each empty option', () => {
  const errors = validateQuestionForm({
    type: 'multiple_choice',
    text: 'Capital of France?',
    options: ['Paris', '', 'Rome', ' '],
    points: '10'
  })
  assert.deepEqual(errors.options, ['', 'create.errorOption', '', 'create.errorOption'])
  assert.equal(hasErrors(errors), true)
})

test('a true or false question ignores its option boxes', () => {
  const errors = validateQuestionForm({ type: 'true_false', text: 'Water is wet', options: ['', ''], points: '10' })
  assert.equal(hasErrors(errors), false)
})

test('a question needs text and points of at least 1', () => {
  const errors = validateQuestionForm({ type: 'true_false', text: '', options: ['', ''], points: '0' })
  assert.equal(errors.text, 'create.errorQuestionText')
  assert.equal(errors.points, 'create.errorPoints')
})

test('every error text name exists in both languages', () => {
  const names = new Set([
    ...Object.values(validateLogin({ username: '', password: '' })),
    ...Object.values(validateJoin({ name: '', joinCode: '' })),
    validateJoin({ name: 'a', joinCode: 'abc' }).joinCode,
    ...Object.values(validateQuizForm({ title: '', timeLimit: '', penaltyPoints: '' })),
    validateQuestionForm({ type: 'multiple_choice', text: '', options: [''], points: '' }).text,
    validateQuestionForm({ type: 'multiple_choice', text: '', options: [''], points: '' }).points,
    'create.errorOption'
  ])
  for (const name of names) {
    assert.ok(name in en, 'missing in en.json: ' + name)
    assert.ok(name in ru, 'missing in ru.json: ' + name)
  }
})
