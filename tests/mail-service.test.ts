import { describe, expect, it } from 'vitest'
import { sanitizeEmailHtml } from '../src/main/mail-service'

describe('sanitizeEmailHtml', () => {
  it('removes scripts, event handlers and tracking images', () => {
    const result = sanitizeEmailHtml(`
      <div onclick="steal()">Hello<script>alert(1)</script></div>
      <img src="https://tracker.example/pixel.gif" onerror="steal()">
    `)
    expect(result).toContain('Hello')
    expect(result).not.toContain('<script')
    expect(result).not.toContain('<img')
    expect(result).not.toContain('onclick')
    expect(result).not.toContain('tracker.example')
  })

  it('keeps safe links and forces isolated external navigation', () => {
    const result = sanitizeEmailHtml('<a href="https://example.com">Open</a>')
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  it('removes unsafe URL schemes', () => {
    const result = sanitizeEmailHtml('<a href="javascript:alert(1)">Bad</a>')
    expect(result).not.toContain('javascript:')
  })
})
