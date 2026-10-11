import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const src = join(here, '..', 'src')
const en = JSON.parse(readFileSync(join(src, 'i18n', 'en.json'), 'utf8'))

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return /\.(jsx?|mjs)$/.test(name) ? [full] : []
  })
}

let problems = 0
let used = 0

for (const file of sourceFiles(src)) {
  const code = readFileSync(file, 'utf8')

  for (const match of code.matchAll(/\b(tn?)\(\s*'([\w.]+)'/g)) {
    const key = match[1] === 'tn' ? match[2] + '.other' : match[2]
    used++
    if (!(key in en)) {
      console.error('Text name not in en.json: ' + match[2] + ' (' + file.replace(src, 'src') + ')')
      problems++
    }
  }

  for (const match of code.matchAll(/'(error\.\w+)'/g)) {
    used++
    if (!(match[1] in en)) {
      console.error('Text name not in en.json: ' + match[1] + ' (' + file.replace(src, 'src') + ')')
      problems++
    }
  }
}

if (problems > 0) {
  console.error(problems + ' missing text name(s) found')
  process.exit(1)
}

console.log('Text names OK: ' + used + ' uses checked')
