import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'

/** The page's HTML plus every stylesheet it links, to look for the kit's CSS. */
async function htmlAndCss(path: string) {
  const html = await $fetch<string>(path)
  const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1]!)
  const sheets = await Promise.all(links.map(href => $fetch<string>(href)))
  return html + sheets.join('\n')
}

/** The opening tag of the element with this id ('' when there is none). */
const tag = (html: string, id: string) => html.match(new RegExp(`<[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? ''

describe('default options', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
    browser: true,
  })

  it('server-renders the auto-imported components', async () => {
    const html = await $fetch<string>('/')
    expect(tag(html, 'skeleton')).toContain('vslk-skeleton-container')
    expect(tag(html, 'spinner')).toContain('vslk-spinner-wrapper')
  })

  it('server-renders v-skeleton as a skeleton, with the module config', async () => {
    const html = await $fetch<string>('/')
    const section = tag(html, 'directive')
    expect(section).toContain('vslk-skeletonize')
    expect(section).toContain('aria-busy="true"')
    expect(section).toContain('rgb(4, 5, 6)')
  })

  it('passes the module options to the components', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('rgb(1, 2, 3)')
  })

  it('provides the page progress to the auto-imported usePageProgress()', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('id="progress-state">idle<')
  })

  it('adds the stylesheet', async () => {
    expect(await htmlAndCss('/')).toContain('.vslk-skeletonize')
  })

  it('hydrates without warnings and shows <PageProgress> during a navigation', async () => {
    const page = await createPage()
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') warnings.push(msg.text())
    })
    await page.goto(url('/'), { waitUntil: 'hydration' })

    await page.click('#to-slow')
    await page.waitForSelector('.vslk-page-progress', { timeout: 5000 })
    await page.waitForSelector('#slow')
    await page.waitForSelector('.vslk-page-progress', { state: 'detached', timeout: 5000 })

    expect(warnings.filter(w => /hydration|mismatch|vue-smart-loading-kit/i.test(w))).toEqual([])
    await page.close()
  })
})

describe('prefix and css: false', async () => {
  await setup({ rootDir: fileURLToPath(new URL('./fixtures/prefixed', import.meta.url)) })

  it('registers the components under the prefix only', async () => {
    const html = await $fetch<string>('/')
    expect(tag(html, 'prefixed')).toContain('vslk-skeleton-container')
    // not registered globally either, so <Skeleton> renders nothing of the kit
    expect(tag(html, 'unprefixed')).not.toContain('vslk-')
  })

  it('leaves the stylesheet out', async () => {
    expect(await htmlAndCss('/')).not.toContain('.vslk-skeletonize')
  })
})
