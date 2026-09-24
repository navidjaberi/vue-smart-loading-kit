import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Spinner from "../../src/components/Spinner/Spinner.vue";

const durationOf = (speed: number) => 1 / speed
const gapOf = (size: number) => size / 5.5

describe('Spinner - Dots Variant', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'dots' }
    })

    const container = wrapper.find('.vslk-spinner-dots')
    expect(container.exists()).toBe(true)

    const dots = wrapper.findAll('.vslk-spinner-dots span')
    expect(dots).toHaveLength(3)

    const gap = parseFloat((container.element as HTMLElement).style.gap)
    expect(gap).toBeCloseTo(gapOf(40), 6) // 7.272727...

    const d0 = (dots[0].element as HTMLElement).style
    const d1 = (dots[1].element as HTMLElement).style
    const d2 = (dots[2].element as HTMLElement).style

    expect(d0.width).toBe('10px')
    expect(d0.height).toBe('10px')
    expect(d0.backgroundColor).toBe('rgb(59, 130, 246)') // #3b82f6
    expect(d0.animationDuration).toBe('1s')

    // delay is staggered by index; first dot starts at 0
    expect(d0.animationDelay).toBe('0s')
    expect(d1.animationDelay).toBe('0.15s')
    expect(d2.animationDelay).toBe('0.3s')
  })

  it('handles custom string sizes and calculates dot size correctly', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'dots', size: '80px' }
    })

    const container = wrapper.find('.vslk-spinner-dots')
    const firstDot = wrapper.find('.vslk-spinner-dots span')

    const gap = parseFloat((container.element as HTMLElement).style.gap)
    expect(gap).toBeCloseTo(gapOf(80), 6) // 14.545454...

    expect((firstDot.element as HTMLElement).style.width).toBe('20px')
  })

  it('synchronizes animation delays with custom speed', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'dots', speed: 2 }
    })

    const dots = wrapper.findAll('.vslk-spinner-dots span')
    const d0 = (dots[0].element as HTMLElement).style
    const d1 = (dots[1].element as HTMLElement).style
    const d2 = (dots[2].element as HTMLElement).style

    const duration = durationOf(2) // 0.5

    expect(d0.animationDuration).toBe(`${duration}s`)
    expect(d0.animationDelay).toBe('0s')
    expect(d1.animationDelay).toBe(`${duration * 0.15}s`) // 0.075s
    expect(d2.animationDelay).toBe(`${duration * 0.3}s`)  // 0.15s
  })
})
