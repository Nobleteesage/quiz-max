import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const load = (name) =>
  JSON.parse(readFileSync(join(here, '..', 'src', 'i18n', name + '.json'), 'utf8'))

const REQUIRED_FORMS = { en: ['one', 'other'], ru: ['one', 'few', 'many', 'other'] }
const FORM = /^(.*)\.(zero|one|two|few|many|other)$/

const placeholders = (text) => [...new Set(text.match(/\{\w+\}/g) || [])].sort().join(',')

function group(dict) {
  const plain = {}
  const plural = {}
  for (const [key, text] of Object.entries(dict)) {
    const match = key.match(FORM)
    if (match) {
      plural[match[1]] = plural[match[1]] || {}
      plural[match[1]][match[2]] = text
    } else {
      plain[key] = text
    }
  }
  return { plain, plural }
}

const enDict = load('en')
const dictionaries = { en: group(enDict), ru: group(load('ru')) }

let problems = 0
const fail = (message) => {
  console.error(message)
  problems++
}

const enPlain = dictionaries.en.plain
const ruPlain = dictionaries.ru.plain

for (const key of Object.keys(enPlain)) {
  if (!(key in ruPlain)) {
    fail('Missing in ru.json: ' + key)
    continue
  }
  if (typeof ruPlain[key] !== 'string' || ruPlain[key].trim() === '') {
    fail('Empty text in ru.json: ' + key)
  } else if (placeholders(enPlain[key]) !== placeholders(ruPlain[key])) {
    fail('Placeholders differ between en.json and ru.json: ' + key)
  }
}

for (const key of Object.keys(ruPlain)) {
  if (!(key in enPlain)) fail('Missing in en.json: ' + key)
}

const bases = new Set([
  ...Object.keys(dictionaries.en.plural),
  ...Object.keys(dictionaries.ru.plural)
])

for (const base of bases) {
  const signatures = new Set()
  for (const lang of ['en', 'ru']) {
    const forms = dictionaries[lang].plural[base]
    if (!forms) {
      fail('Missing plural texts in ' + lang + '.json: ' + base)
      continue
    }
    for (const form of REQUIRED_FORMS[lang]) {
      if (typeof forms[form] !== 'string' || forms[form].trim() === '') {
        fail('Missing form "' + form + '" in ' + lang + '.json: ' + base)
      }
    }
    for (const text of Object.values(forms)) signatures.add(placeholders(text))
  }
  if (signatures.size > 1) fail('Placeholders differ between the forms of: ' + base)
}

if (problems > 0) {
  console.error(problems + ' translation problem(s) found')
  process.exit(1)
}

console.log('Translations OK: ' + Object.keys(enDict).length + ' texts in English')
