// Turns Stryker's reports/mutation/mutation.json into a shields.io endpoint
// badge (reports/mutation/badge.json), published with the demo on GitHub Pages.
import { readFileSync, writeFileSync } from 'node:fs'

const { files } = JSON.parse(readFileSync('reports/mutation/mutation.json', 'utf8'))
const count = { detected: 0, valid: 0 }
for (const { mutants } of Object.values(files)) {
  for (const { status } of mutants) {
    if (status === 'Killed' || status === 'Timeout') count.detected++
    if (['Killed', 'Timeout', 'Survived', 'NoCoverage'].includes(status)) count.valid++
  }
}
const score = Math.floor((1000 * count.detected) / count.valid) / 10
const color = score >= 90 ? 'brightgreen' : score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'

writeFileSync(
  'reports/mutation/badge.json',
  JSON.stringify({ schemaVersion: 1, label: 'mutation score', message: `${score}%`, color }),
)
console.log(`mutation badge: ${score}% (${color})`)
