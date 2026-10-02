// Workaround for @stryker-mutator/vitest-runner 10.0.0 with Vitest 5.
//
// Stryker selects the tests to run for each mutant with a testNamePattern built
// from "suite test" names joined by a space, but Vitest 5 matches the pattern
// against names joined by " > ". Nothing matches, every test is skipped, and
// every mutant "survives". This rewrites the join in the runner's two copies of
// collectTestName. It is idempotent and runs before `npm run test:mutation`;
// remove it once the runner supports Vitest 5.
import { readFileSync, writeFileSync } from 'node:fs'

const dir = 'node_modules/@stryker-mutator/vitest-runner/dist/src'
const before = "return nameParts.join(' ').trim();"
const after = "return nameParts.filter(Boolean).join(' > ').trim();"

for (const file of ['test-helpers.js', 'stryker-setup.js']) {
  const path = `${dir}/${file}`
  const source = readFileSync(path, 'utf8')
  if (source.includes(after)) continue
  if (!source.includes(before)) {
    throw new Error(`${path}: collectTestName changed; check whether this workaround is still needed`)
  }
  writeFileSync(path, source.replace(before, after))
}
