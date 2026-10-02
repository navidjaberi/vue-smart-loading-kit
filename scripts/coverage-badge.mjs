// Turns coverage/coverage-summary.json into a shields.io endpoint badge
// (coverage/badge.json), published with the demo on GitHub Pages.
import { readFileSync, writeFileSync } from 'node:fs'

const { total } = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'))
const pct = total.lines.pct
const color = pct >= 95 ? 'brightgreen' : pct >= 85 ? 'green' : pct >= 70 ? 'yellow' : 'red'

writeFileSync(
  'coverage/badge.json',
  JSON.stringify({ schemaVersion: 1, label: 'coverage', message: `${pct}%`, color }),
)
console.log(`coverage badge: ${pct}% (${color})`)
