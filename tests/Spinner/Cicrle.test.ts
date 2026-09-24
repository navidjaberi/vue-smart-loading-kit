import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Spinner from "../../src/components/Spinner/Spinner.vue";

describe('Spinner - Circle Variant', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'circle' }
    })

    const circle = wrapper.find('.vslk-spinner-circle')
    expect(circle.exists()).toBe(true)

    const style = (circle.element as HTMLElement).style
        expect(style.width).toBe('40px')
    expect(style.borderWidth).toBe('4px')
    expect(style.borderTopColor).toBe('rgb(59, 130, 246)') 
    expect(style.animationDuration).toBe('1s')
  })

  it('handles custom string sizes without appending extra "px"', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'circle', size: '3rem' }
    })

    const circle = wrapper.find('.vslk-spinner-circle')
    const style = (circle.element as HTMLElement).style
    
    expect(style.width).toBe('3rem') 
  })

  it('handles custom thickness and color', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'circle', thickness: 8, color: '#10b981' }
    })

    const circle = wrapper.find('.vslk-spinner-circle')
    const style = (circle.element as HTMLElement).style
    
    expect(style.borderWidth).toBe('8px')
    expect(style.borderTopColor).toBe('rgb(16, 185, 129)') 
  })

  it('calculates animation duration correctly based on speed multiplier', () => {
    const wrapper = mount(Spinner, {
      props: { type: 'circle', speed: 2 }
    })

    const circle = wrapper.find('.vslk-spinner-circle')
    const style = (circle.element as HTMLElement).style
    
    expect(style.animationDuration).toBe('0.5s')
  })
})
