import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const load = (name) =>
  JSON.parse(readFileSync(join(here, '..', 'src', 'i18n', name + '.json'), 'utf8'))

const en = load('en')
const ru = load('ru')
const placeholders = (text) => (text.match(/\{\w+\}/g) || []).sort().join(',')

let problems = 0

for (const key of Object.keys(en)) {
  if (!(key in ru)) {
    console.error('Missing in ru.json: ' + key)
    problems++
    continue
  }
  if (typeof ru[key] !== 'string' || ru[key].trim() === '') {
    console.error('Empty text in ru.json: ' + key)
    problems++
  } else if (placeholders(en[key]) !== placeholders(ru[key])) {
    console.error('Placeholders differ between en.json and ru.json: ' + key)
    problems++
  }
}

for (const key of Object.keys(ru)) {
  if (!(key in en)) {
    console.error('Missing in en.json: ' + key)
    problems++
  }
}

if (problems > 0) {
  console.error(problems + ' translation problem(s) found')
  process.exit(1)
}

console.log('Translations OK: ' + Object.keys(en).length + ' texts in both languages')
